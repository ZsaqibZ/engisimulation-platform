import mongoose, { Schema, model, models } from 'mongoose';

const CollectionSchema = new Schema({
    userId: {
        type: String, // String because NextAuth session.user.id is often a string
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

const Collection = models.Collection || model('Collection', CollectionSchema);

export default Collection;
