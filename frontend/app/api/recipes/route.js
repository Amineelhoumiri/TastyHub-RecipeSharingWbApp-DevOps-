// app/api/recipes/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');

    let sql = `
      SELECT 
        r.*,
        u.username,
        u.profile_picture,
        COALESCE(AVG(rev.rating), 0) as average_rating,
        COUNT(DISTINCT rev.id) as review_count,
        COUNT(DISTINCT l.user_id) as like_count,
        ARRAY_AGG(DISTINCT t.tag_name) as tags
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN reviews rev ON r.id = rev.recipe_id
      LEFT JOIN likes l ON r.id = l.recipe_id
      LEFT JOIN recipe_tags rt ON r.id = rt.recipe_id
      LEFT JOIN tags t ON rt.tag_id = t.id
    `;

    const params = [];
    const conditions = [];

    if (search) {
      conditions.push(`(r.title ILIKE $${params.length + 1} OR r.description ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }

    if (tag) {
      conditions.push(`t.tag_name = $${params.length + 1}`);
      params.push(tag);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` GROUP BY r.id, u.id ORDER BY r.created_at DESC`;

    const recipes = await query(sql, params);

    return NextResponse.json(recipes.rows);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}