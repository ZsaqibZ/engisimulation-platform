import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/mongodb';
import Like from '@/models/Like';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('project_id');
        const checkUser = searchParams.get('check_user') === 'true';

        if (!projectId) {
            return NextResponse.json({ success: false, error: "Missing project_id" }, { status: 400 });
        }

        await dbConnect();

        const count = await Like.countDocuments({ project_id: projectId });

        let hasLiked = false;
        if (checkUser) {
            const session = await getServerSession(authOptions);
            if (session) {
                const exists = await Like.exists({
                    project_id: projectId,
                    user_id: (session.user as any).id
                });
                hasLiked = !!exists;
            }
        }

        return NextResponse.json({ success: true, count, hasLiked });
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

        // Check if already liked
        const exists = await Like.findOne({
            project_id: body.project_id,
            user_id: (session.user as any).id
        });

        if (exists) {
            // Toggle off (unlike)
            await Like.deleteOne({ _id: exists._id });
            return NextResponse.json({ success: true, action: 'unliked' });
        } else {
            // Liked
            await Like.create({
                user_id: (session.user as any).id,
                project_id: body.project_id
            });
            return NextResponse.json({ success: true, action: 'liked' });
        }

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
