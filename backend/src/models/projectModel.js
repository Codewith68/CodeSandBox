import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
    {
        projectId: {
            type: String,
            required: [true, 'Project ID is required'],
            unique: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Project name is required'],
            trim: true,
            minlength: [1, 'Project name cannot be empty'],
            maxlength: [100, 'Project name must be at most 100 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description must be at most 500 characters'],
            default: '',
        },
        template: {
            type: String,
            enum: ['react', 'vue', 'node', 'vanilla'],
            default: 'react',
        },
        s3Key: {
            type: String,
            default: null, // Set after first S3 upload
        },
        lastSyncedAt: {
            type: Date,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: false, // True when a container is running for this project
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

// Compound index for fast "list user's projects" queries
projectSchema.index({ userId: 1, updatedAt: -1 });

/**
 * Transform toJSON — clean output
 */
projectSchema.methods.toJSON = function () {
    const project = this.toObject();
    delete project.__v;
    return project;
};

const Project = mongoose.model('Project', projectSchema);

export default Project;
