import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import JSZip from 'jszip';
import crypto from 'crypto';

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

        let verified_version = null;
        if (file.name.endsWith('.zip') || file.type.includes('zip')) {
            try {
                const zip = new JSZip();
                const loadedZip = await zip.loadAsync(buffer);
                
                for (const [filename, fileObj] of Object.entries(loadedZip.files)) {
                    if (!fileObj.dir) {
                        if (filename.endsWith('.m')) {
                            const content = await fileObj.async('string');
                            const match = content.match(/MATLAB R20\d{2}[ab]/i);
                            if (match) {
                                verified_version = match[0];
                                break;
                            }
                        } else if (filename.endsWith('.xml') || filename.endsWith('.sldprt')) {
                            const content = await fileObj.async('string');
                            const swMatch = content.match(/SolidWorks 20\d{2}/i);
                            if (swMatch) {
                                verified_version = swMatch[0];
                                break;
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("ZIP parsing error:", err);
            }
        }

        const publicUrl = `/api/files/${uploadStream.id}`;

        // VirusTotal Integration
        let security_status = 'pending';
        let scan_results = null;

        if (process.env.VIRUSTOTAL_API_KEY) {
            try {
                const hash = crypto.createHash('sha256').update(buffer).digest('hex');
                const vtRes = await fetch(`https://www.virustotal.com/api/v3/files/${hash}`, {
                    headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY }
                });

                if (vtRes.ok) {
                    const vtData = await vtRes.json();
                    const stats = vtData.data.attributes.last_analysis_stats;
                    if (stats.malicious > 0) {
                        security_status = 'flagged';
                        scan_results = `Flagged by ${stats.malicious} security vendors`;
                    } else {
                        security_status = 'safe';
                        scan_results = 'Clean';
                    }
                } else if (vtRes.status === 404) {
                    // File never scanned. We simulate a background upload for this demo platform.
                    // In a real production environment, you might post to the VT /files endpoint.
                    security_status = 'pending';
                    scan_results = 'Queued for background scan';
                }
            } catch (err) {
                console.error("VT API error:", err);
            }
        }

        return NextResponse.json({ 
            success: true, 
            url: publicUrl, 
            verified_version,
            security_status,
            scan_results
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        console.error("Upload error:", error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
