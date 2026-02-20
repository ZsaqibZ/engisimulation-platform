import mongoose, { Schema, model, models } from 'mongoose';

const CommentSchema = new Schema({
    user_id: {
        type: String,
        required: true,
    },
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    user_name: {
        type: String,
        required: false
    },
    user_image: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Comment = models.Comment || model('Comment', CommentSchema);

export default Comment;
