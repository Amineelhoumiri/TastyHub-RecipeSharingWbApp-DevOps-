const { Recipe, sequelize } = require('./models');
const { Op } = require('sequelize');

async function cleanupRecipes() {
    try {
        console.log('Starting recipe cleanup...');

        const recipes = await Recipe.findAll();
        let deletedCount = 0;

        for (const recipe of recipes) {
            const title = recipe.title || '';
            const lowerTitle = title.toLowerCase();

            // Check if it's a test recipe
            const isTestTitle =
                /^(my )?recipe\s*\d{5,}/i.test(title) || // Matches "My Recipe 17647..."
                /^\d{10,}$/.test(title) ||               // Matches just numbers
                lowerTitle === 'test' ||
                lowerTitle.includes('test recipe') ||
                lowerTitle.includes('demo recipe');

            // Explicitly protect "Sunday Beef Roast"
            if (lowerTitle.includes('sunday beef roast')) {
                console.log(`Keeping: "${title}" (ID: ${recipe.id})`);
                continue;
            }

            if (isTestTitle) {
                console.log(`Deleting: "${title}" (ID: ${recipe.id})`);
                await recipe.destroy();
                deletedCount++;
            } else {
                console.log(`Keeping: "${title}" (ID: ${recipe.id})`);
            }
        }

        console.log(`Cleanup complete. Deleted ${deletedCount} recipes.`);

    } catch (error) {
        console.error('Error cleaning up recipes:', error);
    } finally {
        await sequelize.close();
    }
}

cleanupRecipes();
