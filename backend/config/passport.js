const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');
const bcrypt = require('bcryptjs');

// Configure the Google Strategy
try {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('⚠️ Google OAuth credentials missing. Google login will not work.');
  } else {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/users/auth/google/callback`,
          passReqToCallback: true,
          proxy: true
        },
        async (req, accessToken, refreshToken, profile, done) => {
          try {
            // Check if user exists based on email
            const email = profile.emails[0].value;
            let user = await User.findOne({ where: { email } });

            if (user) {
              // If user exists, return the user
              // Optional: Update profile picture if it changed
              return done(null, user);
            }

            // If user doesn't exist, create a new one
            const username = profile.displayName || email.split('@')[0];

            // Handle duplicate username
            let finalUsername = username;
            let counter = 1;
            while (await User.findOne({ where: { username: finalUsername } })) {
              finalUsername = `${username}${counter}`;
              counter++;
            }

            // Create a random password (user will login via Google anyway)
            const randomPassword = Math.random().toString(36).slice(-16);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            user = await User.create({
              username: finalUsername,
              email: email,
              password: hashedPassword,
              profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : null
            });

            return done(null, user);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
  }
} catch (err) {
  console.error('Failed to configure Google Strategy:', err);
}

// Serialize/Deserialize user (not strictly needed for JWT but good practice for sessions if used)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
