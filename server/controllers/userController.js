const User = require('../models/User');

exports.syncUser = async (req, res) => {
    try {
        const { userId, claims } = req.auth;
        const { email, firstName, lastName } = req.body; // Passed from frontend or webhook

        let user = await User.findOne({ clerkId: userId });

        if (!user) {
            user = new User({
                clerkId: userId,
                email: email || claims.email, // Fallback to claims if body is empty
                firstName,
                lastName,
            });
            await user.save();
        } else {
            // Update fields if changed
            user.email = email || user.email;
            user.firstName = firstName || user.firstName;
            user.lastName = lastName || user.lastName;
            await user.save();
        }

        res.json(user);
    } catch (error) {
        console.error('Sync User Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        const { userId } = req.auth;
        const user = await User.findOne({ clerkId: userId });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
