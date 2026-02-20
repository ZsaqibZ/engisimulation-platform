import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const software = searchParams.get('software');
    const limit = searchParams.get('limit');

    const query: any = {};
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

    const project = await Project.create({
      title: body.title,
      description: body.description,
      software_type: body.software_type,
      tags: body.tags,
      youtube_url: body.youtube_url,
      file_url: body.file_url,
      screenshots: body.screenshots || [],
      author_id: (session.user as any).id
    });

    return NextResponse.json({ success: true, data: project });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}