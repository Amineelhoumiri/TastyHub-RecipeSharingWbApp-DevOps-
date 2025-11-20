// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const user = await query(
      'SELECT id, username, email, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(
      password,
      user.rows[0].password_hash
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // In a real app, you'd create a session or JWT token here
    const { password_hash, ...userWithoutPassword } = user.rows[0];
    
    return NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

