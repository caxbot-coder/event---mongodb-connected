import { NextResponse } from 'next/server';

export async function GET() {
  const uri = process.env.MONGODB_URI;
  const diagnosis = {
    environment: process.env.NODE_ENV,
    mongodbUri: uri ? 'SET' : 'MISSING',
    mongodbDb: process.env.MONGODB_DB || 'app (default)',
    urlFormat: {
      startsWithMongoProtocol: false,
      looksValid: false,
    },
    recommendations: [] as string[],
  };

  if (uri) {
    diagnosis.urlFormat.startsWithMongoProtocol =
      uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://');
    diagnosis.urlFormat.looksValid = diagnosis.urlFormat.startsWithMongoProtocol;

    if (!diagnosis.urlFormat.startsWithMongoProtocol) {
      diagnosis.recommendations.push('MONGODB_URI should start with mongodb:// or mongodb+srv://');
    }
  } else {
    diagnosis.recommendations.push('MONGODB_URI is missing from environment variables');
  }

  return NextResponse.json(diagnosis);
}
