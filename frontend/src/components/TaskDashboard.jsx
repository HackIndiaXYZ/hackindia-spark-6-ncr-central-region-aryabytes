import { Calendar, Clock, Trash2, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

const CATEGORY_COLORS = {
  Academic: { bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  Financial: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  Medical: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
  Personal: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' },
};

const URGENCY_CONFIG = {
  High: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/30',
    icon: AlertTriangle,
    glow: 'shadow-red-500/10'
  },
  Medium: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    icon: AlertCircle,
    glow: 'shadow-amber-500/10'
  },
  Low: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    icon: CheckCircle,
    glow: 'shadow-emerald-500/10'
  },
};

function TaskCard({ task, onDelete }) {
  const category = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Personal;
  const urgency = URGENCY_CONFIG[task.urgency] || URGENCY_CONFIG.Low;
  const UrgencyIcon = urgency.icon;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const formatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    if (diffDays < 0) return { text: formatted, relative: 'Overdue', isOverdue: true };
    if (diffDays === 0) return { text: formatted, relative: 'Today', isOverdue: false };
    if (diffDays === 1) return { text: formatted, relative: 'Tomorrow', isOverdue: false };
    return { text: formatted, relative: `${diffDays} days left`, isOverdue: false };
  };

  const dateInfo = formatDate(task.deadline);

  return (
    <div className={`
      task-card glass-card p-4 group relative overflow-hidden
      ${task.urgency === 'High' ? 'border-red-500/20' : ''}
    `}>
      {/* Urgency indicator line */}
      <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl
        ${task.urgency === 'High' ? 'bg-red-500' : task.urgency === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}
      `} />

      <div className="pl-3">
        {/* Top row: Category + Urgency + Delete */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${category.bg} ${category.text} border ${category.border}`}>
              {task.category}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-lg flex items-center gap-1 ${urgency.bg} ${urgency.text} border ${urgency.border}`}>
              <UrgencyIcon size={12} />
              {task.urgency}
            </span>
          </div>
          <button
            onClick={() => onDelete(task.id)}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all duration-200"
            title="Delete task"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white mb-1.5 leading-tight">{task.title}</h3>

        {/* Description */}
        <p className="text-sm text-slate-400 mb-3 line-clamp-2 leading-relaxed">{task.description}</p>

        {/* Deadline */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Calendar size={13} />
            <span className="text-xs">{dateInfo.text}</span>
          </div>
          <span className={`
            text-xs font-semibold px-2 py-0.5 rounded-md
            ${dateInfo.isOverdue ? 'bg-red-500/15 text-red-400' :
              dateInfo.relative === 'Today' || dateInfo.relative === 'Tomorrow'
                ? 'bg-amber-500/15 text-amber-400'
                : 'bg-slate-700/50 text-slate-400'
            }
          `}>
            <Clock size={11} className="inline mr-1 -mt-0.5" />
            {dateInfo.relative}
          </span>
        </div>
      </div>
    </div>
  );
}

const CATEGORIES = ['All', 'Academic', 'Financial', 'Medical', 'Personal'];
const SORT_OPTIONS = [
  { value: 'deadline', label: 'Deadline' },
  { value: 'urgency', label: 'Urgency' },
];

export default function TaskDashboard({ tasks, onDelete, activeFilter, onFilterChange, activeSort, onSortChange }) {
  const filteredTasks = activeFilter === 'All'
    ? tasks
    : tasks.filter(t => t.category === activeFilter);

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (activeSort === 'urgency') {
      const order = { High: 0, Medium: 1, Low: 2 };
      return order[a.urgency] - order[b.urgency];
    }
    return new Date(a.deadline) - new Date(b.deadline);
  });

  return (
    <div className="animate-fade-in-up">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        {/* Category filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => onFilterChange(cat)}
              className={`
                px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200
                ${activeFilter === cat
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-700/30 text-slate-400 border border-transparent hover:bg-slate-700/50 hover:text-slate-300'
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Sort:</span>
          <select
            value={activeSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-slate-700/40 text-slate-300 text-xs border border-slate-600/40 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Task count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-400">
          <span className="text-white font-bold">{sortedTasks.length}</span> task{sortedTasks.length !== 1 ? 's' : ''}
          {activeFilter !== 'All' && <span className="text-indigo-400"> in {activeFilter}</span>}
        </p>
      </div>

      {/* Tasks Grid */}
      {sortedTasks.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
            <Calendar size={28} className="text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No Tasks Yet</h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            Upload a document or try the sample to see AI-extracted tasks appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {sortedTasks.map(task => (
            <TaskCard key={task.id} task={task} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
