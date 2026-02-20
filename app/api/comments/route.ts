import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/mongodb';
import Comment from '@/models/Comment';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('project_id');

        if (!projectId) {
            return NextResponse.json({ success: false, error: "Missing project_id" }, { status: 400 });
        }

        await dbConnect();
        const comments = await Comment.find({ project_id: projectId }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: comments });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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

        const comment = await Comment.create({
            user_id: (session.user as any).id,
            project_id: body.project_id,
            content: body.content,
            user_name: session.user?.name,
            user_image: session.user?.image
        });

        return NextResponse.json({ success: true, data: comment });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
