const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const AppError = require('../utils/appError');

// Temporary in-memory database
const users = [];

// 1. Register User
exports.register = async (req, res, next) => {
    try {
        const { fullName, email, password, preferences } = req.body;

        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: users.length + 1,
            fullName,
            email,
            password: hashedPassword,
            // FIX: Fallback to an empty array if none provided to satisfy validation
            preferences: preferences || []
        };

        users.push(newUser);
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        next(error);
    }
};

// 2. Login User (Updated with Preferences in JWT)
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = users.find(u => u.email === email);
        if (!user) {
            return next(new AppError('No user found with that email address', 404));
        }

        // Verify hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return next(new AppError('Incorrect email or password', 401));
        }

        // FIX: Include preferences in the JWT payload
        // This allows newsController to read the category directly from the token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                preferences: user.preferences
            },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '1h' }
        );


        res.status(200).json({
            message: "Login successful",
            token
        });

    } catch (err) {
        next(err);
    }
};

// 3. Get User Preferences (Protected Route)
exports.getPreferences = (req, res, next) => {
    // req.user is populated by your authMiddleware
    const user = users.find(u => u.id === req.user.id);
    if (!user) return next(new AppError('User not found', 404));

    res.status(200).json({ preferences: user.preferences });
};

// 4. Update User Preferences (Protected Route)
exports.updatePreferences = (req, res, next) => {
    const { preferences } = req.body;

    // Simple validation
    if (!preferences || typeof preferences !== 'object') {
        return next(new AppError('Preferences must be an object (e.g., { category: "sports" })', 400));
    }

    const userIndex = users.findIndex(u => u.id === req.user.id);
    if (userIndex === -1) return next(new AppError('User not found', 404));

    // Update the in-memory array
    users[userIndex].preferences = preferences;

    res.status(200).json({
        message: "Preferences updated successfully",
        preferences: users[userIndex].preferences
    });
};

// Export users array for other services if needed
exports.users = users;
