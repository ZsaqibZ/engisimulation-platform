import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    const existingUser = await User.findOne({ email }).select('+verificationToken +emailVerified');
    if (existingUser) {
      // If the user exists but is unverified, resend the verification email
      if (!existingUser.emailVerified) {
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        existingUser.verificationToken = token;
        existingUser.verificationTokenExpires = expires;
        await existingUser.save();
        await sendVerificationEmail(email, firstName || email.split('@')[0], token);
        return NextResponse.json({
          success: true,
          message: 'A new verification email has been sent. Please check your inbox.'
        });
      }
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a secure verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user — emailVerified is null, they cannot sign in yet
    await User.create({
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`.trim(),
      full_name: `${firstName} ${lastName}`.trim(),
      emailVerified: null,
      verificationToken: token,
      verificationTokenExpires: expires,
    });

    // Send verification email
    await sendVerificationEmail(email, firstName || email.split('@')[0], token);

    return NextResponse.json({
      success: true,
      message: 'Account created. Please check your email to verify your account before signing in.'
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

async function sendVerificationEmail(email: string, displayName: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://engisimulation.vercel.app';
  const verifyUrl = `${baseUrl}/api/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
  const fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  try {
    await resend.emails.send({
      from: `EngiSimulation <${fromAddress}>`,
      to: email,
      subject: 'Verify your EngiSimulation account',
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
                  <p style="margin:8px 0 0;font-size:12px;color:#64748b;letter-spacing:3px;text-transform:uppercase;font-weight:600;">Email Verification</p>
                </div>

                <!-- Body -->
                <div style="padding:40px;">
                  <h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#f1f5f9;">Hi ${displayName} 👋</h2>
                  <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#94a3b8;">
                    Thanks for signing up! Please verify your email address to activate your account and access the engineering simulation library.
                  </p>

                  <!-- Main CTA -->
                  <div style="text-align:center;margin:32px 0;">
                    <a href="${verifyUrl}" style="display:inline-block;padding:16px 40px;background-color:#2563eb;color:#ffffff;font-weight:700;font-size:16px;text-decoration:none;border-radius:10px;letter-spacing:0.3px;">
                      ✓ Verify My Email
                    </a>
                  </div>

                  <p style="margin:24px 0 0;font-size:13px;color:#64748b;text-align:center;">
                    This link expires in <strong style="color:#94a3b8;">24 hours</strong>. If you didn't sign up, you can safely ignore this email.
                  </p>

                  <!-- Fallback link -->
                  <div style="margin-top:28px;padding:16px;background-color:#020617;border:1px solid #1e293b;border-radius:8px;">
                    <p style="margin:0 0 8px;font-size:11px;color:#475569;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Or copy this link:</p>
                    <p style="margin:0;font-size:12px;color:#60a5fa;word-break:break-all;">${verifyUrl}</p>
                  </div>
                </div>

                <!-- Footer -->
                <div style="padding:24px 40px;border-top:1px solid #1e293b;text-align:center;">
                  <p style="margin:0;font-size:12px;color:#334155;">© 2026 EngiSimulation. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
            `
    });
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError);
    throw new Error('Failed to send verification email. Please try again.');
  }
}
