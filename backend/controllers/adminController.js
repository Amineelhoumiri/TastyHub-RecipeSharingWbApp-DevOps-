const { User } = require('../models');
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
    const { username, email, password, isAdmin } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (isAdmin !== undefined) updateData.isAdmin = isAdmin;

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

/**
 * @route   POST /api/admin/users
 * @desc    Create a new user (Admin only)
 * @access  Private/Admin
 */
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, isAdmin } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide username, email and password' });
    }

    // Check if user exists
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    user = await User.findOne({ where: { username } });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this username' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      isAdmin: isAdmin || false
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error while creating user' });
  }
};

/**
 * @route   GET /api/admin/recipes
 * @desc    Get all recipes (Admin only)
 * @access  Private/Admin
 */
exports.getAllRecipes = async (req, res) => {
  try {
    const { Recipe, User } = require('../models');

    const recipes = await Recipe.findAll({
      include: [{
        model: User,
        attributes: ['id', 'username', 'profilePicture']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      message: 'Recipes fetched successfully',
      count: recipes.length,
      recipes
    });
  } catch (error) {
    console.error('Get all recipes error:', error);
    res.status(500).json({ message: 'Server error while fetching recipes' });
  }
};

/**
 * @route   DELETE /api/admin/recipes/:recipeId
 * @desc    Delete any recipe (Admin only)
 * @access  Private/Admin
 */
exports.deleteRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { Recipe } = require('../models'); // Lazy load to avoid circular deps if any

    const recipe = await Recipe.findByPk(recipeId);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    await recipe.destroy();

    res.json({ message: 'Recipe deleted successfully by admin' });
  } catch (error) {
    console.error('Admin delete recipe error:', error);
    res.status(500).json({ message: 'Server error while deleting recipe' });
  }
};

/**
 * @route   DELETE /api/admin/comments/:commentId
 * @desc    Delete any comment (Admin only)
 * @access  Private/Admin
 */
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { Review } = require('../models'); // Lazy load

    const review = await Review.findByPk(commentId);

    if (!review) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    await review.destroy();

    res.json({ message: 'Comment deleted successfully by admin' });
  } catch (error) {
    console.error('Admin delete comment error:', error);
    res.status(500).json({ message: 'Server error while deleting comment' });
  }
};
