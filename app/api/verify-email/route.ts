import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
        return NextResponse.redirect(new URL('/verify-email?status=invalid', request.url));
    }

    try {
        await dbConnect();

        const user = await User.findOne({ email }).select('+verificationToken +verificationTokenExpires');

        if (!user) {
            return NextResponse.redirect(new URL('/verify-email?status=invalid', request.url));
        }

        if (user.emailVerified) {
            // Already verified — redirect to login
            return NextResponse.redirect(new URL('/login?verified=already', request.url));
        }

        if (user.verificationToken !== token) {
            return NextResponse.redirect(new URL('/verify-email?status=invalid', request.url));
        }

        if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
            return NextResponse.redirect(new URL('/verify-email?status=expired', request.url));
        }

        // Mark as verified and clear token
        user.emailVerified = new Date();
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        return NextResponse.redirect(new URL('/login?verified=true', request.url));

    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.redirect(new URL('/verify-email?status=error', request.url));
    }
}
