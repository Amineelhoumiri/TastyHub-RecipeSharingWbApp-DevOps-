const { User, sequelize } = require('./models');

const email = process.argv[2];

if (!email) {
    console.log('Please provide an email address as an argument.');
    console.log('Usage: node make_admin.js <email>');
    process.exit(1);
}

const makeAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        // Sync the model to ensure the 'role' column exists in the DB
        // This is important because we just added it to the model definition
        console.log('Syncing User model...');
        await User.sync({ alter: true });
        console.log('User model synced.');

        const user = await User.findOne({ where: { email: email } });

        if (!user) {
            console.log(`User with email ${email} not found.`);
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`Successfully promoted ${user.username} (${user.email}) to admin!`);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
};

makeAdmin();
