import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: fileId } = await params;

        await dbConnect();
        const db = mongoose.connection.db;
        if (!db) {
            return new NextResponse("Database error", { status: 500 });
        }

        const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });

        let objectId;
        try {
            objectId = new mongoose.mongo.ObjectId(fileId);
        } catch {
            return new NextResponse("Invalid file ID", { status: 400 });
        }

        const files = await bucket.find({ _id: objectId }).toArray();
        if (!files.length) {
            return new NextResponse("File not found", { status: 404 });
        }
        const file = files[0];

        const stream = bucket.openDownloadStream(objectId);

        const readable = new ReadableStream({
            start(controller) {
                stream.on('data', (chunk) => controller.enqueue(chunk));
                stream.on('end', () => controller.close());
                stream.on('error', (err) => controller.error(err));
            }
        });

        const headers = new Headers();
        if (file.length) headers.set('Content-Length', file.length.toString());
        if (file.contentType) headers.set('Content-Type', file.contentType);

        // Cache files indefinitely since they are immutable in GridFS (new uploads get new IDs)
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');

        return new NextResponse(readable, { headers });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        console.error("File download error:", error);
        return new NextResponse(message, { status: 500 });
    }
}
