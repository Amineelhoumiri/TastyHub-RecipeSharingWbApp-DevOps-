-- ===========================================
-- TastyHub Database Schema
-- ===========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========== USERS ==========
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    preferences JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== RECIPES ==========
CREATE TABLE recipes (
    recipe_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url TEXT,
    prep_time INT,
    cook_time INT,
    servings INT,
    difficulty VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== INGREDIENTS ==========
CREATE TABLE ingredients (
    ingredient_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(50)
);

-- ========== RECIPE_INGREDIENTS ==========
CREATE TABLE recipe_ingredients (
    recipe_id UUID REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    quantity DECIMAL(10,2),
    PRIMARY KEY (recipe_id, ingredient_id)
);

-- ========== RECIPE_STEPS ==========
CREATE TABLE recipe_steps (
    step_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    instruction TEXT NOT NULL
);

-- ========== REVIEWS ==========
CREATE TABLE reviews (
    review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== FAVORITES ==========
CREATE TABLE favorites (
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, recipe_id)
);

-- ========== TAGS ==========
CREATE TABLE tags (
    tag_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL
);

-- ========== RECIPE_TAGS ==========
CREATE TABLE recipe_tags (
    recipe_id UUID REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (recipe_id, tag_id)
);



CREATE TABLE comments (
   comment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ========== INDEXES ==========
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_reviews_recipe_id ON reviews(recipe_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_recipe_tags_tag_id ON recipe_tags(tag_id);
CREATE INDEX idx_recipe_title ON recipes USING gin (to_tsvector('english', title));
CREATE INDEX idx_recipe_user ON recipes(user_id);
CREATE INDEX idx_comment_recipe ON comments(recipe_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);







-- Test Values
-- USERS
INSERT INTO users (name, email, password_hash, bio, avatar_url)
VALUES
('John Doe', 'john@example.com', 'hashedpassword123', 'Food enthusiast and home cook', 'https://example.com/avatars/john.jpg'),
('Jane Smith', 'jane@example.com', 'hashedpassword456', 'Loves baking and trying new desserts', 'https://example.com/avatars/jane.jpg'),
('Ali Khan', 'ali@example.com', 'hashedpassword789', 'Pakistani chef specializing in BBQ', 'https://example.com/avatars/ali.jpg');

-- INGREDIENTS
INSERT INTO ingredients (name, unit)
VALUES
('Flour', 'grams'),
('Eggs', 'pieces'),
('Sugar', 'grams'),
('Butter', 'grams'),
('Salt', 'teaspoon');

-- RECIPES
INSERT INTO recipes (user_id, title, description, image_url, prep_time, cook_time, servings, difficulty)
VALUES
((SELECT user_id FROM users WHERE name='Jane Smith'),
 'Classic Pancakes',
 'Fluffy homemade pancakes perfect for breakfast.',
 'https://example.com/images/pancakes.jpg',
 10, 15, 4, 'Easy'),
((SELECT user_id FROM users WHERE name='Ali Khan'),
 'BBQ Chicken',
 'Juicy BBQ chicken with smoky flavor.',
 'https://example.com/images/bbqchicken.jpg',
 20, 40, 3, 'Medium');

-- Recipe Ingredients
 INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
VALUES
((SELECT recipe_id FROM recipes WHERE title='Classic Pancakes'), (SELECT ingredient_id FROM ingredients WHERE name='Flour'), 200),
((SELECT recipe_id FROM recipes WHERE title='Classic Pancakes'), (SELECT ingredient_id FROM ingredients WHERE name='Eggs'), 2),
((SELECT recipe_id FROM recipes WHERE title='Classic Pancakes'), (SELECT ingredient_id FROM ingredients WHERE name='Sugar'), 50),
((SELECT recipe_id FROM recipes WHERE title='BBQ Chicken'), (SELECT ingredient_id FROM ingredients WHERE name='Salt'), 1),
((SELECT recipe_id FROM recipes WHERE title='BBQ Chicken'), (SELECT ingredient_id FROM ingredients WHERE name='Butter'), 30);

-- RECIPE_STEPS
INSERT INTO recipe_steps (recipe_id, step_number, instruction)
VALUES
((SELECT recipe_id FROM recipes WHERE title='Classic Pancakes'), 1, 'Mix flour, sugar, and salt in a bowl.'),
((SELECT recipe_id FROM recipes WHERE title='Classic Pancakes'), 2, 'Add eggs and milk, then whisk until smooth.'),
((SELECT recipe_id FROM recipes WHERE title='Classic Pancakes'), 3, 'Heat a pan and pour the batter. Cook until golden.'),
((SELECT recipe_id FROM recipes WHERE title='BBQ Chicken'), 1, 'Marinate chicken with spices and BBQ sauce.'),
((SELECT recipe_id FROM recipes WHERE title='BBQ Chicken'), 2, 'Grill until cooked and smoky.');

-- TAGS
INSERT INTO tags (name)
VALUES ('Breakfast'), ('Dessert'), ('BBQ'), ('Quick Meal'), ('Easy');


-- RECIPE_TAGS
INSERT INTO recipe_tags (recipe_id, tag_id)
VALUES
((SELECT recipe_id FROM recipes WHERE title='Classic Pancakes'), (SELECT tag_id FROM tags WHERE name='Breakfast')),
((SELECT recipe_id FROM recipes WHERE title='Classic Pancakes'), (SELECT tag_id FROM tags WHERE name='Easy')),
((SELECT recipe_id FROM recipes WHERE title='BBQ Chicken'), (SELECT tag_id FROM tags WHERE name='BBQ'));

-- FAVORITES
INSERT INTO favorites (user_id, recipe_id)
VALUES
((SELECT user_id FROM users WHERE name='John Doe'), (SELECT recipe_id FROM recipes WHERE title='Classic Pancakes')),
((SELECT user_id FROM users WHERE name='Jane Smith'), (SELECT recipe_id FROM recipes WHERE title='BBQ Chicken'));

-- REVIEWS
INSERT INTO reviews (user_id, recipe_id, rating, comment)
VALUES
((SELECT user_id FROM users WHERE name='John Doe'), (SELECT recipe_id FROM recipes WHERE title='Classic Pancakes'), 5, 'Absolutely delicious and fluffy!'),
((SELECT user_id FROM users WHERE name='Ali Khan'), (SELECT recipe_id FROM recipes WHERE title='Classic Pancakes'), 4, 'Great breakfast idea.'),
((SELECT user_id FROM users WHERE name='Jane Smith'), (SELECT recipe_id FROM recipes WHERE title='BBQ Chicken'), 5, 'Perfect smoky flavor!');

-- COMMENTS
INSERT INTO comments (recipe_id, user_id, text)
VALUES
((SELECT recipe_id FROM recipes WHERE title='Classic Pancakes'), (SELECT user_id FROM users WHERE name='John Doe'), 'Made these today — turned out great!'),
((SELECT recipe_id FROM recipes WHERE title='BBQ Chicken'), (SELECT user_id FROM users WHERE name='Ali Khan'), 'Try adding some lemon juice for extra flavor!');


-- Checking Values
SELECT * FROM users;
SELECT title, difficulty, created_at FROM recipes;
SELECT * FROM recipe_ingredients;
SELECT * FROM reviews;
SELECT * FROM comments;
