# Upstash Redis Integration Guide

This project now includes Upstash Redis integration for serverless caching, session management, and real-time data operations.

## What is Upstash?

Upstash is a serverless Redis solution that provides:
- **No server management**: No need to set up or maintain Redis servers
- **Edge-optimized**: Low latency from anywhere in the world
- **Pay-per-use**: Only pay for what you use
- **HTTP-based**: Works seamlessly with serverless functions
- **Free tier**: Generous free plan for development

## Setup

### 1. Create Upstash Account

1. Go to [Upstash Console](https://console.upstash.com/)
2. Sign up with GitHub, Google, or email
3. Create a new database

### 2. Get Connection Details

From your Upstash database dashboard:
- Copy the **REST URL** 
- Copy the **REST Token**

### 3. Environment Configuration

Add these to your `.env` file:

```env
# Upstash Configuration
UPSTASH_REDIS_REST_URL=https://your-actual-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-actual-token-here
```

## Usage Examples

### Basic Operations

```typescript
import { UpstashService } from '@/lib/upstash';

// Set a value
await UpstashService.set('user:123', JSON.stringify({ name: 'John', age: 30 }));

// Get a value
const userData = await UpstashService.get('user:123');
const user = JSON.parse(userData);

// Set with expiration (5 minutes)
await UpstashService.set('session:abc123', 'user_data', 300);

// Delete a key
await UpstashService.del('user:123');

// Check if key exists
const exists = await UpstashService.exists('user:123');

// Increment counter
const counter = await UpstashService.incr('page_views');
```

### Hash Operations

```typescript
// Store user profile as hash
await UpstashService.hSet('profile:123', 'name', 'John Doe');
await UpstashService.hSet('profile:123', 'email', 'john@example.com');
await UpstashService.hSet('profile:123', 'age', '30');

// Get specific field
const name = await UpstashService.hGet('profile:123', 'name');

// Get all fields
const profile = await UpstashService.hGetAll('profile:123');
```

### JSON Operations (Upstash Specific)

```typescript
// Store complex JSON data
await UpstashService.jsonSet('user:123:profile', '$', {
  name: 'John Doe',
  email: 'john@example.com',
  preferences: {
    theme: 'dark',
    notifications: true
  }
});

// Get JSON data
const profile = await UpstashService.jsonGet('user:123:profile');

// Get specific JSON path
const theme = await UpstashService.jsonGet('user:123:profile', '$.preferences.theme');
```

### Batch Operations

```typescript
// Set multiple keys at once
await UpstashService.mset({
  'user:123:name': 'John',
  'user:123:email': 'john@example.com',
  'user:123:age': '30'
});

// Get multiple keys at once
const values = await UpstashService.mget('user:123:name', 'user:123:email', 'user:123:age');
```

## API Endpoints

### GET /api/upstash

Basic Upstash operations:

- `GET /api/upstash?action=get&key=user:123` - Get value
- `GET /api/upstash?action=set&key=user:123&value=John&ttl=300` - Set value with optional TTL
- `GET /api/upstash?action=delete&key=user:123` - Delete key
- `GET /api/upstash?action=exists&key=user:123` - Check if key exists
- `GET /api/upstash?action=incr&key=counter` - Increment counter
- `GET /api/upstash?action=decr&key=counter` - Decrement counter

### POST /api/upstash

Advanced Upstash operations:

```json
// Hash operations
{
  "action": "hset",
  "key": "profile:123",
  "field": "name",
  "value": "John Doe"
}

{
  "action": "hget",
  "key": "profile:123",
  "field": "name"
}

{
  "action": "hgetall",
  "key": "profile:123"
}

// JSON operations
{
  "action": "jsonset",
  "key": "user:123:profile",
  "path": "$",
  "value": {"name": "John", "age": 30}
}

{
  "action": "jsonget",
  "key": "user:123:profile",
  "path": "$.name"
}

// Batch operations
{
  "action": "mset",
  "key": {
    "user:123:name": "John",
    "user:123:email": "john@example.com"
  }
}

{
  "action": "mget",
  "key": ["user:123:name", "user:123:email"]
}
```

## Common Use Cases

### 1. Session Storage
```typescript
// Store session data
await UpstashService.set(`session:${sessionId}`, JSON.stringify({
  userId,
  email,
  expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
}), 86400); // 24 hours TTL

// Retrieve session
const sessionData = JSON.parse(await UpstashService.get(`session:${sessionId}`));
```

### 2. API Response Caching
```typescript
// Cache API response
const cacheKey = `api:users:${page}:${limit}`;
const cached = await UpstashService.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

// Fetch fresh data
const data = await fetchUsers(page, limit);
await UpstashService.set(cacheKey, JSON.stringify(data), 300); // 5 minutes
```

### 3. Rate Limiting
```typescript
// Simple rate limiter
const clientId = req.ip;
const windowStart = Math.floor(Date.now() / 60000); // 1-minute window
const key = `rate_limit:${clientId}:${windowStart}`;

const requests = await UpstashService.incr(key);
if (requests === 1) {
  await UpstashService.expire(key, 60); // Expire after 1 minute
}

if (requests > 100) { // 100 requests per minute
  return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
}
```

### 4. Real-time Features
```typescript
// Store online users
await UpstashService.sAdd('online_users', userId);

// Get online count
const onlineUsers = await UpstashService.sMembers('online_users');

// Remove user on disconnect
await UpstashService.sAdd('offline_users', userId);
```

### 5. User Preferences
```typescript
// Store user preferences as JSON
await UpstashService.jsonSet(`user:${userId}:prefs`, '$', {
  theme: 'dark',
  notifications: true,
  language: 'en'
});

// Update specific preference
await UpstashService.jsonSet(`user:${userId}:prefs`, '$.theme', 'light');

// Get user preferences
const prefs = await UpstashService.jsonGet(`user:${userId}:prefs`);
```

## Benefits of Upstash

### ✅ **No Infrastructure Management**
- No servers to provision or maintain
- Automatic scaling
- Built-in high availability

### ✅ **Perfect for Serverless**
- HTTP-based API
- Works great with Vercel, Netlify, etc.
- Cold start friendly

### ✅ **Global Performance**
- Edge locations worldwide
- Low latency from anywhere
- Automatic data replication

### ✅ **Cost Effective**
- Generous free tier (10K commands/day)
- Pay-per-use pricing
- No idle costs

### ✅ **Developer Friendly**
- Redis-compatible API
- Great TypeScript support
- Easy to integrate

## Error Handling

The Upstash service includes built-in error handling. Always wrap operations in try-catch blocks:

```typescript
try {
  const result = await UpstashService.get('some_key');
  // Process result
} catch (error) {
  console.error('Upstash operation failed:', error);
  // Fallback to database or default value
}
```

## Monitoring

Upstash provides a dashboard to monitor:
- Request metrics
- Error rates
- Memory usage
- Performance analytics

Access your dashboard at [console.upstash.com](https://console.upstash.com)

## Migration from Redis

If you're migrating from traditional Redis:

1. **Replace imports**: Change `import { RedisService }` to `import { UpstashService }`
2. **Update environment variables**: Use Upstash URLs and tokens
3. **Update API endpoints**: Change from `/api/redis` to `/api/upstash`
4. **Test**: All Redis commands work the same way

The API is fully compatible, so most code changes are minimal!
