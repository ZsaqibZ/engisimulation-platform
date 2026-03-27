import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/mongodb';
import Bounty from '@/models/Bounty';
import User from '@/models/User';
import Project from '@/models/Project';

export async function POST(request: Request, context: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;
        const body = await request.json();
        const { projectId } = body;

        await dbConnect();

        const bounty = await Bounty.findById(id);
        if (!bounty) return NextResponse.json({ error: "Bounty not found" }, { status: 404 });
        
        if (bounty.status !== 'open') {
            return NextResponse.json({ error: "Bounty is no longer open" }, { status: 400 });
        }

        if (bounty.requesterId !== (session.user as any).id) {
            return NextResponse.json({ error: "Forbidden: Only the requester can mark this as solved" }, { status: 403 });
        }

        const project = await Project.findById(projectId);
        if (!project) return NextResponse.json({ error: "Solution project not found" }, { status: 404 });

        // Update Bounty
        bounty.status = 'completed';
        bounty.solutionProjectId = project._id;
        bounty.solverId = project.author_id;
        await bounty.save();

        // Transfer Escrow
        await User.findByIdAndUpdate(project.author_id, { $inc: { reputation: bounty.reward_points } });

        return NextResponse.json({ success: true, data: bounty });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
