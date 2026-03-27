import { Schema, model, models } from 'mongoose';

const ProjectSchema = new Schema({
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
  },
  tags: {
    type: [String], // Array of strings (e.g., ['Solar', 'Thermal'])
    default: [],
  },
  verified_version: {
    type: String,
    default: null,
  },
  security_status: {
    type: String,
    enum: ['pending', 'safe', 'flagged'],
    default: 'pending',
  },
  scan_results: {
    type: String,
    default: null,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  embedding: {
    type: [Number],
    index: true,
  },
  file_url: {
    type: String, // Link to the zip file (Local Storage URL)
    required: [true, 'Please provide the file download URL.'],
  },
  versions: [{
    version_string: String,
    file_url: String,
    changelog: String,
    uploaded_at: { type: Date, default: Date.now }
  }],
  current_version: String,
  screenshots: {
    type: [String], // Array of image URLs
    default: [],
  },
  youtube_url: {
    type: String,
    required: false,
  },
  author_id: {
    type: String, // We will store the User ID here
    required: true,
  },
  downloads: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Check if the model already exists to prevent compiling it twice in dev mode
// We explicitly delete it here to ensure schema changes are picked up during hot reloading
if (process.env.NODE_ENV === 'development' && models.Project) {
  delete models.Project
}

const Project = models.Project || model('Project', ProjectSchema);

export default Project;