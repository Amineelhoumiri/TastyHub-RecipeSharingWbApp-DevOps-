const { User, sequelize } = require('./models');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createAdmin() {
  try {
    console.log('--- Create Admin User ---');

    rl.question('Enter username: ', (username) => {
      rl.question('Enter email: ', (email) => {
        rl.question('Enter password: ', async (password) => {

          try {
            // Check if user exists
            let user = await User.findOne({ where: { email } });
            if (user) {
              console.log('User with this email already exists. Promoting to admin...');
              user.isAdmin = true;
              await user.save();
              console.log(`User ${user.username} is now an admin.`);
            } else {
              user = await User.findOne({ where: { username } });
              if (user) {
                console.log('User with this username already exists. Promoting to admin...');
                user.isAdmin = true;
                await user.save();
                console.log(`User ${user.username} is now an admin.`);
              } else {
                console.log('Creating new admin user...');
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                const newUser = await User.create({
                  username,
                  email,
                  password: hashedPassword,
                  isAdmin: true
                });
                console.log(`Admin user ${newUser.username} created successfully.`);
              }
            }
          } catch (err) {
            console.error('Error:', err.message);
          } finally {
            await sequelize.close();
            rl.close();
          }
        });
      });
    });

  } catch (error) {
    console.error('Setup error:', error);
    rl.close();
  }
}

createAdmin();
