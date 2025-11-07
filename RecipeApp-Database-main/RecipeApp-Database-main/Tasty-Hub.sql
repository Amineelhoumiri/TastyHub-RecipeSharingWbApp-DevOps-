-- ===================================================
-- TastyHub v2 — PostgreSQL Schema
-- ===================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================
-- USERS
-- ===================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    profile_picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================
-- RECIPES
-- ===================================================
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cooking_time INT, -- in minutes
    servings INT,
    total_likes INT DEFAULT 0,
    total_downloads INT DEFAULT 0,
    total_shares INT DEFAULT 0,
    average_rating NUMERIC(2,1) DEFAULT 0.0,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================
-- RECIPE INGREDIENTS
-- Each recipe has its own ingredient list, with custom units & quantities
-- ===================================================
CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_name VARCHAR(150) NOT NULL,
    quantity NUMERIC(10,2) NOT NULL,
    unit VARCHAR(50) CHECK (unit IN (
        'teaspoon', 'tablespoon', 'cup', 'gram', 'kilogram',
        'ml', 'liter', 'piece', 'pinch', 'other'
    )),
    notes TEXT
);

-- ===================================================
-- RECIPE STEPS
-- ===================================================
CREATE TABLE recipe_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    instruction TEXT NOT NULL,
    step_image TEXT
);

-- ===================================================
-- TAGS
-- ===================================================
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tag_name VARCHAR(100) UNIQUE NOT NULL
);

-- ===================================================
-- RECIPE TAGS (many-to-many)
-- ===================================================
CREATE TABLE recipe_tags (
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (recipe_id, tag_id)
);

-- ===================================================
-- REVIEWS
-- Individual user ratings & feedback
-- ===================================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================
-- LIKES
-- Stores which users liked which recipes
-- ===================================================
CREATE TABLE likes (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, recipe_id)
);

-- ===================================================
-- FAVORITES
-- ===================================================
CREATE TABLE favorites (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, recipe_id)
);

