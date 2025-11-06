type EventCallback = () => void;

class EventEmitter {
  private events: Map<string, EventCallback[]> = new Map();

  on(event: string, callback: EventCallback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  off(event: string, callback: EventCallback) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      this.events.set(event, callbacks.filter(cb => cb !== callback));
    }
  }

  emit(event: string) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb());
    }
  }
}

export const authEvents = new EventEmitter();

export const AUTH_EVENTS = {
  SESSION_EXPIRED: 'session-expired',
} as const;
