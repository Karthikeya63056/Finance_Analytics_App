import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FinanceProvider } from "./context/FinanceContext";
import { Sidebar } from "./components/Layout/Sidebar";
import { Header } from "./components/Layout/Header";
import { BottomNav } from "./components/Layout/BottomNav";
import { Dashboard } from "./pages/Dashboard";
import { Transactions } from "./pages/Transactions";
import { AddTransaction } from "./pages/AddTransaction";
import { Budget } from "./pages/Budget";
import { Analytics } from "./pages/Analytics";
import { Settings } from "./pages/Settings";

function App() {
  return (
    <FinanceProvider>
      <Router>
        <div className="relative min-h-screen overflow-hidden text-gray-300">
          <div className="pointer-events-none absolute -left-24 top-24 h-80 w-80 rounded-full bg-emerald-400/10 blur-[120px]" />
          <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-cyan-400/10 blur-[140px]" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[130px]" />
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="relative z-10 flex flex-1 flex-col">
              <Header />
              <main className="flex-1 overflow-x-hidden p-6 pb-24 md:pb-8">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route
                    path="/transactions/new"
                    element={<AddTransaction />}
                  />
                  <Route path="/budget" element={<Budget />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                  />
                  <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                  />
                </Routes>
              </main>
              <BottomNav />
            </div>
          </div>
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
      </Router>
    </FinanceProvider>
  );
}

export default App;
