/**
 * PluginRegistry — Dynamic module loading and lifecycle management
 *
 * Plugins can register:
 * - Routes (injected into the router)
 * - Sidebar items (injected into navigation)
 * - Event listeners (auto-bound on activate)
 * - Services (shared across the app)
 *
 * Lifecycle: register → activate → deactivate → unregister
 */

import { EventBus, Events } from './EventBus';

class PluginRegistryCore {
  constructor() {
    this._plugins = new Map();
    this._activePlugins = new Set();
    this._hooks = new Map();
  }

  /**
   * Register a plugin definition
   * @param {Object} plugin
   * @param {string} plugin.id - Unique plugin identifier
   * @param {string} plugin.name - Display name
   * @param {string} [plugin.version] - Semver version
   * @param {string} [plugin.description] - Plugin description
   * @param {string[]} [plugin.dependencies] - IDs of required plugins
   * @param {Function} [plugin.onInit] - Called on registration
   * @param {Function} [plugin.onActivate] - Called on activation
   * @param {Function} [plugin.onDeactivate] - Called on deactivation
   * @param {Array} [plugin.routes] - Routes to inject: [{ path, element, label, icon }]
   * @param {Array} [plugin.sidebarItems] - Nav items: [{ path, label, icon, section }]
   * @param {Object} [plugin.services] - Named services: { serviceName: serviceInstance }
   */
  register(plugin) {
    if (!plugin.id) {
      throw new Error('[PluginRegistry] Plugin must have an "id" field');
    }

    if (this._plugins.has(plugin.id)) {
      return false;
    }

    const normalized = {
      id: plugin.id,
      name: plugin.name || plugin.id,
      version: plugin.version || '1.0.0',
      description: plugin.description || '',
      dependencies: plugin.dependencies || [],
      routes: plugin.routes || [],
      sidebarItems: plugin.sidebarItems || [],
      services: plugin.services || {},
      onInit: plugin.onInit || null,
      onActivate: plugin.onActivate || null,
      onDeactivate: plugin.onDeactivate || null,
      registeredAt: Date.now(),
    };

    this._plugins.set(plugin.id, normalized);

    if (normalized.onInit) {
      try {
        normalized.onInit({ eventBus: EventBus, registry: this });
      } catch (_) { /* swallow init errors */ }
    }

    return true;
  }

  /**
   * Activate a registered plugin
   */
  activate(pluginId) {
    const plugin = this._plugins.get(pluginId);
    if (!plugin) return false;
    if (this._activePlugins.has(pluginId)) return true;

    for (const depId of plugin.dependencies) {
      if (!this._activePlugins.has(depId)) {
        const activated = this.activate(depId);
        if (!activated) return false;
      }
    }

    if (plugin.onActivate) {
      try {
        plugin.onActivate({ eventBus: EventBus, registry: this });
      } catch (_) { return false; }
    }

    this._activePlugins.add(pluginId);
    EventBus.publish(Events.PLUGIN_ACTIVATED, { pluginId, plugin });
    return true;
  }

  /**
   * Deactivate an active plugin
   */
  deactivate(pluginId) {
    if (!this._activePlugins.has(pluginId)) return false;
    const plugin = this._plugins.get(pluginId);

    for (const [id] of this._plugins) {
      const p = this._plugins.get(id);
      if (p.dependencies.includes(pluginId) && this._activePlugins.has(id)) {
        this.deactivate(id);
      }
    }

    if (plugin?.onDeactivate) {
      try {
        plugin.onDeactivate({ eventBus: EventBus, registry: this });
      } catch (_) { /* swallow */ }
    }

    this._activePlugins.delete(pluginId);
    EventBus.publish(Events.PLUGIN_DEACTIVATED, { pluginId });
    return true;
  }

  /**
   * Unregister a plugin completely
   */
  unregister(pluginId) {
    if (this._activePlugins.has(pluginId)) {
      this.deactivate(pluginId);
    }
    return this._plugins.delete(pluginId);
  }

  /** Get a registered plugin by ID */
  getPlugin(pluginId) {
    return this._plugins.get(pluginId) || null;
  }

  /** Check if a plugin is active */
  isActive(pluginId) {
    return this._activePlugins.has(pluginId);
  }

  /** Get all registered plugins */
  getAll() {
    return Array.from(this._plugins.values());
  }

  /** Get all active plugins */
  getActive() {
    return this.getAll().filter((p) => this._activePlugins.has(p.id));
  }

  /** Collect all routes from active plugins */
  getRoutes() {
    const routes = [];
    for (const plugin of this.getActive()) {
      for (const route of plugin.routes) {
        routes.push({ ...route, pluginId: plugin.id });
      }
    }
    return routes;
  }

  /** Collect all sidebar items from active plugins */
  getSidebarItems() {
    const items = [];
    for (const plugin of this.getActive()) {
      for (const item of plugin.sidebarItems) {
        items.push({ ...item, pluginId: plugin.id });
      }
    }
    return items;
  }

  /** Get a service from any active plugin */
  getService(serviceName) {
    for (const plugin of this.getActive()) {
      if (plugin.services[serviceName]) {
        return plugin.services[serviceName];
      }
    }
    return null;
  }

  /** Register a hook point that plugins can tap into */
  registerHook(hookName) {
    if (!this._hooks.has(hookName)) {
      this._hooks.set(hookName, []);
    }
  }

  /** Add a tap to a hook */
  tapHook(hookName, callback, priority = 0) {
    if (!this._hooks.has(hookName)) {
      this._hooks.set(hookName, []);
    }
    const hooks = this._hooks.get(hookName);
    hooks.push({ callback, priority });
    hooks.sort((a, b) => b.priority - a.priority);
  }

  /** Execute a hook — runs all taps and returns results */
  async executeHook(hookName, context = {}) {
    const hooks = this._hooks.get(hookName);
    if (!hooks) return [];
    const results = [];
    for (const hook of hooks) {
      try {
        const result = await hook.callback(context);
        results.push(result);
      } catch (_) { /* swallow */ }
    }
    return results;
  }

  /** Diagnostic stats */
  get stats() {
    return {
      registered: this._plugins.size,
      active: this._activePlugins.size,
      hooks: this._hooks.size,
    };
  }

  /** Reset everything */
  reset() {
    for (const id of [...this._activePlugins]) {
      this.deactivate(id);
    }
    this._plugins.clear();
    this._activePlugins.clear();
    this._hooks.clear();
  }
}

/** Singleton PluginRegistry */
export const PluginRegistry = new PluginRegistryCore();
