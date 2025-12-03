const { User, sequelize } = require('./models');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  try {
    const email = 'admin@example.com';
    const username = 'admin';
    const password = 'password123';

    console.log(`Checking for admin user: ${email}...`);

    let user = await User.findOne({ where: { email } });

    if (user) {
      console.log('Admin user already exists. Updating isAdmin flag...');
      user.isAdmin = true;
      await user.save();
    } else {
      console.log('Creating new admin user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = await User.create({
        username,
        email,
        password: hashedPassword,
        isAdmin: true
      });
    }

    console.log('-----------------------------------');
    console.log('Admin User Ready:');
    console.log(`Username: ${user.username}`);
    console.log(`Email:    ${user.email}`);
    console.log(`Password: ${password}`);
    console.log('-----------------------------------');

  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await sequelize.close();
  }
}

seedAdmin();
