const { sequelize } = require('./models');

async function sync() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');
        await sequelize.sync({ alter: true });
        console.log('Database synced');
        process.exit(0);
    } catch (err) {
        console.error('Error syncing:', err);
        process.exit(1);
    }
}

sync();
