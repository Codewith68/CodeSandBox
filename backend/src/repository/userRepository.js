import User from '../models/userModel.js';

/**
 * Create a new user in the database
 * @param {Object} userData - User data to create
 * @returns {Promise<Object>} Created user document
 */
export const createUser = async (userData) => {
    try {
        return await User.create(userData);
    } catch (error) {
        throw error;
    }
};

/**
 * Find a user by email
 * @param {string} email - Email to search for
 * @param {boolean} [includePassword=false] - Include password field in result
 * @returns {Promise<Object|null>} User document or null
 */
export const findUserByEmail = async (email, includePassword = false) => {
    try {
        const query = User.findOne({ email });
        if (includePassword) {
            query.select('+password');
        }
        return await query;
    } catch (error) {
        throw error;
    }
};

/**
 * Find a user by Google ID
 * @param {string} googleId - Google OAuth ID
 * @returns {Promise<Object|null>} User document or null
 */
export const findUserByGoogleId = async (googleId) => {
    try {
        return await User.findOne({ googleId });
    } catch (error) {
        throw error;
    }
};

/**
 * Find a user by MongoDB _id
 * @param {string} id - MongoDB ObjectId
 * @returns {Promise<Object|null>} User document or null
 */
export const findUserById = async (id) => {
    try {
        return await User.findById(id);
    } catch (error) {
        throw error;
    }
};

/**
 * Find a user by ID and include the refreshToken field
 * @param {string} id - MongoDB ObjectId
 * @returns {Promise<Object|null>} User document with refreshToken
 */
export const findUserByIdWithRefreshToken = async (id) => {
    try {
        return await User.findById(id).select('+refreshToken');
    } catch (error) {
        throw error;
    }
};

/**
 * Update the hashed refresh token for a user
 * @param {string} userId - MongoDB ObjectId
 * @param {string} hashedToken - Hashed refresh token
 * @returns {Promise<Object>} Updated user document
 */
export const updateRefreshToken = async (userId, hashedToken) => {
    try {
        return await User.findByIdAndUpdate(
            userId,
            { refreshToken: hashedToken },
            { returnDocument: 'after' }
        );
    } catch (error) {
        throw error;
    }
};

/**
 * Clear the refresh token for a user (used on logout)
 * @param {string} userId - MongoDB ObjectId
 * @returns {Promise<Object>} Updated user document
 */
export const clearRefreshToken = async (userId) => {
    try {
        return await User.findByIdAndUpdate(
            userId,
            { refreshToken: null },
            { returnDocument: 'after' }
        );
    } catch (error) {
        throw error;
    }
};

/**
 * Store hashed reset token and expiry for a user
 * @param {string} userId - MongoDB ObjectId
 * @param {string} hashedToken - SHA-256 hashed reset token
 * @param {Date} expiry - Token expiration date
 * @returns {Promise<Object>} Updated user document
 */
export const storeResetToken = async (userId, hashedToken, expiry) => {
    try {
        return await User.findByIdAndUpdate(
            userId,
            {
                resetPasswordToken: hashedToken,
                resetPasswordExpiry: expiry,
            },
            { returnDocument: 'after' }
        );
    } catch (error) {
        throw error;
    }
};

/**
 * Find a user by their hashed reset token (if not expired)
 * @param {string} hashedToken - SHA-256 hashed reset token
 * @returns {Promise<Object|null>} User document or null
 */
export const findUserByResetToken = async (hashedToken) => {
    try {
        return await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpiry: { $gt: new Date() }, // Token must not be expired
        }).select('+resetPasswordToken +resetPasswordExpiry');
    } catch (error) {
        throw error;
    }
};

/**
 * Clear the reset token fields after password has been reset
 * @param {string} userId - MongoDB ObjectId
 * @returns {Promise<Object>} Updated user document
 */
export const clearResetToken = async (userId) => {
    try {
        return await User.findByIdAndUpdate(
            userId,
            {
                resetPasswordToken: null,
                resetPasswordExpiry: null,
            },
            { returnDocument: 'after' }
        );
    } catch (error) {
        throw error;
    }
};

