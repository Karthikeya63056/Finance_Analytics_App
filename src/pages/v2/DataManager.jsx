import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { FiDatabase, FiPlay, FiTrash2, FiDownload, FiUpload } from 'react-icons/fi';
import { FinanceContext } from '../../context/FinanceContext';
import { transactionSimulator } from '../../services/v2/TransactionSimulator';
import { serviceLayer } from '../../services/v2/ServiceLayer';
import { GlassCard } from '../../components/v2/ui/GlassCard';

export default function DataManager() {
  const { transactions, addTransaction, setTransactions } = useContext(FinanceContext);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerateDemo = () => {
    setLoading(true);
    setTimeout(() => {
      const demoTxns = transactionSimulator.generate(4);
      // Add each transaction through context
      for (const txn of demoTxns) {
        addTransaction(txn);
      }
      setResult(`Generated ${demoTxns.length} demo transactions (4 months)`);
      setLoading(false);
    }, 500);
  };

  const handleExportJSON = async () => {
    const data = await serviceLayer.exportData('json');
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finalytics-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setResult('Data exported as JSON');
  };

  const handleExportCSV = async () => {
    const data = await serviceLayer.exportData('csv');
    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finalytics-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setResult('Data exported as CSV');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      const res = await serviceLayer.importData(text);
      if (res.success) {
        setResult(`Imported ${res.imported} transactions. Reload the page to see changes.`);
      } else {
        setResult(`Import failed: ${res.error}`);
      }
    };
    input.click();
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 xl:py-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="v2-label">System</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-100">Data Manager</h1>
        <p className="mt-2 max-w-xl text-sm text-gray-400">Generate demo data, import/export, and manage your financial database.</p>
      </motion.div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {/* Current Stats */}
        <GlassCard>
          <div className="flex items-center gap-2">
            <FiDatabase size={16} className="text-cyan-400" />
            <p className="v2-label" style={{ margin: 0 }}>Current data</p>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-100">{transactions.length}</p>
          <p className="mt-1 text-xs text-gray-500">Total transactions</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white/5 p-2 text-center">
              <p className="text-sm font-semibold text-emerald-300">
                {transactions.filter((t) => t.type === 'income').length}
              </p>
              <p className="text-[10px] text-gray-500">Income</p>
            </div>
            <div className="rounded-xl bg-white/5 p-2 text-center">
              <p className="text-sm font-semibold text-rose-300">
                {transactions.filter((t) => t.type === 'expense').length}
              </p>
              <p className="text-[10px] text-gray-500">Expenses</p>
            </div>
          </div>
        </GlassCard>

        {/* Generate Demo */}
        <GlassCard>
          <div className="flex items-center gap-2">
            <FiPlay size={16} className="text-emerald-400" />
            <p className="v2-label" style={{ margin: 0 }}>Demo data</p>
          </div>
          <p className="mt-3 text-sm text-gray-400">Generate 4 months of realistic transactions with anomalies for AI testing.</p>
          <button
            onClick={handleGenerateDemo}
            disabled={loading}
            className="v2-btn v2-btn-primary mt-4 w-full"
          >
            {loading ? 'Generating...' : 'Generate demo data'}
          </button>
        </GlassCard>

        {/* Export/Import */}
        <GlassCard>
          <div className="flex items-center gap-2">
            <FiDownload size={16} className="text-violet-400" />
            <p className="v2-label" style={{ margin: 0 }}>Export / Import</p>
          </div>
          <div className="mt-4 space-y-2">
            <button onClick={handleExportJSON} className="v2-btn v2-btn-ghost w-full justify-start gap-2">
              <FiDownload size={14} /> Export JSON
            </button>
            <button onClick={handleExportCSV} className="v2-btn v2-btn-ghost w-full justify-start gap-2">
              <FiDownload size={14} /> Export CSV
            </button>
            <button onClick={handleImport} className="v2-btn v2-btn-ghost w-full justify-start gap-2">
              <FiUpload size={14} /> Import JSON
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Result Message */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/8 px-5 py-4"
        >
          <p className="text-sm text-emerald-300">{result}</p>
        </motion.div>
      )}
    </div>
  );
}
