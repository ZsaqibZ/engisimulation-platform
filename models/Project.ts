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
  file_url: {
    type: String, // Link to the zip file (Local Storage URL)
    required: [true, 'Please provide the file download URL.'],
  },
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