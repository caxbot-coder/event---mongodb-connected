import { NextRequest, NextResponse } from 'next/server';
import { MongoService } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const key = searchParams.get('key');
    const value = searchParams.get('value');
    const ttl = searchParams.get('ttl');

    if (!action) {
      return NextResponse.json({ error: 'Action parameter is required' }, { status: 400 });
    }

    switch (action) {
      case 'get':
        if (!key) {
          return NextResponse.json({ error: 'Key parameter is required for get action' }, { status: 400 });
        }
        const getResult = await MongoService.get(key);
        return NextResponse.json({ key, value: getResult });

      case 'set':
        if (!key || !value) {
          return NextResponse.json({ error: 'Key and value parameters are required for set action' }, { status: 400 });
        }
        const expireSeconds = ttl ? parseInt(ttl) : undefined;
        const setResult = await MongoService.set(key, value, expireSeconds);
        return NextResponse.json({ key, value, ttl: expireSeconds, success: setResult });

      case 'delete':
        if (!key) {
          return NextResponse.json({ error: 'Key parameter is required for delete action' }, { status: 400 });
        }
        const deleteResult = await MongoService.del(key);
        return NextResponse.json({ key, deleted: deleteResult > 0 });

      case 'exists':
        if (!key) {
          return NextResponse.json({ error: 'Key parameter is required for exists action' }, { status: 400 });
        }
        const exists = await MongoService.exists(key);
        return NextResponse.json({ key, exists });

      case 'incr':
        if (!key) {
          return NextResponse.json({ error: 'Key parameter is required for incr action' }, { status: 400 });
        }
        const incrResult = await MongoService.incr(key);
        return NextResponse.json({ key, value: incrResult });

      case 'decr':
        if (!key) {
          return NextResponse.json({ error: 'Key parameter is required for decr action' }, { status: 400 });
        }
        const decrResult = await MongoService.decr(key);
        return NextResponse.json({ key, value: decrResult });

      default:
        return NextResponse.json({ error: 'Invalid action. Supported actions: get, set, delete, exists, incr, decr' }, { status: 400 });
    }
  } catch (error) {
    console.error('Mongo API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, key, value, ttl, field, members, path } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action parameter is required' }, { status: 400 });
    }

    switch (action) {
      case 'hset':
        if (!key || !field || value === undefined) {
          return NextResponse.json({ error: 'Key, field, and value parameters are required for hset action' }, { status: 400 });
        }
        const hsetResult = await MongoService.hSet(key, field, String(value));
        return NextResponse.json({ key, field, value, success: hsetResult > 0 });

      case 'hget':
        if (!key || !field) {
          return NextResponse.json({ error: 'Key and field parameters are required for hget action' }, { status: 400 });
        }
        const hgetResult = await MongoService.hGet(key, field);
        return NextResponse.json({ key, field, value: hgetResult });

      case 'hgetall':
        if (!key) {
          return NextResponse.json({ error: 'Key parameter is required for hgetall action' }, { status: 400 });
        }
        const hgetAllResult = await MongoService.hGetAll(key);
        return NextResponse.json({ key, data: hgetAllResult });

      case 'sadd':
        if (!key || !members || !Array.isArray(members)) {
          return NextResponse.json({ error: 'Key and members array are required for sadd action' }, { status: 400 });
        }
        const saddResult = await MongoService.sAdd(key, ...members.map(String));
        return NextResponse.json({ key, members, added: saddResult });

      case 'smembers':
        if (!key) {
          return NextResponse.json({ error: 'Key parameter is required for smembers action' }, { status: 400 });
        }
        const smembersResult = await MongoService.sMembers(key);
        return NextResponse.json({ key, members: smembersResult });

      case 'jsonset':
        if (!key || !path || value === undefined) {
          return NextResponse.json({ error: 'Key, path, and value parameters are required for jsonset action' }, { status: 400 });
        }
        const jsonSetResult = await MongoService.jsonSet(key, path, value);
        return NextResponse.json({ key, path, value, success: jsonSetResult === 'OK' });

      case 'jsonget':
        if (!key) {
          return NextResponse.json({ error: 'Key parameter is required for jsonget action' }, { status: 400 });
        }
        const jsonGetResult = await MongoService.jsonGet(key, path);
        return NextResponse.json({ key, path, value: jsonGetResult });

      case 'mget':
        if (!key || !Array.isArray(key)) {
          return NextResponse.json({ error: 'Key array is required for mget action' }, { status: 400 });
        }
        const mgetResult = await MongoService.mget(...key);
        return NextResponse.json({ keys: key, values: mgetResult });

      case 'mset':
        if (!key || typeof key !== 'object') {
          return NextResponse.json({ error: 'Key-value object is required for mset action' }, { status: 400 });
        }
        const msetResult = await MongoService.mset(key);
        return NextResponse.json({ data: key, success: msetResult === 'OK' });

      default:
        return NextResponse.json({ error: 'Invalid action. Supported actions: hset, hget, hgetall, sadd, smembers, jsonset, jsonget, mget, mset' }, { status: 400 });
    }
  } catch (error) {
    console.error('Mongo API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
