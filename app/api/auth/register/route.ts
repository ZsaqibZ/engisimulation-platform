import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { email, password, firstName, lastName } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            email,
            password: hashedPassword,
            name: `${firstName} ${lastName}`.trim(),
            full_name: `${firstName} ${lastName}`.trim(),
            emailVerified: null,
        });

        // Send welcome email via Resend (non-blocking — never fails the signup)
        try {
            const displayName = firstName || email.split('@')[0];
            await resend.emails.send({
                from: `EngiSimulation <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
                to: email,
                subject: 'Welcome to EngiSimulation 🚀',
                html: `
                <!DOCTYPE html>
                <html lang="en">
                <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
                <body style="margin:0;padding:0;background-color:#020617;font-family:'Segoe UI',Arial,sans-serif;">
                  <div style="max-width:580px;margin:40px auto;background-color:#0f172a;border:1px solid #1e293b;border-radius:16px;overflow:hidden;">
                    
                    <!-- Header -->
                    <div style="background:linear-gradient(135deg,#1e3a5f,#1e293b);padding:40px 40px 32px;text-align:center;border-bottom:1px solid #1e293b;">
                      <div style="font-size:36px;margin-bottom:12px;">⚡</div>
                      <h1 style="margin:0;font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">EngiSimulation</h1>
                      <p style="margin:8px 0 0;font-size:12px;color:#64748b;letter-spacing:3px;text-transform:uppercase;font-weight:600;">Engineering Simulation Platform</p>
                    </div>

                    <!-- Body -->
                    <div style="padding:40px;">
                      <h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#f1f5f9;">Welcome aboard, ${displayName}! 👋</h2>
                      <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#94a3b8;">
                        Your account has been created successfully. You now have access to a curated library of verified engineering simulation models — from MATLAB/Simulink to ANSYS, LabVIEW, and beyond.
                      </p>

                      <!-- CTA Button -->
                      <div style="text-align:center;margin:32px 0;">
                        <a href="https://engisimulation.vercel.app/library" style="display:inline-block;padding:14px 36px;background-color:#2563eb;color:#ffffff;font-weight:700;font-size:15px;text-decoration:none;border-radius:10px;letter-spacing:0.3px;">
                          Explore the Library →
                        </a>
                      </div>

                      <!-- Quick links -->
                      <div style="background-color:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:20px;margin-top:24px;">
                        <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:2px;">Get Started</p>
                        <p style="margin:0 0 8px;font-size:14px;color:#94a3b8;">🔬 <a href="https://engisimulation.vercel.app/library" style="color:#60a5fa;text-decoration:none;">Browse verified simulations</a></p>
                        <p style="margin:0 0 8px;font-size:14px;color:#94a3b8;">📤 <a href="https://engisimulation.vercel.app/upload" style="color:#60a5fa;text-decoration:none;">Upload your first project</a></p>
                        <p style="margin:0;font-size:14px;color:#94a3b8;">👤 <a href="https://engisimulation.vercel.app/my-projects" style="color:#60a5fa;text-decoration:none;">View your projects</a></p>
                      </div>
                    </div>

                    <!-- Footer -->
                    <div style="padding:24px 40px;border-top:1px solid #1e293b;text-align:center;">
                      <p style="margin:0;font-size:12px;color:#334155;">You received this email because you signed up at EngiSimulation.</p>
                      <p style="margin:8px 0 0;font-size:12px;color:#334155;">© 2026 EngiSimulation. All rights reserved.</p>
                    </div>
                  </div>
                </body>
                </html>
                `
            });
        } catch (emailError) {
            // Log email failure but don't block the signup
            console.error('Failed to send welcome email:', emailError);
        }

        return NextResponse.json({ success: true, user: { id: user._id, email: user.email } });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