-- ===================================================
-- ACTIVITY LOG
-- Tracks downloads, shares, and future interactions
-- ===================================================
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    action_type VARCHAR(50) CHECK (action_type IN ('download', 'share')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================
-- INDEXES
-- ===================================================
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_reviews_recipe_id ON reviews(recipe_id);
CREATE INDEX idx_likes_recipe_id ON likes(recipe_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_recipe_tags_tag_id ON recipe_tags(tag_id);
CREATE INDEX idx_recipe_title_tsv ON recipes USING gin (to_tsvector('english', title));
CREATE INDEX idx_activity_log_recipe_id ON activity_log(recipe_id);

-- ===================================================
-- TRIGGERS (optional)
-- To auto-update average rating or total likes when reviews or likes change
-- ===================================================
-- (You can add trigger functions later for auto updates)

ALTER TABLE users ADD CONSTRAINT unique_username UNIQUE (username);

-- USERS

INSERT INTO users (id, username, email, password_hash, profile_picture)
VALUES
(uuid_generate_v4(), 'chef_anna', 'anna@example.com', 'hash_123', 'https://cdn.tastyhub.com/avatars/anna.jpg'),
(uuid_generate_v4(), 'baker_john', 'john@example.com', 'hash_456', 'https://cdn.tastyhub.com/avatars/john.jpg'),
(uuid_generate_v4(), 'foodie_mike', 'mike@example.com', 'hash_789', 'https://cdn.tastyhub.com/avatars/mike.jpg');

-- RECIPES
INSERT INTO recipes (user_id, title, description, cooking_time, servings, image_url)
VALUES
((SELECT id FROM users WHERE username='chef_anna'), 'Chocolate Cake', 'Rich chocolate sponge with ganache frosting.', 60, 8, 'https://cdn.tastyhub.com/recipes/chocolate_cake.jpg'),
((SELECT id FROM users WHERE username='baker_john'), 'Banana Pancakes', 'Fluffy pancakes made with ripe bananas.', 20, 4, 'https://cdn.tastyhub.com/recipes/banana_pancakes.jpg'),
((SELECT id FROM users WHERE username='foodie_mike'), 'Grilled Chicken Salad', 'Healthy salad with grilled chicken and fresh veggies.', 25, 2, 'https://cdn.tastyhub.com/recipes/chicken_salad.jpg');

-- RECIPE_INGREDIENTS (with per-recipe measurements)

INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, notes)
VALUES
((SELECT id FROM recipes WHERE title='Chocolate Cake' LIMIT 1), 'Flour', 2.5, 'cup', 'All-purpose flour'),
((SELECT id FROM recipes WHERE title='Chocolate Cake' LIMIT 1), 'Sugar', 1.5, 'cup', 'Granulated sugar'),
((SELECT id FROM recipes WHERE title='Chocolate Cake' LIMIT 1), 'Cocoa Powder', 0.75, 'cup', 'Unsweetened cocoa'),

((SELECT id FROM recipes WHERE title='Banana Pancakes' LIMIT 1), 'Bananas', 2, 'piece', 'Ripe bananas'),
((SELECT id FROM recipes WHERE title='Banana Pancakes' LIMIT 1), 'Milk', 1.0, 'cup', 'Any milk type works'),
((SELECT id FROM recipes WHERE title='Banana Pancakes' LIMIT 1), 'Eggs', 2, 'piece', 'Large eggs'),

((SELECT id FROM recipes WHERE title='Grilled Chicken Salad' LIMIT 1), 'Chicken Breast', 1, 'piece', 'Boneless, skinless'),
((SELECT id FROM recipes WHERE title='Grilled Chicken Salad' LIMIT 1), 'Lettuce', 2, 'cup', 'Chopped'),
((SELECT id FROM recipes WHERE title='Grilled Chicken Salad' LIMIT 1), 'Olive Oil', 2, 'tablespoon', 'Extra virgin olive oil');

-- TAGS
INSERT INTO tags (tag_name)
VALUES
('dessert'), ('breakfast'), ('healthy'), ('salad'), ('quick');

-- RECIPE_TAGS
INSERT INTO recipe_tags (recipe_id, tag_id)
VALUES
((SELECT id FROM recipes WHERE title='Chocolate Cake' LIMIT 1),
 (SELECT id FROM tags WHERE tag_name='dessert' LIMIT 1)),
((SELECT id FROM recipes WHERE title='Banana Pancakes' LIMIT 1),
 (SELECT id FROM tags WHERE tag_name='breakfast' LIMIT 1)),
((SELECT id FROM recipes WHERE title='Grilled Chicken Salad' LIMIT 1),
 (SELECT id FROM tags WHERE tag_name='healthy' LIMIT 1)),
((SELECT id FROM recipes WHERE title='Grilled Chicken Salad' LIMIT 1),
 (SELECT id FROM tags WHERE tag_name='salad' LIMIT 1));

-- REVIEWS
INSERT INTO reviews (user_id, recipe_id, rating, comment)
VALUES
((SELECT id FROM users WHERE username='foodie_mike' LIMIT 1),
 (SELECT id FROM recipes WHERE title='Chocolate Cake' LIMIT 1), 5, 'Absolutely delicious!'),
((SELECT id FROM users WHERE username='chef_anna' LIMIT 1),
 (SELECT id FROM recipes WHERE title='Banana Pancakes' LIMIT 1), 4, 'Great flavor and easy to make.'),
((SELECT id FROM users WHERE username='baker_john' LIMIT 1),
 (SELECT id FROM recipes WHERE title='Grilled Chicken Salad' LIMIT 1), 5, 'Healthy and tasty!');

-- FAVORITES
INSERT INTO favorites (user_id, recipe_id)
VALUES
((SELECT id FROM users WHERE username='baker_john' LIMIT 1),
 (SELECT id FROM recipes WHERE title='Chocolate Cake' LIMIT 1)),
((SELECT id FROM users WHERE username='foodie_mike' LIMIT 1),
 (SELECT id FROM recipes WHERE title='Banana Pancakes' LIMIT 1));

-- LIKES
INSERT INTO likes (user_id, recipe_id)
VALUES
((SELECT id FROM users WHERE username='chef_anna' LIMIT 1),
 (SELECT id FROM recipes WHERE title='Chocolate Cake' LIMIT 1)),
((SELECT id FROM users WHERE username='baker_john' LIMIT 1),
 (SELECT id FROM recipes WHERE title='Banana Pancakes' LIMIT 1)),
((SELECT id FROM users WHERE username='foodie_mike' LIMIT 1),
 (SELECT id FROM recipes WHERE title='Grilled Chicken Salad' LIMIT 1));

-- ACTIVITY
INSERT INTO activity_log (user_id, recipe_id, action_type)
VALUES
((SELECT id FROM users WHERE username='chef_anna' LIMIT 1),
 (SELECT id FROM recipes WHERE title='Chocolate Cake' LIMIT 1), 'download'),
((SELECT id FROM users WHERE username='baker_john' LIMIT 1),
 (SELECT id FROM recipes WHERE title='Banana Pancakes' LIMIT 1), 'share'),
((SELECT id FROM users WHERE username='foodie_mike' LIMIT 1),
 (SELECT id FROM recipes WHERE title='Grilled Chicken Salad' LIMIT 1), 'download');


SELECT * FROM recipe_ingredients; 
SELECT * FROM reviews ;
SELECT * FROM likes;
SELECT * FROM favorites;
SELECT * FROM activity_log;