/**
 * Plugin entrypoint — registers built-in V2 plugins.
 * External plugins can be added here without touching any other file.
 */

import { PluginRegistry } from '../core/PluginRegistry';
import { FeatureFlags } from '../core/FeatureFlags';

/**
 * Initialize built-in plugins.
 * Called once during app startup in AppV2.
 */
export function initializePlugins() {
  // AI Assistant Plugin
  PluginRegistry.register({
    id: 'ai-assistant',
    name: 'AI Financial Assistant',
    version: '2.0.0',
    description: 'AI-powered financial intelligence with chat, insights, and predictions',
    sidebarItems: [
      { path: '/dashboard-pro', label: 'Dashboard Pro', icon: 'FiActivity', section: 'v2' },
      { path: '/health-score', label: 'Health Score', icon: 'FiHeart', section: 'v2' },
    ],
    onActivate: () => {
      if (FeatureFlags.isEnabled('v2.ai_chat')) {
        // AI engine will self-initialize in Phase 2
      }
    },
  });

  // Automation Plugin
  PluginRegistry.register({
    id: 'automation',
    name: 'Smart Automation',
    version: '2.0.0',
    description: 'Rule-based automation, smart alerts, and recurring detection',
    sidebarItems: [
      { path: '/automation', label: 'Automation', icon: 'FiZap', section: 'v2' },
    ],
  });

  // Gamification Plugin
  PluginRegistry.register({
    id: 'gamification',
    name: 'Gamification',
    version: '2.0.0',
    description: 'XP, badges, streaks, and financial goals',
    sidebarItems: [
      { path: '/achievements', label: 'Achievements', icon: 'FiAward', section: 'v2' },
    ],
  });

  // Activate all built-in plugins
  PluginRegistry.activate('ai-assistant');
  PluginRegistry.activate('automation');
  PluginRegistry.activate('gamification');
}
