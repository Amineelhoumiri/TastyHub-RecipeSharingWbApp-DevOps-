const { User, Recipe, Favorite, Like } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (id) => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured. Cannot generate authentication token.');
  }

  return jwt.sign({ id }, jwtSecret, {
    expiresIn: '30d'
  });
};

/**
 * @route   POST /api/users/register
 * @desc    Create a new user account
 */
exports.registerUser = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        message: 'Request body is missing. Please ensure Content-Type is application/json'
      });
    }

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    if (username.trim().length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters long' });
    }

    if (username.length > 100) {
      return res.status(400).json({ message: 'Username is too long (maximum 100 characters)' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    if (password.length > 128) {
      return res.status(400).json({ message: 'Password is too long (maximum 128 characters)' });
    }

    const userExists = await User.findOne({ where: { email: email.trim().toLowerCase() } });

    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const usernameExists = await User.findOne({
      where: { username: username.trim() }
    });

    if (usernameExists) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword
    });

    if (newUser) {
      const token = generateToken(newUser.id);

      res.status(201).json({
        message: 'User registered successfully!',
        token: token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email
        }
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * @route   POST /api/users/login
 * @desc    Log in a user
 */
exports.loginUser = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        message: 'Request body is missing. Please ensure Content-Type is application/json'
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user.id);

      res.status(200).json({
        message: 'User logged in successfully!',
        token: token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } else {
      res.status(400).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// --- 4. PLACEHOLDERS FOR PROTECTED ROUTES ---

/**
 * @route   GET /api/users/profile
 * @desc    Get the logged-in user's profile
 * @access  Private (requires authentication)
 */
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User profile fetched successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

/**
 * @route   GET /api/users/:userId
 * @desc    Get a user's public profile by ID
 * @access  Public (no authentication required)
 */
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching user profile for:', userId);

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'email'] }
    });

    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Found user:', user.username);
    res.json({
      message: 'User profile fetched successfully',
      user: {
        id: user.id,
        username: user.username,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      message: 'Server error while fetching user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @route   PUT /api/users/profile
 * @desc    Update the logged-in user's profile
 * @access  Private (requires authentication)
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!username && !email) {
      return res.status(400).json({
        message: 'Please provide at least one field to update (username or email)'
      });
    }

    if (username) {
      const { Op } = require('sequelize');
      const existingUser = await User.findOne({
        where: {
          username: username,
          id: { [Op.ne]: req.user.id }
        }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    if (email) {
      const { Op } = require('sequelize');
      const existingUser = await User.findOne({
        where: {
          email: email,
          id: { [Op.ne]: req.user.id }
        }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    const [updatedRows] = await User.update(updateData, {
      where: { id: req.user.id }
    });

    if (updatedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      message: 'User profile updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

/**
 * @route   PUT /api/users/profile/picture
 * @desc   Upload or update profile picture
 * @access  Private (requires authentication)
 */
exports.updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No file uploaded. Please select an image file.'
      });
    }

    const filename = req.file.filename;
    const userId = req.user.id;

    const forwardedProto = req.headers['x-forwarded-proto'];
    const forwardedHost = req.headers['x-forwarded-host'];
    const protocol = forwardedProto || req.protocol;
    const host = forwardedHost || req.get('host');
    const baseUrl = process.env.BASE_URL || `${protocol}://${host}`;
    const profilePictureUrl = `${baseUrl}/uploads/profile-pictures/${filename}`;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // TODO: Could clean up old profile pictures here to save disk space
    await user.update({ profilePicture: profilePictureUrl });

    res.json({
      message: 'Profile picture uploaded successfully',
      profilePicture: profilePictureUrl,
      // eslint-disable-next-line camelcase
      profile_picture: profilePictureUrl
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({
      message: 'Server error while uploading profile picture',
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/users/preferences
 * @desc    Update user's preferences
 * @access  Private (requires authentication)
 */
exports.updateUserPreferences = async (req, res) => {
  try {
    const { darkMode, units } = req.body;

    if (darkMode !== undefined && typeof darkMode !== 'boolean') {
      return res.status(400).json({ message: 'darkMode must be a boolean (true or false)' });
    }

    const validUnits = ['metric', 'imperial'];
    if (units !== undefined && !validUnits.includes(units)) {
      return res.status(400).json({ message: 'Units must be either "metric" or "imperial"' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const preferences = {
      ...(darkMode !== undefined && { darkMode }),
      ...(units !== undefined && { units })
    };

    // Note: To persist preferences, add a 'preferences' TEXT column to the users table
    // await user.update({ preferences: JSON.stringify(preferences) });

    res.json({
      message: 'Preferences updated successfully',
      preferences: preferences,
      note: 'Preferences are currently stored in memory. Add a preferences column to persist them.'
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error while updating preferences' });
  }
};

/**
 * @route   GET /api/users/recipes
 * @desc    Get all recipes created by the logged-in user
 * @access  Private (requires authentication)
 */
exports.getUserRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'username', 'profilePicture']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      message: 'User recipes fetched successfully',
      count: recipes.length,
      recipes: recipes.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        author: {
          id: recipe.User?.id,
          username: recipe.User?.username,
          profilePicture: recipe.User?.profilePicture
        },
        imageUrl: recipe.imageUrl,
        cookingTime: recipe.cookingTime,
        servings: recipe.servings,
        totalLikes: recipe.totalLikes,
        averageRating: recipe.averageRating,
        createdAt: recipe.createdAt
      }))
    });
  } catch (error) {
    console.error('Get user recipes error:', error);
    res.status(500).json({ message: 'Server error while fetching user recipes' });
  }
};

/**
 * @route   GET /api/users/favorites
 * @desc    Get all recipes favorited by the logged-in user
 * @access  Private (requires authentication)
 */
exports.getUserFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Recipe,
          include: [
            {
              model: User,
              as: 'User',
              attributes: ['id', 'username', 'profilePicture']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const recipes = favorites.map(fav => fav.Recipe).filter(Boolean);

    res.json({
      message: 'Favorite recipes fetched successfully',
      count: recipes.length,
      recipes: recipes.map((recipe, index) => ({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        author: {
          id: recipe.User?.id,
          username: recipe.User?.username,
          profilePicture: recipe.User?.profilePicture
        },
        imageUrl: recipe.imageUrl,
        cookingTime: recipe.cookingTime,
        servings: recipe.servings,
        totalLikes: recipe.totalLikes,
        averageRating: recipe.averageRating,
        createdAt: recipe.createdAt,
        favoritedAt: favorites[index]?.createdAt
      }))
    });
  } catch (error) {
    console.error('Get user favorites error:', error);
    res.status(500).json({ message: 'Server error while fetching favorite recipes' });
  }
};

/**
 * @route   GET /api/users/liked
 * @desc    Get all recipes liked by the logged-in user
 * @access  Private (requires authentication)
 */
exports.getUserLikedRecipes = async (req, res) => {
  try {
    const likes = await Like.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Recipe,
          include: [
            {
              model: User,
              as: 'User',
              attributes: ['id', 'username', 'profilePicture']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const recipes = likes.map(like => like.Recipe).filter(Boolean);

    res.json({
      message: 'Liked recipes fetched successfully',
      count: recipes.length,
      recipes: recipes.map((recipe, index) => ({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        author: {
          id: recipe.User?.id,
          username: recipe.User?.username,
          profilePicture: recipe.User?.profilePicture
        },
        imageUrl: recipe.imageUrl,
        cookingTime: recipe.cookingTime,
        servings: recipe.servings,
        totalLikes: recipe.totalLikes,
        averageRating: recipe.averageRating,
        createdAt: recipe.createdAt,
        likedAt: likes[index]?.createdAt
      }))
    });
  } catch (error) {
    console.error('Get user liked recipes error:', error);
    res.status(500).json({ message: 'Server error while fetching liked recipes' });
  }
};

/**
 * @route   PUT /api/users/change-password
 * @desc    Change the logged-in user's password
 * @access  Private (requires authentication)
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide both current and new passwords' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await user.update({ password: hashedPassword });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error while changing password' });
  }
};

/**
 * @route   POST /api/users/google-login
 * @desc    Login or register with Google
 * @access  Public
 */
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    const email = 'google_user@example.com';
    const username = 'Google User';

    let user = await User.findOne({ where: { email } });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      let finalUsername = username;
      const existingUsername = await User.findOne({ where: { username: finalUsername } });
      if (existingUsername) {
        finalUsername = `${username}_${Math.random().toString(36).slice(-4)}`;
      }

      user = await User.create({
        username: finalUsername,
        email: email,
        password: hashedPassword
      });
    }

    const jwtToken = generateToken(user.id);

    res.status(200).json({
      message: 'Google login successful',
      token: jwtToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Server error during Google login' });
  }
};

/**
 * @route   GET /api/users/auth/google/callback
 * @desc    Handle Google OAuth callback
 * @access  Public
 */
exports.googleCallback = async (req, res) => {
  try {
    const user = req.user;
    const token = generateToken(user.id);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const userData = JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture
    });

    res.redirect(`${frontendUrl}/login?token=${token}&user=${encodeURIComponent(userData)}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect('/login?error=ServerCallbackError');
  }
};

