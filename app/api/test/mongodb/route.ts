import { NextResponse } from 'next/server';
import { MongoService } from '@/lib/mongodb';

export async function GET() {
  try {
    const testKey = 'test_connection_' + Date.now();
    const testValue = 'mongodb_is_working';

    const setResult = await MongoService.set(testKey, testValue, 60);

    const getValue = await MongoService.get(testKey);

    await MongoService.del(testKey);

    return NextResponse.json({
      success: true,
      message: 'MongoDB connection is working',
      setResult,
      getValue,
      testPassed: getValue === testValue,
    });
  } catch (error) {
    console.error('MongoDB test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'MongoDB connection failed',
      },
      { status: 500 }
    );
  }
}
