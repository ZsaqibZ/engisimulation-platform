import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OpenAI from 'openai';
export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const software = searchParams.get('software');
    const limit = searchParams.get('limit');

    const query: any = { isDeleted: { $ne: true } };
    if (software && software !== 'All') {
      query.software_type = software;
    }

    let projects = Project.find(query).sort({ createdAt: -1 });
    if (limit) projects = projects.limit(parseInt(limit));

    const data = await projects.exec();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    await dbConnect();

    let embedding: number[] | undefined = undefined;
    try {
      if (process.env.OPENAI_API_KEY) {
        const openai = new OpenAI();
        const response = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: `${body.title}\n${body.description}`,
        });
        embedding = response.data[0].embedding;
      }
    } catch (error) {
      console.error("OpenAI Embedding generation failed:", error);
    }

    const project = await Project.create({
      title: body.title,
      description: body.description,
      software_type: body.software_type,
      tags: body.tags,
      youtube_url: body.youtube_url,
      file_url: body.file_url,
      screenshots: body.screenshots || [],
      author_id: (session.user as any).id,
      verified_version: body.verified_version || null,
      security_status: body.security_status || 'pending',
      scan_results: body.scan_results || null,
      embedding
    });

    return NextResponse.json({ success: true, data: project });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}