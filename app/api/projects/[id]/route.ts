import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { id } = await params
        await dbConnect();

        const project = await Project.findById(id);

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Check ownership
        if (project.author_id !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await Project.deleteOne({ _id: id });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { id } = await params
        await dbConnect();

        const data = await request.json();

        const project = await Project.findById(id);

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Check ownership
        if (project.author_id !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Update fields
        project.title = data.title || project.title;
        project.description = data.description || project.description;
        project.youtube_url = data.youtube_url || project.youtube_url;
        project.screenshots = data.screenshots || project.screenshots;
        // software_type and tags could also be updated if needed, but EditForm mainly sends these.
        // If EditForm sends them, we should update them.
        // EditForm.tsx sends: title, description, youtube_url, screenshots.

        await project.save();

        return NextResponse.json({ success: true, project });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
