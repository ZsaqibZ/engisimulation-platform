import mongoose, { Schema, model, models } from 'mongoose';

const BountySchema = new Schema({
    title: {
        type: String,
        required: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
    },
    reward_points: {
        type: Number,
        required: true,
        default: 50
    },
    requesterId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['open', 'completed', 'cancelled'],
        default: 'open'
    },
    solutionProjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        default: null
    },
    solverId: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    deadline: {
        type: Date,
        required: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: null,
    }
});

const Bounty = models.Bounty || model('Bounty', BountySchema);

export default Bounty;
