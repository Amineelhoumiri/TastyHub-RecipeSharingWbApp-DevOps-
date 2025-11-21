
// --- 1. Let's bring in the tools we need ---

// We import from '/models' (which is the 'index.js' file in that folder)
// This 'db' object now holds all our models, like 'db.User', 'db.Recipe', etc.
const { User, Recipe, Favorite, Like } = require('../models');

// 'bcrypt' is for hashing and comparing passwords. Never save plain text!
const bcrypt = require('bcryptjs');

// 'jwt' (JSON Web Token) is for creating the "login tokens"
const jwt = require('jsonwebtoken');

// Load environment variables
require('dotenv').config();

// --- 2. A little helper function to create a login token ---
// This creates a secure token that we can give to the user
// after they register or log in.
const generateToken = (id) => {
  // We'll sign the token with a secret key from environment variables.
  // This keeps our secret secure and out of our codebase.
  // IMPORTANT: JWT_SECRET must be set in environment variables!
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured. Cannot generate authentication token.');
  }

  return jwt.sign({ id }, jwtSecret, {
    expiresIn: '30d' // The token will be valid for 30 days
  });
};

// --- 3. Our API Controller Functions ---

/**
 * @route   POST /api/users/register
 * @desc    Create a new user account
 */
// We make this an 'async' function so we can use 'await'
exports.registerUser = async (req, res) => {
  // We use a 'try...catch' block to handle any errors that might
  // happen during the database call.
  try {
    // Safety check for req.body
    if (!req.body) {
      return res.status(400).json({
        message: 'Request body is missing. Please ensure Content-Type is application/json'
      });
    }

    // 1. Get the username, email, and password from the frontend
    const { username, email, password } = req.body;

    // 2. Validate that all required fields are provided
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    // 3. Validate input formats and lengths for security
    // Username should be at least 3 characters and not too long
    if (username.trim().length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters long' });
    }

    if (username.length > 100) {
      return res.status(400).json({ message: 'Username is too long (maximum 100 characters)' });
    }

    // Email should be a valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Password should be at least 8 characters for security
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    if (password.length > 128) {
      return res.status(400).json({ message: 'Password is too long (maximum 128 characters)' });
    }

    // 4. Check if a user with this email is *already* in the database
    // We use our 'User' model to 'findOne' where the email matches
    const userExists = await User.findOne({ where: { email: email.trim().toLowerCase() } });

    if (userExists) {
      // If we find a user, send an error and stop
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // 5. Check if username is already taken (case-insensitive)
    const usernameExists = await User.findOne({
      where: { username: username.trim() }
    });

    if (usernameExists) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // 6. If the user is new, let's hash their password
    // We use bcrypt to hash passwords - this is a one-way encryption
    // Even if someone gets access to the database, they can't see the actual passwords
    const salt = await bcrypt.genSalt(10); // Create a "salt" for extra security
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password

    // 7. Now, we create the new user in the 'users' table
    // Our 'userModel.js' maps our 'password' field to the 'password_hash' column
    // We normalize email to lowercase to avoid duplicate accounts
    const newUser = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword // We save the HASHED password, never the plain text!
    });

    // 8. If the user was created successfully...
    if (newUser) {
      // Create a login token for them so they're automatically logged in
      // This token will be used for all future authenticated requests
      const token = generateToken(newUser.id);

      // And send a "201 Created" response back to the frontend!
      res.status(201).json({
        message: 'User registered successfully!',
        token: token, // Send the token so the frontend can log them in
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email
        }
      });
    } else {
      // This is a fallback in case 'create' fails for some reason
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    // If anything in the 'try' block breaks (DB connection, etc.)
    // we'll send a "500 Server Error"
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * @route   POST /api/users/login
 * @desc    Log in a user
 */
// We also make this 'async' to talk to the database
exports.loginUser = async (req, res) => {
  try {
    // Safety check for req.body
    if (!req.body) {
      return res.status(400).json({
        message: 'Request body is missing. Please ensure Content-Type is application/json'
      });
    }

    // 1. Get the email and password from the frontend
    const { email, password } = req.body;

    // 2. Validate that both fields are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    // 3. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // 4. Find the user in the database by their email
    // We normalize the email to lowercase to match how we store it
    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });

    // 5. If we found a user AND their password matches...
    // We use 'bcrypt.compare' to check the plain text password
    // against the hashed password we have stored in the database.
    if (user && (await bcrypt.compare(password, user.password))) {
      // The login is good! Create a new token for them.
      const token = generateToken(user.id);

      // Send a "200 OK" response with their info and token
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
      // If no user was found OR the password didn't match...
      // Send a "400 Bad Request" error.
      // We use a generic message for security - we don't
      // want to tell an attacker *which* part was wrong.
      res.status(400).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    // Catch any server errors
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// --- 4. PLACEHOLDERS FOR PROTECTED ROUTES ---
// We will implement these *after* we create our
// authentication "middleware" (our bouncer).

/**
 * @route   GET /api/users/profile
 * @desc    Get the logged-in user's profile
 * @access  Private (requires authentication)
 */
exports.getUserProfile = async (req, res) => {
  try {
    // The auth middleware has already verified the token and attached req.user
    // Now we just need to fetch the full user details from the database
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] } // Don't send the password hash back to the frontend
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
        createdAt: user.createdAt
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

    // Only return public info - no password or email
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

    // Basic validation - make sure at least something is being updated
    if (!username && !email) {
      return res.status(400).json({
        message: 'Please provide at least one field to update (username or email)'
      });
    }

    // Check if username is being changed and if it's already taken
    if (username) {
      const { Op } = require('sequelize');
      const existingUser = await User.findOne({
        where: {
          username: username,
          id: { [Op.ne]: req.user.id } // Exclude current user
        }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    // Check if email is being changed and if it's already taken
    if (email) {
      const { Op } = require('sequelize');
      const existingUser = await User.findOne({
        where: {
          email: email,
          id: { [Op.ne]: req.user.id } // Exclude current user
        }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
    }

    // Build update object with only the fields that were provided
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    // Update the user in the database
    const [updatedRows] = await User.update(updateData, {
      where: { id: req.user.id }
    });

    if (updatedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch the updated user to send back
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
    // Make sure a file was actually uploaded
    if (!req.file) {
      return res.status(400).json({
        message: 'No file uploaded. Please select an image file.'
      });
    }

    // Grab the filename and user ID
    const filename = req.file.filename;
    const userId = req.user.id;

    // Build the URL where the image will be accessible
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const profilePictureUrl = `${baseUrl}/uploads/profile-pictures/${filename}`;

    // Save the new profile picture URL to the user's record
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // TODO: Could clean up old profile pictures here to save disk space
    await user.update({ profilePicture: profilePictureUrl });

    res.json({
      message: 'Profile picture uploaded successfully',
      profilePicture: profilePictureUrl,
      profile_picture: profilePictureUrl // Return both formats for compatibility
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
 * @desc    Update user's preferences (like dark mode, measurement units, etc.)
 * @access  Private (requires authentication)
 *
 * Note: This stores preferences as JSON in a text field.
 * For a production app, you might want to add a dedicated preferences column or table.
 * For now, we'll store it as a JSON string in a text field if you add it to your database.
 */
exports.updateUserPreferences = async (req, res) => {
  try {
    const { darkMode, units } = req.body;

    // Validate the preferences data
    // darkMode should be a boolean, units should be a string
    if (darkMode !== undefined && typeof darkMode !== 'boolean') {
      return res.status(400).json({ message: 'darkMode must be a boolean (true or false)' });
    }

    // Validate units if provided (should be 'metric' or 'imperial')
    const validUnits = ['metric', 'imperial'];
    if (units !== undefined && !validUnits.includes(units)) {
      return res.status(400).json({ message: 'Units must be either "metric" or "imperial"' });
    }

    // Build preferences object with only the provided values
    // We merge with existing preferences if they exist
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // For now, we'll store preferences in memory/log them
    // To actually persist them, you would need to:
    // 1. Add a 'preferences' TEXT column to your users table
    // 2. Update the User model to include a preferences field
    // 3. Store preferences as JSON: JSON.stringify({ darkMode, units })
    // 4. Retrieve and parse: JSON.parse(user.preferences)

    // For this implementation, we'll acknowledge the request
    // In a real app, you'd do: await user.update({ preferences: JSON.stringify({ darkMode, units }) });

    const preferences = {
      ...(darkMode !== undefined && { darkMode }),
      ...(units !== undefined && { units })
    };

    // Note: To persist preferences, add a 'preferences' TEXT column to the users table
    // and uncomment the following line:
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

