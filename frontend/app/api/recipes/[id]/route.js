// app/api/recipes/[id]/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Get recipe details
    const recipeQuery = `
      SELECT 
        r.*,
        u.username,
        u.profile_picture,
        COALESCE(AVG(rev.rating), 0) as average_rating,
        COUNT(DISTINCT rev.id) as review_count,
        COUNT(DISTINCT l.user_id) as like_count,
        COUNT(DISTINCT f.user_id) as favorite_count,
        ARRAY_AGG(DISTINCT t.tag_name) as tags
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN reviews rev ON r.id = rev.recipe_id
      LEFT JOIN likes l ON r.id = l.recipe_id
      LEFT JOIN favorites f ON r.id = f.recipe_id
      LEFT JOIN recipe_tags rt ON r.id = rt.recipe_id
      LEFT JOIN tags t ON rt.tag_id = t.id
      WHERE r.id = $1
      GROUP BY r.id, u.id
    `;

    const recipeResult = await query(recipeQuery, [id]);
    
    if (recipeResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Get ingredients
    const ingredientsQuery = `
      SELECT * FROM recipe_ingredients 
      WHERE recipe_id = $1 
      ORDER BY id
    `;
    const ingredientsResult = await query(ingredientsQuery, [id]);

    // Get steps
    const stepsQuery = `
      SELECT * FROM recipe_steps 
      WHERE recipe_id = $1 
      ORDER BY step_number
    `;
    const stepsResult = await query(stepsQuery, [id]);

    // Get reviews
    const reviewsQuery = `
      SELECT rev.*, u.username, u.profile_picture
      FROM reviews rev
      LEFT JOIN users u ON rev.user_id = u.id
      WHERE rev.recipe_id = $1
      ORDER BY rev.created_at DESC
    `;
    const reviewsResult = await query(reviewsQuery, [id]);

    const recipe = {
      ...recipeResult.rows[0],
      ingredients: ingredientsResult.rows,
      steps: stepsResult.rows,
      reviews: reviewsResult.rows
    };

    return NextResponse.json(recipe);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}