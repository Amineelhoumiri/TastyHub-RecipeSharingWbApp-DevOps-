const { User, sequelize } = require('./models');

async function assignAdmin() {
    try {
        const email = 'medamineelhoumiri@gmail.com';
        console.log(`Searching for user with email: ${email}...`);

        const user = await User.findOne({ where: { email } });

        if (user) {
            console.log(`User found: ${user.username}`);
            if (user.isAdmin) {
                console.log('User is already an admin.');
            } else {
                user.isAdmin = true;
                await user.save();
                console.log('Successfully promoted user to admin.');
            }
        } else {
            console.log('User not found. Please ensure the user has signed up first.');
        }

    } catch (error) {
        console.error('Error assigning admin:', error);
    } finally {
        await sequelize.close();
    }
}

assignAdmin();
