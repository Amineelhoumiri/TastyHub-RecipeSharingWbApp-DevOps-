const express = require('express');
const app = express();
const PORT = 5000;

// This middleware parses incoming JSON data, making it available on `req.body`
app.use(express.json());

// --- 1. IMPORT ROUTE FILES ---
const userRoutes = require('./routes/userRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const commentRoutes = require('./routes/commentRoutes');

// --- 2. USE ROUTES ---
// Tell Express to use our route files.
// Any URL starting with '/api/users' will be handled by 'userRoutes'.
app.use('/api/users', userRoutes);
// Any URL starting with '/api/recipes' will be handled by 'recipeRoutes'.
app.use('/api/recipes', recipeRoutes);
// Any URL starting with '/api/comments' will be handled by 'commentRoutes'.
app.use('/api/comments', commentRoutes);

// --- 3. TODO: DATABASE CONNECTION ---
// (Your database connection logic will go here)


// --- 4. START THE SERVER ---
app.listen(PORT, () => {
  // This message will show in your terminal, so you know it's working.
  console.log(`🎉 Server is alive and running on http://localhost:${PORT}`);
});