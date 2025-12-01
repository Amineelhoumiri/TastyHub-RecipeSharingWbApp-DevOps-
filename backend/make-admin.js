const { User, sequelize } = require('./models');

const email = process.argv[2];

if (!email) {
    console.log('Please provide an email address as an argument.');
    console.log('Usage: node make-admin.js <email>');
    process.exit(1);
}

async function makeAdmin() {
    try {
        await sequelize.authenticate();
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log(`User with email ${email} not found.`);
            process.exit(1);
        }

        // Update the user
        await user.update({ isAdmin: true });
        console.log(`SUCCESS: User ${email} is now an admin.`);

        process.exit(0);
    } catch (err) {
        console.error('Error updating user:', err);
        process.exit(1);
    }
}

makeAdmin();
