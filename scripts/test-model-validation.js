
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title for this project.'],
        maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Please provide a description.'],
    },
    software_type: {
        type: String,
        required: [true, 'Please specify the software (e.g., MATLAB, Ansys).'],
        enum: ['MATLAB', 'Ansys', 'LabVIEW', 'Python', 'SolidWorks', 'Other'],
    },
    tags: {
        type: [String],
        default: [],
    },
    file_url: {
        type: String,
        required: [true, 'Please provide the file download URL.'],
    },
    screenshots: {
        type: [String],
        default: [],
    },
    youtube_url: {
        type: String,
        required: false,
    },
    author_id: {
        type: String,
        required: true,
    },
    downloads: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

// We need to define the model here because importing from TS file in JS script is hard
// But we want to test the SCHEMA validation mostly.
const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

async function main() {
    if (!process.env.MONGODB_URI) {
        console.error('No MONGODB_URI');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        console.log('--- Testing Valid Project ---');
        try {
            const validData = {
                title: "Test Project",
                description: "Test Desc",
                software_type: "Python",
                file_url: "/uploads/test.zip",
                author_id: "test-user-id"
            };
            const p = new Project(validData);
            await p.validate();
            console.log("Valid project passed validation.");
        } catch (e) {
            console.error("Valid project FAILED:", e.message);
        }

        console.log('--- Testing Missing file_url ---');
        try {
            const invalidData = {
                title: "Test Project 2",
                description: "Test Desc",
                software_type: "Python",
                // file_url missing
                author_id: "test-user-id"
            };
            const p2 = new Project(invalidData);
            await p2.validate();
            console.log("Invalid project unexpectedly passed validation.");
        } catch (e) {
            console.log("Invalid project failed as expected:", e.message);
        }

    } catch (err) {
        console.error("Script error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

main();
