import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Generate a unique avatar URL based on the user's name
 * Uses ui-avatars.com which generates initials-based avatars
 */
const generateAvatarUrl = (name) => {
    const encoded = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encoded}&background=6366f1&color=fff&bold=true&size=256`;
};

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            trim: true,
            minlength: [3, 'Username must be at least 3 characters'],
            maxlength: [30, 'Username must be at most 30 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        password: {
            type: String,
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // Don't return password by default in queries
        },
        googleId: {
            type: String,
            sparse: true, // Sparse index — allows multiple null values (for local users)
            unique: true,
        },
        avatar: {
            type: String,
            default: null, // Set dynamically in pre-save hook based on username
        },
        refreshToken: {
            type: String,
            select: false, // Don't return refreshToken by default in queries
        },
        provider: {
            type: String,
            enum: ['local', 'google'],
            default: 'local',
        },
        resetPasswordToken: {
            type: String,
            select: false, // Don't return in queries by default
        },
        resetPasswordExpiry: {
            type: Date,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Pre-save hook — hash password + set default avatar from username
 */
userSchema.pre('save', async function () {
    // Generate avatar from username if not set (or if username changed)
    if (!this.avatar || this.isModified('username')) {
        // Only override if not a custom avatar (Google avatar, S3 upload, etc.)
        const isDefaultAvatar = !this.avatar || this.avatar.includes('ui-avatars.com');
        if (isDefaultAvatar) {
            this.avatar = generateAvatarUrl(this.username);
        }
    }

    // Hash password if modified
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

/**
 * Instance method — compare candidate password with hashed password
 * @param {string} candidatePassword - Plain text password to compare
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Transform toJSON — remove sensitive fields from serialized output
 */
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.refreshToken;
    delete user.resetPasswordToken;
    delete user.resetPasswordExpiry;
    delete user.__v;
    return user;
};

const User = mongoose.model('User', userSchema);

export default User;
