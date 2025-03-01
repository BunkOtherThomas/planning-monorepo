import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create a response that will clear the token
    const response = NextResponse.json({ message: 'Logged out successfully' });
    
    // Clear the token cookie if you're using one
    response.cookies.delete('token');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
} 