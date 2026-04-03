import { Clock, AlertTriangle, BarChart3, TrendingUp } from 'lucide-react';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getHeatmapColor(count) {
  if (count === 0) return { bg: 'bg-slate-700/30', text: 'text-slate-600', label: 'Free' };
  if (count <= 2) return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Light' };
  if (count <= 5) return { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Moderate' };
  return { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Heavy' };
}

function getWeekDates() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }
  return dates;
}

export default function InsightsPanel({ tasks }) {
  const now = new Date();

  // Upcoming deadlines (within 48 hours)
  const upcomingTasks = tasks
    .filter(task => {
      const deadline = new Date(task.deadline);
      const diffHours = (deadline - now) / (1000 * 60 * 60);
      return diffHours >= 0 && diffHours <= 48;
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  // Stress Heatmap data
  const weekDates = getWeekDates();
  const heatmapData = weekDates.map(date => {
    const dateStr = date.toISOString().split('T')[0];
    const count = tasks.filter(t => t.deadline === dateStr).length;
    const isToday = dateStr === now.toISOString().split('T')[0];
    return {
      date,
      dateStr,
      dayName: DAY_NAMES[weekDates.indexOf(date)],
      count,
      isToday,
      ...getHeatmapColor(count)
    };
  });

  // Stats
  const highUrgencyCount = tasks.filter(t => t.urgency === 'High').length;
  const totalDueSoon = upcomingTasks.length;
  const categoryCounts = tasks.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {});

  const formatRelativeTime = (deadline) => {
    const diff = new Date(deadline) - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Due now';
    if (hours < 24) return `${hours}h left`;
    return `${Math.ceil(hours / 24)}d left`;
  };

  return (
    <div className="animate-slide-in-right space-y-5">

      {/* Quick Stats */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Quick Stats</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-700/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-white">{tasks.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">Total Tasks</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-3 text-center border border-red-500/10">
            <p className="text-2xl font-black text-red-400">{highUrgencyCount}</p>
            <p className="text-xs text-slate-400 mt-0.5">Urgent</p>
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-amber-400" />
          <h3 className="text-sm font-bold text-white">Due Within 48h</h3>
          {totalDueSoon > 0 && (
            <span className="ml-auto bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-md">
              {totalDueSoon}
            </span>
          )}
        </div>

        {upcomingTasks.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-slate-500 text-sm">No urgent deadlines 🎉</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingTasks.map(task => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-700/20 hover:bg-slate-700/30 transition-colors"
              >
                <div className={`
                  w-2 h-2 rounded-full shrink-0
                  ${task.urgency === 'High' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}
                `} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{task.title}</p>
                  <p className="text-xs text-slate-500">{task.category}</p>
                </div>
                <span className={`
                  text-xs font-bold px-2 py-0.5 rounded-md shrink-0
                  ${task.urgency === 'High' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'}
                `}>
                  {formatRelativeTime(task.deadline)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stress Heatmap */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} className="text-purple-400" />
          <h3 className="text-sm font-bold text-white">Stress Heatmap</h3>
        </div>
        <p className="text-xs text-slate-500 mb-3">Weekly task load overview</p>

        <div className="grid grid-cols-7 gap-1.5">
          {heatmapData.map((day, i) => (
            <div key={i} className="text-center">
              <p className={`text-xs mb-1.5 font-medium ${day.isToday ? 'text-indigo-400' : 'text-slate-500'}`}>
                {day.dayName}
              </p>
              <div
                className={`
                  aspect-square rounded-xl flex items-center justify-center
                  font-bold text-sm transition-all duration-300
                  ${day.bg} ${day.text}
                  ${day.isToday ? 'ring-2 ring-indigo-500/40' : ''}
                `}
                title={`${day.dayName}: ${day.count} task(s) – ${day.label}`}
              >
                {day.count}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-slate-700/30">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30" />
            <span className="text-xs text-slate-500">0-2</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/30" />
            <span className="text-xs text-slate-500">3-5</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30" />
            <span className="text-xs text-slate-500">6+</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryCounts).length > 0 && (
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-white mb-3">By Category</h3>
          <div className="space-y-2">
            {Object.entries(categoryCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, count]) => {
                const total = tasks.length;
                const percentage = Math.round((count / total) * 100);
                const colorMap = {
                  Academic: 'bg-indigo-500',
                  Financial: 'bg-amber-500',
                  Medical: 'bg-red-500',
                  Personal: 'bg-cyan-500',
                };
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">{cat}</span>
                      <span className="text-xs text-slate-500">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-1.5 bg-slate-700/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${colorMap[cat] || 'bg-slate-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
