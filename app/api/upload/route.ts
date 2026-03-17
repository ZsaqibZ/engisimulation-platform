import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        await dbConnect();
        const db = mongoose.connection.db;
        if (!db) {
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });

        const uploadStream = bucket.openUploadStream(file.name, {
            contentType: file.type,
        });

        await new Promise((resolve, reject) => {
            uploadStream.end(buffer).on('error', reject).on('finish', resolve);
        });

        const publicUrl = `/api/files/${uploadStream.id}`;

        return NextResponse.json({ success: true, url: publicUrl });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        console.error("Upload error:", error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
