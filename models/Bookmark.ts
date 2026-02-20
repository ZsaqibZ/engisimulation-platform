import mongoose, { Schema, model, models } from 'mongoose';

const BookmarkSchema = new Schema({
    user_id: {
        type: String,
        required: true,
    },
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Compound index to ensure a user can only bookmark a project once
BookmarkSchema.index({ user_id: 1, project_id: 1 }, { unique: true });

const Bookmark = models.Bookmark || model('Bookmark', BookmarkSchema);

export default Bookmark;
