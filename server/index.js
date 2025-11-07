// IMPORTS 
const express = require('express');
const sequelize = require('./config/database'); // We import our database connection

// APP INITIALIZATION 
const app = express();
const PORT = 5000; // The port our server will run on

//  MIDDLEWARE 
// This is a "middleware" that tells Express to automatically parse
// any incoming JSON data from the frontend.
app.use(express.json());

// IMPORT ROUTE FILES 
// Here, we import the separate "mini-apps" (Routers) we created.
const userRoutes = require('./routes/userRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const commentRoutes = require('./routes/commentRoutes');

// USE ROUTES
// This is where we tell our app to *use* the route files.
// Any URL starting with "/api/users" will be handled by the 'userRoutes' file.
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/comments', commentRoutes);

// CONNECT TO DATABASE & START SERVER 
// We try to connect to the database first.
// If the connection is successful, *then* we start the server.
// This prevents the app from running if the database is down.

console.log('Attempting to connect to database...');
sequelize
  .authenticate()
  .then(() => {
    // This code runs if the connection is a success
    console.log('✅✅✅ DATABASE CONNECTION SUCCESSFUL! ✅✅✅');

    // We start the server *inside* the .then() block
    app.listen(PORT, () => {
      console.log(`🎉 Server is alive and running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    // This code runs if the connection fails
    console.error('❌❌❌ UNABLE TO CONNECT TO DATABASE: ❌❌❌');
    console.error(err);
  });