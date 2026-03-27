// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email"; // <-- Added import
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb-adapter";
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // <-- Added Email Provider for Magic Links -->
    EmailProvider({
      server: {
        host: "smtp.zoho.com",
        port: 465,
        auth: {
          user: process.env.ZOHO_MAIL_USER,
          pass: process.env.ZOHO_MAIL_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await dbConnect();
        const user = await User.findOne({ email: credentials.email }).select('+password +verificationToken');

        if (!user || !user.password) { // User might be OAuth only
          return null;
        }

        // Block sign-in if email is not verified
        if (!user.emailVerified) {
          throw new Error('EMAIL_NOT_VERIFIED');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name || user.full_name, // fallback
          email: user.email,
          image: user.image
        };
      }
    }),
  ],
  pages: {
    signIn: '/login',
    newUser: '/login?view=sign-up',
    verifyRequest: '/auth/verify-request', // <-- Added to redirect users after they ask for a magic link
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        
        try {
          await dbConnect();
          const dbUser = await User.findById(token.sub).select('reputation role username').lean() as any;
          if (dbUser) {
            (session.user as any).reputation = dbUser.reputation || 0;
            (session.user as any).role = dbUser.role || 'user';
            (session.user as any).username = dbUser.username;
          }
        } catch (e) {
          console.error("Session callback DB error:", e);
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};