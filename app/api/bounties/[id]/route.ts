import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Bounty from '@/models/Bounty';

export async function GET(request: Request, context: any) {
    try {
        const { id } = await context.params;
        await dbConnect();
        
        const bounty = await Bounty.findById(id).lean() as any;
        if (!bounty || bounty.isDeleted) {
            return NextResponse.json({ error: "Bounty not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: bounty });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
