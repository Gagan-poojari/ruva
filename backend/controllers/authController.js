const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password || !phone) {
            res.status(400);
            throw new Error('Please add all fields');
        }

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        // Create user (password hash handled by pre-save hook)
        const user = await User.create({
            name,
            email,
            passwordHash: password,
            phone,
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401);
            throw new Error('Invalid credentials');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Authenticate admin
// @route   POST /api/auth/admin/login
// @access  Public
const loginAdmin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && user.role === 'admin' && (await user.matchPassword(password))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401);
            throw new Error('Not authorized as an admin');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Authenticate with Google
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res, next) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ message: 'Google credential is required' });
        }

        if (!process.env.GOOGLE_CLIENT_ID) {
            return res.status(500).json({ message: 'Google auth is not configured on server' });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const email = payload?.email;
        const googleId = payload?.sub;
        const name = payload?.name || 'Google User';
        const avatar = payload?.picture;

        if (!email || !googleId) {
            return res.status(400).json({ message: 'Invalid Google token payload' });
        }

        if (payload?.email_verified === false) {
            return res.status(401).json({ message: 'Google email is not verified' });
        }

        let user = await User.findOne({ email });

        if (user) {
            if (user.googleId && user.googleId !== googleId) {
                return res.status(409).json({ message: 'Google account mismatch for this email' });
            }

            // Link existing local account to Google on first Google sign-in.
            if (!user.googleId || user.avatar !== avatar) {
                user.googleId = googleId;
                if (avatar) user.avatar = avatar;
                await user.save();
            }
        } else {
            // Phone is required in schema, so default until user updates profile.
            user = await User.create({
                name,
                email,
                googleId,
                avatar,
                phone: 'Not updated',
            });
        }

        return res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        next(error);
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
const updateProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) { res.status(404); throw new Error('User not found'); }

        if (req.body.name) user.name = req.body.name;
        if (req.body.phone) user.phone = req.body.phone;

        // Password change (only if not google user)
        if (req.body.newPassword) {
            if (!req.body.currentPassword) { res.status(400); throw new Error('Current password required'); }
            if (!user.passwordHash) { res.status(400); throw new Error('Cannot set password for Google accounts'); }
            const match = await user.matchPassword(req.body.currentPassword);
            if (!match) { res.status(401); throw new Error('Current password is incorrect'); }
            user.passwordHash = req.body.newPassword;
        }

        const updated = await user.save();
        res.json({
            _id: updated._id,
            name: updated.name,
            email: updated.email,
            phone: updated.phone,
            role: updated.role,
            avatar: updated.avatar,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
    loginAdmin,
    googleAuth,
    getMe,
    updateProfile,
};
