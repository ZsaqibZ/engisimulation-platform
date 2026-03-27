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
        // Since we want standard ascending order for threads
        const comments = await Comment.find({ project_id: projectId, isDeleted: { $ne: true } }).sort({ createdAt: 1 });

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
            user_image: session.user?.image,
            parentCommentId: body.parentCommentId || null
        });

        return NextResponse.json({ success: true, data: comment });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        await dbConnect();

        const { comment_id, isAcceptedSolution } = body;
        if (!comment_id) return NextResponse.json({ error: "Missing comment_id" }, { status: 400 });

        // Retrieve the comment and then its project
        const comment = await Comment.findById(comment_id);
        if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

        // Note: Project ownership check should technically be verified here by querying the project
        // and comparing author_id to session.user.id. Since the UI only shows the button to the author,
        // we'll explicitly check author here for security.
        const mongoose = require('mongoose');
        const Project = mongoose.model('Project');
        const project = await Project.findById(comment.project_id);
        
        if (project.author_id !== (session.user as any).id) {
            return NextResponse.json({ error: "Forbidden: Not the project author" }, { status: 403 });
        }

        comment.isAcceptedSolution = isAcceptedSolution;
        await comment.save();

        return NextResponse.json({ success: true, data: comment });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
