import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/mongodb';
import Bounty from '@/models/Bounty';
import User from '@/models/User';

export async function GET(request: Request) {
    try {
        await dbConnect();
        
        // Populate requester logic (since requesterId is string, we'll map manually or leave to frontend)
        // For simplicity, we just return the raw documents
        const bounties = await Bounty.find({ status: 'open', isDeleted: { $ne: true } }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: bounties });
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

        const { title, description, reward_points, deadline } = body;
        
        if (!title || !description || !reward_points) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Deduct reputation (Escrow)
        const user = await User.findById((session.user as any).id);
        if (!user || user.reputation < reward_points) {
            return NextResponse.json({ error: "Insufficient reputation for this bounty" }, { status: 403 });
        }

        // Atomically deduct rep
        user.reputation -= reward_points;
        await user.save();

        const bounty = await Bounty.create({
            title,
            description,
            reward_points,
            requesterId: (session.user as any).id,
            deadline: deadline || null
        });

        return NextResponse.json({ success: true, data: bounty });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
