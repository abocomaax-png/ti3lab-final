import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ isAdmin: false }, { status: 400 });
    }

    // Admin emails من Server Environment Variable
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    
    const isAdmin = adminEmails.includes(email);

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('Error checking admin:', error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
