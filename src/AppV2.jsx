import React, { lazy, Suspense, useEffect } from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ── V1 Imports (existing components, unchanged) ──────────
import { FinanceProvider } from './context/FinanceContext';
import { Header } from './components/Layout/Header';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { AddTransaction } from './pages/AddTransaction';
import { Budget } from './pages/Budget';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';

// ── V2 Infrastructure ────────────────────────────────────
import { V2Provider } from './context/V2Provider';
import { SidebarV2 } from './components/v2/layout/SidebarV2';
import { BottomNavV2 } from './components/v2/layout/BottomNavV2';
import { AIChat } from './components/v2/AIChat';
import { CommandPalette } from './components/v2/ui/CommandPalette';
import { NotificationToast } from './components/v2/NotificationToast';
import { initializePlugins } from './plugins/index';
import { useV2Orchestrator } from './hooks/useV2Orchestrator';

// ── V2 Styles ────────────────────────────────────────────
import './styles/v2-design-system.css';
import './styles/animations.css';

// ── V2 Pages (lazy-loaded) ──────────────────────────────
const DashboardPro = lazy(() => import('./pages/v2/DashboardPro'));
const FinancialHealthScore = lazy(() => import('./pages/v2/FinancialHealthScore'));
const AutomationRules = lazy(() => import('./pages/v2/AutomationRules'));
const Achievements = lazy(() => import('./pages/v2/Achievements'));
const WeeklyReport = lazy(() => import('./pages/v2/WeeklyReport'));
const DataManager = lazy(() => import('./pages/v2/DataManager'));
const DashboardWithNav = lazy(() => import('./pages/v2/DashboardWithNav'));

// ── Loading fallback ────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Loading</p>
      </div>
    </div>
  );
}

// ── Initialize plugins once ─────────────────────────────
let pluginsInitialized = false;

function AppV2Inner() {
  // Initialize V2 orchestrator (badge engine, automation, streaks)
  useV2Orchestrator();

  useEffect(() => {
    if (!pluginsInitialized) {
      initializePlugins();
      pluginsInitialized = true;
    }
  }, []);

  return (
      <div className="relative min-h-screen overflow-hidden text-gray-300">
            {/* Ambient background glows — identical to original App.jsx */}
            <div className="pointer-events-none absolute -left-24 top-24 h-80 w-80 rounded-full bg-emerald-400/10 blur-[120px]" />
            <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-cyan-400/10 blur-[140px]" />
            <div className="pointer-events-none absolute bottom-0 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[130px]" />

            <div className="flex min-h-screen">
              {/* V2 Sidebar — extends original with V2 nav items */}
              <SidebarV2 />

              <div className="relative z-10 flex flex-1 flex-col">
                {/* Original Header — unchanged, reused directly */}
                <Header />

                <main className="flex-1 overflow-x-hidden p-6 pb-24 md:pb-8">
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* ═══ V1 Routes — exactly as in original App.jsx ═══ */}
                      <Route path="/dashboard" element={<DashboardWithNav />} />
                      <Route path="/transactions" element={<Transactions />} />
                      <Route path="/transactions/new" element={<AddTransaction />} />
                      <Route path="/budget" element={<Budget />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/settings" element={<Settings />} />

                      {/* ═══ V2 Routes — new pages ═══ */}
                      <Route path="/dashboard-pro" element={<DashboardPro />} />
                      <Route path="/health-score" element={<FinancialHealthScore />} />
                      <Route path="/automation" element={<AutomationRules />} />
                      <Route path="/achievements" element={<Achievements />} />
                      <Route path="/weekly-report" element={<WeeklyReport />} />
                      <Route path="/data-manager" element={<DataManager />} />

                      {/* ═══ Default + Catch-all ═══ */}
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </Suspense>
                </main>

                {/* V2 Bottom Nav — extends original with V2 routes */}
                <BottomNavV2 />
              </div>
            </div>

            {/* ═══ V2 Floating Widgets ═══ */}
            <AIChat />
            <CommandPalette />
            <NotificationToast />

            {/* Toast container — identical config to original */}
            <ToastContainer
              position="bottom-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
              toastClassName="!rounded-2xl !border !border-emerald-300/20 !bg-slate-900/90 !text-gray-100 !shadow-xl !backdrop-blur-xl"
              bodyClassName="font-sans"
            />
          </div>
  );
}

/** Outer wrapper — providers must be outside the orchestrator hook */
function AppV2() {
  return (
    <V2Provider>
      <FinanceProvider>
        <Router>
          <AppV2Inner />
        </Router>
      </FinanceProvider>
    </V2Provider>
  );
}

export default AppV2;
