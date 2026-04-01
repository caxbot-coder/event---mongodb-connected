import { MongoClient, type Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'app';

declare global {
  // eslint-disable-next-line no-var -- Next.js dev HMR cache
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to your environment.');
  }
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  return global._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(dbName);
}

const COL = {
  json: 'json_store',
  kv: 'kv_strings',
  counters: 'counters',
  lists: 'lists',
  sets: 'sets',
  hashes: 'hashes',
} as const;

/** String _id documents (Redis-style keys) */
type JsonStoreDoc = { _id: string; value: unknown };
type KvDoc = { _id: string; value: string; expireAt?: Date };
type CounterDoc = { _id: string; value: number };
type ListDoc = { _id: string; items: string[] };
type SetDoc = { _id: string; members: string[] };
type HashDoc = { _id: string; fields?: Record<string, string> };
type AnyIdDoc = { _id: string };

function globToRegex(pattern: string): RegExp {
  const parts = pattern.split('*').map((p) => p.replace(/[.+^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`^${parts.join('.*')}$`);
}

function getByJsonPath(obj: unknown, path?: string): unknown {
  if (path == null || path === '' || path === '$') return obj;
  const parts = path.replace(/^\$\.?/, '').split('.').filter(Boolean);
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function setByJsonPath(base: unknown, path: string, value: unknown): unknown {
  if (path === '$') return value;
  const parts = path.replace(/^\$\.?/, '').split('.').filter(Boolean);
  const clone =
    base != null && typeof base === 'object'
      ? (JSON.parse(JSON.stringify(base)) as Record<string, unknown>)
      : {};
  let cur: Record<string, unknown> = clone;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (cur[p] == null || typeof cur[p] !== 'object') cur[p] = {};
    cur = cur[p] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value as unknown;
  return clone;
}

export class MongoService {
  static async jsonSet(key: string, path: string, value: unknown): Promise<string> {
    const db = await getDb();
    const coll = db.collection<JsonStoreDoc>(COL.json);
    if (path === '$') {
      await coll.updateOne({ _id: key }, { $set: { value } }, { upsert: true });
      return 'OK';
    }
    const existing = await coll.findOne({ _id: key });
    const next = setByJsonPath(existing?.value, path, value);
    await coll.updateOne({ _id: key }, { $set: { value: next } }, { upsert: true });
    return 'OK';
  }

  static async jsonGet<T = any>(key: string, path?: string): Promise<T | null> {
    const db = await getDb();
    const doc = await db.collection<JsonStoreDoc>(COL.json).findOne({ _id: key });
    if (!doc) return null;
    return getByJsonPath(doc.value, path) as T | null;
  }

  static async set(key: string, value: string, expireInSeconds?: number): Promise<boolean> {
    const db = await getDb();
    const expireAt =
      expireInSeconds != null ? new Date(Date.now() + expireInSeconds * 1000) : undefined;
    await db.collection<KvDoc>(COL.kv).updateOne(
      { _id: key },
      { $set: { value, ...(expireAt ? { expireAt } : {}) } },
      { upsert: true }
    );
    return true;
  }

  static async get(key: string): Promise<string | null> {
    const db = await getDb();
    const kv = await db.collection<KvDoc>(COL.kv).findOne({ _id: key });
    if (kv) {
      if (kv.expireAt && kv.expireAt.getTime() < Date.now()) {
        await db.collection<KvDoc>(COL.kv).deleteOne({ _id: key });
        return null;
      }
      return kv.value;
    }
    const ctr = await db.collection<CounterDoc>(COL.counters).findOne({ _id: key });
    if (ctr) return String(ctr.value);
    return null;
  }

  static async del(key: string): Promise<number> {
    const db = await getDb();
    let n = 0;
    for (const c of Object.values(COL)) {
      const r = await db.collection<AnyIdDoc>(c).deleteOne({ _id: key });
      if (r.deletedCount) n += r.deletedCount;
    }
    return n;
  }

  static async exists(key: string): Promise<boolean> {
    const db = await getDb();
    for (const c of Object.values(COL)) {
      const found = await db.collection<AnyIdDoc>(c).findOne({ _id: key }, { projection: { _id: 1 } });
      if (found) return true;
    }
    return false;
  }

  static async expire(key: string, seconds: number): Promise<boolean> {
    const db = await getDb();
    const expireAt = new Date(Date.now() + seconds * 1000);
    const r = await db
      .collection<KvDoc>(COL.kv)
      .updateOne({ _id: key }, { $set: { expireAt } });
    return r.matchedCount > 0;
  }

  static async ttl(key: string): Promise<number> {
    const db = await getDb();
    const doc = await db.collection<KvDoc>(COL.kv).findOne({ _id: key });
    if (!doc?.expireAt) return -1;
    const sec = Math.ceil((doc.expireAt.getTime() - Date.now()) / 1000);
    return sec < 0 ? -2 : sec;
  }

  static async incr(key: string): Promise<number> {
    const db = await getDb();
    const coll = db.collection<CounterDoc>(COL.counters);
    await coll.updateOne(
      { _id: key },
      { $inc: { value: 1 }, $setOnInsert: { _id: key } },
      { upsert: true }
    );
    const doc = await coll.findOne({ _id: key });
    return doc?.value ?? 0;
  }

  static async decr(key: string): Promise<number> {
    const db = await getDb();
    const coll = db.collection<CounterDoc>(COL.counters);
    await coll.updateOne(
      { _id: key },
      { $inc: { value: -1 }, $setOnInsert: { _id: key } },
      { upsert: true }
    );
    const doc = await coll.findOne({ _id: key });
    return doc?.value ?? 0;
  }

  static async hSet(key: string, field: string, value: string): Promise<number> {
    const db = await getDb();
    await db.collection<HashDoc>(COL.hashes).updateOne(
      { _id: key },
      { $set: { [`fields.${field}`]: value } },
      { upsert: true }
    );
    return 1;
  }

  static async hGet(key: string, field: string): Promise<string | null> {
    const db = await getDb();
    const doc = await db.collection<HashDoc>(COL.hashes).findOne({ _id: key });
    return doc?.fields?.[field] ?? null;
  }

  static async hGetAll(key: string): Promise<Record<string, string> | null> {
    const db = await getDb();
    const doc = await db.collection<HashDoc>(COL.hashes).findOne({ _id: key });
    return doc?.fields ?? null;
  }

  static async hDel(key: string, field: string): Promise<number> {
    const db = await getDb();
    const r = await db.collection<HashDoc>(COL.hashes).updateOne({ _id: key }, { $unset: { [`fields.${field}`]: '' } });
    return r.modifiedCount;
  }

  static async lPush(key: string, ...values: string[]): Promise<number> {
    const db = await getDb();
    const coll = db.collection<ListDoc>(COL.lists);
    const doc = await coll.findOne({ _id: key });
    let items = doc?.items ?? [];
    for (const v of values) {
      items = [v, ...items];
    }
    await coll.updateOne({ _id: key }, { $set: { items } }, { upsert: true });
    return items.length;
  }

  static async rPop(key: string): Promise<string | null> {
    const db = await getDb();
    const doc = await db.collection<ListDoc>(COL.lists).findOne({ _id: key });
    if (!doc?.items?.length) return null;
    const popped = doc.items[doc.items.length - 1];
    await db.collection<ListDoc>(COL.lists).updateOne({ _id: key }, { $pop: { items: 1 } });
    return popped;
  }

  static async lRange(key: string, start: number, stop: number): Promise<string[]> {
    const db = await getDb();
    const doc = await db.collection<ListDoc>(COL.lists).findOne({ _id: key });
    const items = doc?.items ?? [];
    const end = stop < 0 ? items.length + stop : stop;
    return items.slice(start, end + 1);
  }

  static async lTrim(key: string, start: number, stop: number): Promise<string> {
    const db = await getDb();
    const doc = await db.collection<ListDoc>(COL.lists).findOne({ _id: key });
    const items = doc?.items ?? [];
    const end = stop < 0 ? items.length + stop : stop;
    const next = items.slice(start, end + 1);
    await db.collection<ListDoc>(COL.lists).updateOne({ _id: key }, { $set: { items: next } }, { upsert: true });
    return 'OK';
  }

  static async sAdd(key: string, ...members: string[]): Promise<number> {
    const db = await getDb();
    const prev = await db.collection<SetDoc>(COL.sets).findOne({ _id: key });
    const prevSet = new Set(prev?.members ?? []);
    const unique = [...new Set(members)];
    const newCount = unique.filter((m) => !prevSet.has(m)).length;
    if (newCount === 0) return 0;
    await db.collection<SetDoc>(COL.sets).updateOne(
      { _id: key },
      { $addToSet: { members: { $each: unique } } },
      { upsert: true }
    );
    return newCount;
  }

  static async sMembers(key: string): Promise<string[]> {
    const db = await getDb();
    const doc = await db.collection<SetDoc>(COL.sets).findOne({ _id: key });
    return doc?.members ?? [];
  }

  static async sIsMember(key: string, member: string): Promise<boolean> {
    const members = await this.sMembers(key);
    return members.includes(member);
  }

  static async sRem(key: string, ...members: string[]): Promise<number> {
    const db = await getDb();
    const r = await db.collection<SetDoc>(COL.sets).updateOne(
      { _id: key },
      { $pullAll: { members } }
    );
    return r.modifiedCount;
  }

  static async keys(pattern: string): Promise<string[]> {
    const db = await getDb();
    const re = globToRegex(pattern);
    const ids = new Set<string>();
    for (const c of Object.values(COL)) {
      const cursor = db.collection<AnyIdDoc>(c).find({ _id: { $regex: re } }, { projection: { _id: 1 } });
      for await (const d of cursor) {
        if (typeof d._id === 'string') ids.add(d._id);
      }
    }
    return [...ids];
  }

  static async mget(...keys: string[]): Promise<(string | null)[]> {
    return Promise.all(keys.map((k) => this.get(k)));
  }

  static async mset(keyValues: Record<string, string>): Promise<string> {
    const db = await getDb();
    const ops = Object.entries(keyValues).map(([k, v]) => ({
      updateOne: {
        filter: { _id: k },
        update: { $set: { value: v } },
        upsert: true,
      },
    }));
    if (ops.length) await db.collection<KvDoc>(COL.kv).bulkWrite(ops);
    return 'OK';
  }
}
