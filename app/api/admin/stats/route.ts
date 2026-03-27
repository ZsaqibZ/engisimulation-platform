import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import User from '@/models/User';
import Bounty from '@/models/Bounty';

// Prevent caching to ensure live stats
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await dbConnect();

        const totalProjects = await Project.countDocuments();
        const flaggedProjects = await Project.countDocuments({ security_status: 'flagged' });
        
        const totalUsers = await User.countDocuments();
        const totalBounties = await Bounty.countDocuments();
        const openBounties = await Bounty.countDocuments({ status: 'open' });

        return NextResponse.json({ 
            success: true, 
            data: {
                totalProjects,
                flaggedProjects,
                totalUsers,
                totalBounties,
                openBounties
            } 
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
