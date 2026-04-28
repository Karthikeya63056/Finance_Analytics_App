/**
 * EventBus — Global publish/subscribe event system
 * 
 * Features:
 * - Typed event subscriptions with priority ordering
 * - Wildcard pattern matching (e.g., 'transaction.*')
 * - Event history with replay capability
 * - Middleware pipeline for event interception
 * - Auto-cleanup via returned unsubscribe functions
 * - Singleton instance for app-wide use
 */

class EventBusCore {
  constructor() {
    this._listeners = new Map();
    this._history = [];
    this._maxHistory = 200;
    this._middlewares = [];
    this._paused = false;
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name (supports wildcards: 'transaction.*')
   * @param {Function} callback - Handler receiving { type, data, timestamp, id }
   * @param {Object} [options] - { priority: number, once: boolean }
   * @returns {Function} Unsubscribe function
   */
  subscribe(event, callback, options = {}) {
    const { priority = 0, once = false } = options;

    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }

    const listener = { callback, priority, once, id: crypto.randomUUID() };
    const listeners = this._listeners.get(event);
    listeners.push(listener);
    listeners.sort((a, b) => b.priority - a.priority);

    return () => this.unsubscribe(event, callback);
  }

  /**
   * Subscribe to an event — auto-unsubscribes after first trigger
   */
  once(event, callback, options = {}) {
    return this.subscribe(event, callback, { ...options, once: true });
  }

  /**
   * Unsubscribe a specific callback from an event
   */
  unsubscribe(event, callback) {
    if (!this._listeners.has(event)) return;
    const listeners = this._listeners.get(event);
    const index = listeners.findIndex((l) => l.callback === callback);
    if (index !== -1) listeners.splice(index, 1);
    if (listeners.length === 0) this._listeners.delete(event);
  }

  /**
   * Publish an event to all matching listeners
   * @param {string} event - Event name
   * @param {*} [data] - Event payload
   * @returns {Object} The event payload object
   */
  publish(event, data = {}) {
    if (this._paused) return null;

    const eventPayload = {
      type: event,
      data,
      timestamp: Date.now(),
      id: crypto.randomUUID(),
    };

    for (const middleware of this._middlewares) {
      const result = middleware(eventPayload);
      if (result === false) return null;
    }

    this._history.push(eventPayload);
    if (this._history.length > this._maxHistory) {
      this._history = this._history.slice(-this._maxHistory);
    }

    this._dispatch(event, eventPayload);

    for (const [pattern] of this._listeners) {
      if (pattern !== event && this._matchWildcard(pattern, event)) {
        this._dispatchTo(pattern, eventPayload);
      }
    }

    return eventPayload;
  }

  /** @private */
  _dispatch(event, payload) {
    const listeners = this._listeners.get(event);
    if (!listeners || listeners.length === 0) return;

    const toRemove = [];

    for (const listener of [...listeners]) {
      try {
        listener.callback(payload);
      } catch (err) {
        /* istanbul ignore next */
        if (process.env.NODE_ENV !== 'production') {
          console.error(`[EventBus] Error in listener for "${event}":`, err);
        }
      }
      if (listener.once) toRemove.push(listener);
    }

    for (const listener of toRemove) {
      const idx = listeners.indexOf(listener);
      if (idx !== -1) listeners.splice(idx, 1);
    }
  }

  /** @private */
  _dispatchTo(pattern, payload) {
    const listeners = this._listeners.get(pattern);
    if (!listeners) return;
    for (const listener of [...listeners]) {
      try {
        listener.callback(payload);
      } catch (_) { /* swallow */ }
    }
  }

  /** @private */
  _matchWildcard(pattern, event) {
    if (pattern === '*') return true;
    const regex = new RegExp(
      '^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '[^.]+') + '$'
    );
    return regex.test(event);
  }

