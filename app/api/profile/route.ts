import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById((session.user as any).id);

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
        id: user._id,
        email: user.email,
        full_name: user.full_name || user.name,
        job_title: user.job_title,
        website: user.website,
        avatar_url: user.avatar_url || user.image,
    });
}

export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { full_name, job_title, website, avatar_url } = await request.json();
        const userId = (session.user as any).id;

        await dbConnect();

        const updatedUser = await User.findByIdAndUpdate(userId, {
            name: full_name, // Sync with name
            full_name,
            job_title,
            website,
            avatar_url,
            image: avatar_url // Keep image synced
        }, { new: true });

        return NextResponse.json({ success: true, user: updatedUser });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
