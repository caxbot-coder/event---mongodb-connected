import { MongoService } from './mongodb';
import type { RealTimeStats, UserEvent } from './analytics-types';

async function updateCounters(eventType: string) {
  try {
    const today = new Date().toISOString().split('T')[0];
    await Promise.all([
      MongoService.incr(`analytics:events:${today}`),
      MongoService.incr(`analytics:${eventType}:${today}`),
    ]);
  } catch (error) {
    console.warn('Failed to update counters:', error);
  }
}

export async function recordAnalyticsEvent(event: UserEvent): Promise<void> {
  await MongoService.lPush('analytics:events', JSON.stringify(event));
  await updateCounters(event.eventType);
  if (event.eventType === 'page_view') {
    await MongoService.incr(`analytics:page:${event.page}`);
  }
  const events = await MongoService.lRange('analytics:events', 0, 999);
  if (events.length > 1000) {
    await MongoService.lTrim('analytics:events', 0, 999);
  }
}

export async function getRealTimeStats(): Promise<RealTimeStats> {
  try {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;

    const recentEventsRaw = await MongoService.lRange('analytics:events', 0, 49);
    const recentEvents = recentEventsRaw
      .map((e) => JSON.parse(e) as UserEvent)
      .filter((e) => new Date(e.timestamp).getTime() > fiveMinutesAgo);

    const activeSessions = new Set(recentEvents.map((e) => e.sessionId));

    const pageKeys = await MongoService.keys('analytics:page:*');
    const pageViews = await Promise.all(
      pageKeys.map(async (key: string) => {
        const views = await MongoService.get(key);
        const page = key.replace('analytics:page:', '');
        return { page, views: parseInt(views || '0', 10) };
      })
    );

    const topPages = pageViews.sort((a, b) => b.views - a.views).slice(0, 10);

    const today = new Date().toISOString().split('T')[0];
    const [totalEvents, totalPageViews] = await Promise.all([
      MongoService.get(`analytics:events:${today}`),
      MongoService.get(`analytics:page_view:${today}`),
    ]);

    return {
      activeUsers: activeSessions.size,
      pageViews: parseInt(totalPageViews || '0', 10),
      events: parseInt(totalEvents || '0', 10),
      topPages,
      recentEvents: recentEvents.slice(0, 20),
    };
  } catch (error) {
    console.error('Failed to get real-time stats:', error);
    return {
      activeUsers: 0,
      pageViews: 0,
      events: 0,
      topPages: [],
      recentEvents: [],
    };
  }
}

export async function getHistoricalData(days: number = 7) {
  try {
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const [events, pageViews, clicks, forms] = await Promise.all([
        MongoService.get(`analytics:events:${dateStr}`),
        MongoService.get(`analytics:page_view:${dateStr}`),
        MongoService.get(`analytics:click:${dateStr}`),
        MongoService.get(`analytics:form_submit:${dateStr}`),
      ]);

      data.push({
        date: dateStr,
        events: parseInt(events || '0', 10),
        pageViews: parseInt(pageViews || '0', 10),
        clicks: parseInt(clicks || '0', 10),
        forms: parseInt(forms || '0', 10),
      });
    }

    return data;
  } catch (error) {
    console.error('Failed to get historical data:', error);
    return [];
  }
}
