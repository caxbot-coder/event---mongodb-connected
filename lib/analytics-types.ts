export interface UserEvent {
  userId?: string;
  sessionId: string;
  eventType: 'page_view' | 'click' | 'form_submit' | 'purchase' | 'login' | 'logout' | 'error';
  page: string;
  data?: Record<string, unknown>;
  timestamp: string;
  userAgent: string;
  ip?: string;
}

export interface RealTimeStats {
  activeUsers: number;
  pageViews: number;
  events: number;
  topPages: Array<{ page: string; views: number }>;
  recentEvents: UserEvent[];
}
