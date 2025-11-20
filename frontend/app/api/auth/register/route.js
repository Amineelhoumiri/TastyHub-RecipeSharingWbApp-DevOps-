import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const { username, email, password, profile_picture } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'username, email and password are required' }, { status: 400 });
    }

    // Check existing username or email
    const existing = await query('SELECT id FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'A user with that email or username already exists' }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await query(
      'INSERT INTO users (username, email, password_hash, profile_picture) VALUES ($1, $2, $3, $4) RETURNING id, username, email, profile_picture, created_at',
      [username, email, password_hash, profile_picture || null]
    );

    const user = result.rows[0];

    return NextResponse.json({ message: 'User created', user }, { status: 201 });
  } catch (error) {
    // Log error for debugging (in production, use proper logging service)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
