import { Schema, model, models } from 'mongoose';

const LikeSchema = new Schema({
    user_id: {
        type: String,
        required: true,
    },
    project_id: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

LikeSchema.index({ user_id: 1, project_id: 1 }, { unique: true });

const Like = models.Like || model('Like', LikeSchema);

export default Like;