  /**
   * Add middleware that intercepts all events before dispatch
   * Return false from middleware to cancel the event
   * @returns {Function} Remove middleware function
   */
  use(middleware) {
    this._middlewares.push(middleware);
    return () => {
      const idx = this._middlewares.indexOf(middleware);
      if (idx !== -1) this._middlewares.splice(idx, 1);
    };
  }

  /**
   * Replay stored event history matching a pattern
   */
  replay(eventPattern, callback) {
    const matching = this._history.filter(
      (e) => e.type === eventPattern || this._matchWildcard(eventPattern, e.type)
    );
    matching.forEach(callback);
  }

  /**
   * Get event history, optionally filtered by event name
   */
  getHistory(event = null) {
    if (!event) return [...this._history];
    return this._history.filter(
      (e) => e.type === event || this._matchWildcard(event, e.type)
    );
  }

  /** Pause all event dispatching */
  pause() { this._paused = true; }

  /** Resume event dispatching */
  resume() { this._paused = false; }

  /** Clear all listeners, history, and middlewares */
  reset() {
    this._listeners.clear();
    this._history = [];
    this._middlewares = [];
    this._paused = false;
  }

  /** Diagnostic stats */
  get stats() {
    let listenerCount = 0;
    for (const listeners of this._listeners.values()) {
      listenerCount += listeners.length;
    }
    return {
      listenerCount,
      eventTypes: this._listeners.size,
      historySize: this._history.length,
      paused: this._paused,
    };
  }
}

/** Singleton EventBus instance */
export const EventBus = new EventBusCore();

/** Typed event constants for cross-module communication */
export const Events = {
  // ── Transaction lifecycle ──────────────────────────────────
  TRANSACTION_ADDED:       'transaction.added',
  TRANSACTION_DELETED:     'transaction.deleted',
  TRANSACTION_UPDATED:     'transaction.updated',
  TRANSACTION_IMPORTED:    'transaction.imported',

  // ── AI intelligence ────────────────────────────────────────
  AI_INSIGHT_GENERATED:    'ai.insight.generated',
  AI_CHAT_MESSAGE:         'ai.chat.message',
  AI_CHAT_RESPONSE:        'ai.chat.response',
  AI_ANALYSIS_COMPLETE:    'ai.analysis.complete',
  AI_ANOMALY_DETECTED:     'ai.anomaly.detected',
  AI_FORECAST_READY:       'ai.forecast.ready',

  // ── Automation ─────────────────────────────────────────────
  AUTOMATION_RULE_TRIGGERED:  'automation.rule.triggered',
  AUTOMATION_RULE_CREATED:    'automation.rule.created',
  AUTOMATION_ALERT_FIRED:     'automation.alert.fired',
  BUDGET_THRESHOLD_REACHED:   'automation.budget.threshold',
  RECURRING_DETECTED:         'automation.recurring.detected',

  // ── Gamification ───────────────────────────────────────────
  ACHIEVEMENT_UNLOCKED:    'gamification.achievement.unlocked',
  STREAK_UPDATED:          'gamification.streak.updated',
  XP_EARNED:               'gamification.xp.earned',
  LEVEL_UP:                'gamification.level.up',
  GOAL_PROGRESS:           'gamification.goal.progress',

  // ── System ─────────────────────────────────────────────────
  THEME_CHANGED:           'system.theme.changed',
  FEATURE_FLAG_CHANGED:    'system.feature.flag.changed',
  PLUGIN_ACTIVATED:        'system.plugin.activated',
  PLUGIN_DEACTIVATED:      'system.plugin.deactivated',
  CACHE_INVALIDATED:       'system.cache.invalidated',
  COMMAND_PALETTE_OPEN:    'system.command.palette.open',
  COMMAND_PALETTE_CLOSE:   'system.command.palette.close',

  // ── Real-time ──────────────────────────────────────────────
  REALTIME_CONNECTED:      'realtime.connected',
  REALTIME_DISCONNECTED:   'realtime.disconnected',
  REALTIME_TRANSACTION:    'realtime.transaction',
  REALTIME_HEARTBEAT:      'realtime.heartbeat',
};
