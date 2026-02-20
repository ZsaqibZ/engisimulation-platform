import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/mongodb';
import Bookmark from '@/models/Bookmark';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { project_id } = await request.json();
        await dbConnect();

        const booking = await Bookmark.create({
            user_id: (session.user as any).id,
            project_id,
        });

        return NextResponse.json({ success: true, data: booking });
    } catch (error: any) {
        // Duplicate key error
        if (error.code === 11000) {
            return NextResponse.json({ success: false, error: "Already bookmarked" }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { project_id } = await request.json();
        await dbConnect();

        await Bookmark.deleteMany({
            user_id: (session.user as any).id,
            project_id,
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('project_id');

        await dbConnect();

        if (projectId) {
            const bookmark = await Bookmark.findOne({
                user_id: (session.user as any).id,
                project_id: projectId
            });
            return NextResponse.json({ success: true, saved: !!bookmark });
        }

        return NextResponse.json({ success: false, error: "Missing project_id" }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
