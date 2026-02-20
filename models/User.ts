import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String, select: false },
    emailVerified: { type: Date },
    image: { type: String },
    // Extended fields
    full_name: { type: String },
    job_title: { type: String },
    company: { type: String },
    location: { type: String },
    linkedin_url: { type: String },
    createdAt: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
}, { timestamps: true });

const User = models.User || model('User', UserSchema);

export default User;
