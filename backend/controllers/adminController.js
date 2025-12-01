const { User, Recipe, Review, Like, Favorite } = require('../models');
const bcrypt = require('bcryptjs');

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            message: 'Users fetched successfully',
            count: users.length,
            users
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Server error while fetching users' });
    }
};

/**
 * @route   DELETE /api/admin/users/:userId
 * @desc    Delete a user (Admin only)
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Prevent deleting yourself
        if (userId === req.user.id) {
            return res.status(400).json({ message: 'You cannot delete your own admin account' });
        }

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete the user
        // This should cascade delete their recipes, reviews, etc. if configured in DB
        // Otherwise we might need to manually clean up
        await user.destroy();

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error while deleting user' });
    }
};

/**
 * @route   PUT /api/admin/users/:userId
 * @desc    Update a user (Admin only) - Can change password, role, etc.
 * @access  Private/Admin
 */
exports.updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { username, email, password, role } = req.body;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updateData = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (role) updateData.role = role;

        if (password && password.trim() !== '') {
            if (password.length < 8) {
                return res.status(400).json({ message: 'Password must be at least 8 characters long' });
            }
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        await user.update(updateData);

        const updatedUser = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });

        res.json({
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error while updating user' });
    }
};
