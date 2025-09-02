import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Seeding is not available in production' },
        { status: 403 }
      );
    }

    console.log('🌱 Starting database seed via API...');

    // Run the seed script
    const { stdout, stderr } = await execAsync('npx tsx prisma/seed.ts', {
      cwd: process.cwd(),
    });

    if (stderr && !stderr.includes('warn')) {
      console.error('Seed stderr:', stderr);
      return NextResponse.json(
        { error: 'Seed script failed', details: stderr },
        { status: 500 }
      );
    }

    console.log('✅ Seed completed via API');
    
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      output: stdout,
    });

  } catch (error) {
    console.error('Seed API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Seed operation failed', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST to trigger database seeding',
    available: process.env.NODE_ENV !== 'production',
  });
}