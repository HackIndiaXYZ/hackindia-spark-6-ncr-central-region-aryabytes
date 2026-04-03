import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Brain, RefreshCw, Trash2 } from 'lucide-react';
import UploadPanel from './components/UploadPanel';
import TaskDashboard from './components/TaskDashboard';
import InsightsPanel from './components/InsightsPanel';
import { api } from './api';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('deadline');

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const data = await api.getTasks();
      setTasks(data.tasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (file) => {
    try {
      setIsProcessing(true);
      const toastId = toast.loading('🧠 AI is processing your document...');

      const data = await api.uploadFile(file);

      toast.dismiss(toastId);

      if (data.success) {
        setTasks(prev => [...data.tasks, ...prev]);
        toast.success(`✨ ${data.message}`, { duration: 4000 });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to process document');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDemo = async () => {
    try {
      setIsProcessing(true);
      const toastId = toast.loading('Loading sample tasks...');

      const data = await api.loadDemo();

      toast.dismiss(toastId);

      if (data.success) {
        setTasks(prev => [...data.tasks, ...prev]);
        toast.success('🎉 Sample tasks loaded!', { duration: 3000 });
      }
    } catch (error) {
      console.error('Demo error:', error);
      toast.error('Failed to load sample tasks');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success('Task removed', { duration: 2000 });
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleClearAll = async () => {
    if (tasks.length === 0) return;
    try {
      await api.clearTasks();
      setTasks([]);
      toast.success('All tasks cleared', { duration: 2000 });
    } catch (error) {
      toast.error('Failed to clear tasks');
    }
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#1a1a2e' }
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#1a1a2e' }
          }
        }}
      />

      {/* Header */}
      <header className="border-b border-slate-700/30 bg-dark-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 animate-pulse-glow">
                <Brain size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">
                  Life Admin <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI</span>
                </h1>
                <p className="text-xs text-slate-500 -mt-0.5">Your Personal Life Manager</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchTasks}
                className="p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all"
                title="Refresh tasks"
              >
                <RefreshCw size={16} />
              </button>
              <button
                onClick={handleClearAll}
                className="p-2 rounded-lg bg-slate-700/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all"
                title="Clear all tasks"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="spinner mx-auto mb-4" />
              <p className="text-slate-400">Loading your tasks...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* LEFT PANEL – Upload */}
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-24">
                <UploadPanel
                  onUpload={handleUpload}
                  onDemo={handleDemo}
                  isProcessing={isProcessing}
                />
              </div>
            </aside>

            {/* CENTER PANEL – Task Dashboard */}
            <section className="lg:col-span-6">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-white">Task Dashboard</h2>
                {tasks.length > 0 && (
                  <span className="bg-indigo-500/15 text-indigo-400 text-xs font-bold px-2.5 py-1 rounded-lg border border-indigo-500/30">
                    {tasks.length}
                  </span>
                )}
              </div>
              <TaskDashboard
                tasks={tasks}
                onDelete={handleDelete}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                activeSort={activeSort}
                onSortChange={setActiveSort}
              />
            </section>

            {/* RIGHT PANEL – Insights */}
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-24">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Insights</span>
                </h2>
                <InsightsPanel tasks={tasks} />
              </div>
            </aside>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/20 mt-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-slate-600">
            Built with 🧠 AI Processing Engine • No external APIs required
          </p>
          <p className="text-xs text-slate-600">
            Life Admin AI &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
