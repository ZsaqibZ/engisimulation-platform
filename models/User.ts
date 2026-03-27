import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String, select: false },
    emailVerified: { type: Date },
    verificationToken: { type: String, select: false },
    verificationTokenExpires: { type: Date, select: false },
    image: { type: String },
    // Extended fields
    full_name: { type: String },
    job_title: { type: String },
    company: { type: String },
    location: { type: String },
    linkedin_url: { type: String },
    username: { type: String, unique: true, sparse: true },
    bio: { type: String, maxlength: 500 },
    website: { type: String },
    github_url: { type: String },
    reputation: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
}, { timestamps: true });

const User = models.User || model('User', UserSchema);

export default User;
