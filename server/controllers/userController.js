/**
 * @route   POST /api/users/register
 * [cite_start]@desc    Create a new user account [cite: 143]
 */
exports.registerUser = (req, res) => {
  const { username, email, password } = req.body;
  console.log('Registering user:', { username, email });

  // TODO: Database logic :
  // 1. Check if user with that email already exists
  // 2. Hash the 'password' (e.g., using bcrypt)
  // 3. Save the new user (username, email, hashed_password) to the database
  // 4. Create and send back a JSON Web Token  for authentication

  res.status(201).json({
    message: 'User registered successfully (placeholder)',
    token: 'fake.jwt.token'
  });
};

/**
 * @route   POST /api/users/login
 * @desc    Log in a user
 */
exports.loginUser = (req, res) => {
  const { email, password } = req.body;
  console.log('Logging in user:', { email });

  // TODO: Database logic :
  // 1. Find user in database by 'email'
  // 2. If user exists, compare 'password' with the stored hashed password (using bcrypt)
  // 3. If password matches, create and send back a JWT

  res.json({
    message: 'User logged in successfully (placeholder)',
    token: 'fake.jwt.token'
  });
};

/**
 * @route   GET /api/users/profile
 * @desc    Get the logged-in user's profile
 */
exports.getUserProfile = (req, res) => {
  // TODO: Auth Middleware
  // This route needs to be "protected".
  // 1. You'll add middleware to check for a valid JWT in the request header
  // 2. The middleware will find the user ID from the token and add it to `req.user`
  // 3. Then you can find the user in the DB: `User.findById(req.user.id)`

  res.json({
    message: 'Fetched user profile (placeholder)',
    user: { id: 'user-1', username: 'testuser', email: 'test@example.com' }
  });
};

/**
 * @route   PUT /api/users/profile
 * [cite_start]@desc    Update the logged-in user's profile [cite: 146]
 */
exports.updateUserProfile = (req, res) => {
  const { username, bio } = req.body;
  console.log('Updating profile with:', { username, bio });

  // TODO: Auth Middleware & Database logic
  // 1. This route needs to be protected
  // 2. Find the user in the DB: `User.findByIdAndUpdate(req.user.id, { username, bio }, { new: true })`

  res.json({
    message: 'User profile updated (placeholder)',
    user: { id: 'user-1', username, bio }
  });
};

/**
 * @route   PUT /api/users/profile/picture
 * [cite_start]@desc   Upload or update profile picture [cite: 145]
 */
exports.updateProfilePicture = (req, res) => {           // groupe decision
  // TODO: File Upload logic
  // This is more complex. You'll need a library like 'multer' to handle
  // 'multipart/form-data' (i.e., the image file).
  // 1. Use 'multer' to process the uploaded file
  // 2. You might upload the file to a cloud storage service (like Cloudinary or AWS S3)
  // 3. Get the URL of the uploaded image
  // 4. Save that URL to the user's profile in your database

  res.json({
    message: 'Profile picture updated (placeholder)',
    imageUrl: 'http://example.com/new-image.jpg'
  });
};

/**
 * @route   PUT /api/users/preferences
 * [cite_start]@desc    Update user's  preferences [cite: 147]
 */
exports.updateUserPreferences = (req, res) => {
  const { darkMode, units } = req.body;
  console.log('Updating preferences:', { darkMode, units });

  //  TODO: Auth Middleware & Database logic
  // 1. This route needs to be protected
  // 2. Find the user and update their 'preferences' field in the DB

  res.json({
    message: 'Preferences updated (placeholder)',
    preferences: { darkMode, units }
  });
};