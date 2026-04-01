import type { UserEvent } from './analytics-types';

export type { UserEvent } from './analytics-types';

export class AnalyticsService {
  private static sessionId: string;

  static init() {
    console.log('Analytics tracking temporarily disabled');
    return;

    if (typeof window !== 'undefined') {
      this.sessionId =
        sessionStorage.getItem('analytics_session') || this.generateSessionId();
      sessionStorage.setItem('analytics_session', this.sessionId);

      this.trackEvent('page_view', window.location.pathname);
      this.trackPageViews();
      this.trackClicks();
      this.trackForms();
    }
  }

  private static generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  static async trackEvent(
    eventType: UserEvent['eventType'],
    page?: string,
    data?: Record<string, unknown>
  ) {
    if (typeof window === 'undefined') return;

    if (!this.sessionId) {
      this.sessionId =
        sessionStorage.getItem('analytics_session') || this.generateSessionId();
      sessionStorage.setItem('analytics_session', this.sessionId);
    }

    const event: UserEvent = {
      sessionId: this.sessionId,
      eventType,
      page: page || window.location.pathname,
      data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    try {
      const res = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      if (!res.ok) {
        console.warn('Analytics track request failed:', res.status);
      }
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  private static trackPageViews() {
    if (typeof window === 'undefined') return;

    let lastPath = window.location.pathname;

    const checkPathChange = () => {
      const currentPath = window.location.pathname;
      if (currentPath !== lastPath) {
        lastPath = currentPath;
        this.trackEvent('page_view', currentPath);
      }
    };

    setInterval(checkPathChange, 100);
  }

  private static trackClicks() {
    if (typeof window === 'undefined') return;

    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const elementData = {
        tagName: target.tagName,
        id: target.id,
        className: target.className,
        text: target.textContent?.slice(0, 50),
        href: (target as HTMLAnchorElement)?.href,
      };

      this.trackEvent('click', window.location.pathname, elementData);
    });
  }

  private static trackForms() {
    if (typeof window === 'undefined') return;

    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      const formData = {
        formId: form.id,
        formClass: form.className,
        action: form.action,
      };

      this.trackEvent('form_submit', window.location.pathname, formData);
    });
  }
}
