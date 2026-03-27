import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/mongodb';
import Collection from '@/models/Collection';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const userId = (session.user as any).id;

        // Populate projects to get full details for the collections dashboard
        const collections = await Collection.find({ userId })
            .populate('projects', 'title software_type file_url _id')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, collections });
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

        await dbConnect();
        const userId = (session.user as any).id;
        const { name, projectId, collectionId, action } = await request.json();

        // Standard: Create a new collection
        if (action === 'create') {
            const newCollection = await Collection.create({
                userId,
                name,
                projects: projectId ? [projectId] : []
            });
            return NextResponse.json({ success: true, collection: newCollection });
        }

        // Add or Remove project from a specific collection
        if (action === 'toggle' && collectionId && projectId) {
            const collection = await Collection.findOne({ _id: collectionId, userId });
            if (!collection) {
                return NextResponse.json({ error: "Collection not found" }, { status: 404 });
            }

            const projectIndex = collection.projects.indexOf(projectId);
            if (projectIndex > -1) {
                // Remove it
                collection.projects.splice(projectIndex, 1);
            } else {
                // Add it
                collection.projects.push(projectId);
            }
            collection.updatedAt = new Date();
            await collection.save();

            return NextResponse.json({ success: true, collection });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
