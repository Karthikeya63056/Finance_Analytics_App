/**
 * FeatureFlags — Progressive rollout system
 *
 * All V2 features are gated behind flags.
 * Persists to localStorage under 'v2_feature_flags'
 */

import { EventBus, Events } from './EventBus';

const STORAGE_KEY = 'v2_feature_flags';

const DEFAULT_FLAGS = {
  'v2.enabled': true,
  'v2.theme_engine': true,
  'v2.command_palette': true,
  'v2.ai_chat': true,
  'v2.ai_insights': true,
  'v2.ai_anomaly_detection': true,
  'v2.ai_voice': false,
  'v2.dashboard_pro': true,
  'v2.predictive_charts': true,
  'v2.health_score': true,
  'v2.category_heatmap': true,
  'v2.automation': true,
  'v2.smart_alerts': true,
  'v2.recurring_detection': true,
  'v2.gamification': true,
  'v2.achievements': true,
  'v2.streaks': true,
  'v2.xp_system': true,
  'v2.realtime_engine': true,
  'v2.transaction_simulator': false,
  'v2.money_mood': true,
  'v2.financial_personality': true,
  'v2.weekly_reports': true,
  'v2.smart_nudges': true,
};

class FeatureFlagsCore {
  constructor() {
    this._flags = { ...DEFAULT_FLAGS };
    this._overrides = {};
    this._load();
  }

  _load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this._overrides = JSON.parse(stored);
        Object.assign(this._flags, this._overrides);
      }
    } catch (_) {
      this._overrides = {};
    }
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._overrides));
    } catch (_) { /* ignore */ }
  }

  isEnabled(flag) {
    return Boolean(this._flags[flag]);
  }

  enable(flag) {
    this._flags[flag] = true;
    this._overrides[flag] = true;
    this._save();
    EventBus.publish(Events.FEATURE_FLAG_CHANGED, { flag, enabled: true });
  }

  disable(flag) {
    this._flags[flag] = false;
    this._overrides[flag] = false;
    this._save();
    EventBus.publish(Events.FEATURE_FLAG_CHANGED, { flag, enabled: false });
  }

  toggle(flag) {
    const newState = !this.isEnabled(flag);
    newState ? this.enable(flag) : this.disable(flag);
    return newState;
  }

  setFlags(flagMap) {
    for (const [flag, value] of Object.entries(flagMap)) {
      this._flags[flag] = Boolean(value);
      this._overrides[flag] = Boolean(value);
    }
    this._save();
  }

  getAll() { return { ...this._flags }; }
  getOverrides() { return { ...this._overrides }; }

  reset() {
    this._flags = { ...DEFAULT_FLAGS };
    this._overrides = {};
    this._save();
  }

  resetFlag(flag) {
    if (flag in DEFAULT_FLAGS) {
      this._flags[flag] = DEFAULT_FLAGS[flag];
    } else {
      delete this._flags[flag];
    }
    delete this._overrides[flag];
    this._save();
  }
}

export const FeatureFlags = new FeatureFlagsCore();

export const Flags = Object.fromEntries(
  Object.keys(DEFAULT_FLAGS).map((k) => [k.replace(/\./g, '_').toUpperCase(), k])
);
