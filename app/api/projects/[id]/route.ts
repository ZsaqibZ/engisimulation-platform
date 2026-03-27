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

        if (!project || project.isDeleted) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Check ownership
        if (project.author_id !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Soft Delete
        await Project.findByIdAndUpdate(id, { $set: { isDeleted: true, deletedAt: new Date() } });

        return NextResponse.json({ success: true, message: "Project deleted successfully" });
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
        
        // Version history update
        if (data.new_file_url) {
            project.versions.push({
                version_string: project.current_version || 'v1.0',
                file_url: project.file_url,
                changelog: "Archived previous version to make room for update.",
                uploaded_at: new Date()
            });

            project.file_url = data.new_file_url;
            project.current_version = data.version_string || `v${project.versions.length + 1}.0`;
            if (data.verified_version) project.verified_version = data.verified_version;
        }

        await project.save();

        return NextResponse.json({ success: true, project });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
