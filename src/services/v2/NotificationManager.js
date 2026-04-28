/**
 * NotificationManager — Central notification system for V2
 *
 * Handles toast notifications, achievement popups, and alert sounds.
 * Integrates with EventBus to auto-display notifications from any module.
 */

import { EventBus, Events } from '../../core/EventBus';

class NotificationManagerCore {
  constructor() {
    this._listeners = [];
    this._queue = [];
    this._initialized = false;
  }

  /**
   * Initialize event listeners for auto-notifications
   * Call once during app startup
   */
  init() {
    if (this._initialized) return;
    this._initialized = true;

    EventBus.subscribe(Events.ACHIEVEMENT_UNLOCKED, (e) => {
      this.notify({
        type: 'achievement',
        title: 'Achievement Unlocked! 🏆',
        message: `${e.data.badge.icon} ${e.data.badge.name} — ${e.data.badge.desc}`,
        duration: 5000,
      });
    });

    EventBus.subscribe(Events.LEVEL_UP, (e) => {
      this.notify({
        type: 'level_up',
        title: 'Level Up! 🎉',
        message: `You've reached Level ${e.data.level.level}: ${e.data.level.name}`,
        duration: 5000,
      });
    });

    EventBus.subscribe(Events.XP_EARNED, (e) => {
      if (e.data.amount >= 50) {
        this.notify({
          type: 'xp',
          title: `+${e.data.amount} XP`,
          message: e.data.reason || 'Experience earned!',
          duration: 3000,
        });
      }
    });

    EventBus.subscribe(Events.AI_ANOMALY_DETECTED, (e) => {
      this.notify({
        type: 'anomaly',
        title: 'Anomaly Detected 🔍',
        message: e.data.reason || 'Unusual transaction pattern found',
        duration: 5000,
      });
    });

    EventBus.subscribe(Events.AUTOMATION_RULE_TRIGGERED, (e) => {
      this.notify({
        type: 'automation',
        title: `Rule: ${e.data.rule.name}`,
        message: e.data.alert.message,
        duration: 4000,
      });
    });

    EventBus.subscribe(Events.BUDGET_THRESHOLD_REACHED, (e) => {
      this.notify({
        type: 'budget',
        title: 'Budget Alert ⚠️',
        message: e.data.message || 'Budget threshold reached',
        duration: 5000,
      });
    });
  }

  /**
   * Push a notification
   * @param {{ type, title, message, duration }} notification
   */
  notify(notification) {
    const entry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      duration: 4000,
      ...notification,
    };
    this._queue.push(entry);
    for (const listener of this._listeners) {
      listener(entry);
    }
  }

  /**
   * Subscribe to notifications
   * @param {Function} callback
   * @returns {Function} unsubscribe
   */
  subscribe(callback) {
    this._listeners.push(callback);
    return () => {
      this._listeners = this._listeners.filter((l) => l !== callback);
    };
  }

  /** Get notification history */
  getHistory() {
    return [...this._queue].slice(-50);
  }
}

export const NotificationManager = new NotificationManagerCore();
