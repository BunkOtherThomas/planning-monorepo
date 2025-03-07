import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@quest-board/database';

export async function PUT(request: Request) {
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-scroll') as { userId: string };
    
    // Get the favorite skills from the request body
    const { favoriteSkills } = await request.json();

    // Update user's favorite skills
    await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        favoriteSkills
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating favorite skills:', error);
    return NextResponse.json(
      { error: 'Failed to update favorite skills' },
      { status: 500 }
    );
  }
} 