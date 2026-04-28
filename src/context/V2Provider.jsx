import React from 'react';
import { ThemeProvider } from './ThemeContext';
import { AIProvider } from './AIContext';
import { AutomationProvider } from './AutomationContext';
import { GamificationProvider } from './GamificationContext';

/**
 * V2Provider — Master provider that wraps the application with all V2 contexts.
 * This sits OUTSIDE the existing FinanceProvider to avoid any coupling.
 * The context hierarchy:
 *   V2Provider (Theme → AI → Automation → Gamification)
 *     └── FinanceProvider (existing, inside AppV2)
 *           └── App content
 */
export function V2Provider({ children }) {
  return (
    <ThemeProvider>
      <AIProvider>
        <AutomationProvider>
          <GamificationProvider>
            {children}
          </GamificationProvider>
        </AutomationProvider>
      </AIProvider>
    </ThemeProvider>
  );
}
