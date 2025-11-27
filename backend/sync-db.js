require('dotenv').config();
const { sequelize } = require('./models');

async function syncDatabase() {
    try {
        console.log('🔄 Syncing database models...');
        console.log('   This will update database tables to match your Sequelize models.');

        // alter: true updates tables to match models without dropping data (mostly)
        // force: false ensures we don't drop existing tables
        await sequelize.sync({ alter: true, force: false });

        console.log('✅ Database synced successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error syncing database:', error);
        process.exit(1);
    }
}

syncDatabase();
