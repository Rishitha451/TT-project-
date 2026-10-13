import React, { useState } from 'react';
import { useGoals } from '../features/goals/hooks/useGoals';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { Plus, Trash2, Calendar, CheckCircle2 } from 'lucide-react';
import { toast } from '../stores/toast.store';


const COLOR_OPTIONS = [
  { name: 'Emerald', class: 'bg-emerald-500' },
  { name: 'Indigo', class: 'bg-indigo-500' },
  { name: 'Purple', class: 'bg-purple-500' },
  { name: 'Amber', class: 'bg-amber-500' },
  { name: 'Rose', class: 'bg-rose-500' },
  { name: 'Cyan', class: 'bg-cyan-500' },
];

export default function Goals() {
  const { goals, isLoading, isError, error, refetch, createGoal, isCreating, deleteGoal } = useGoals();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [category, setCategory] = useState('General');
  const [targetDate, setTargetDate] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0].class);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = Number(target);
    const currentNum = Number(current || '0');

    if (!name.trim()) {
      toast.error('Validation Error', 'Goal name is required.');
      return;
    }
    if (isNaN(targetNum) || targetNum <= 0) {
      toast.error('Validation Error', 'Target amount must be greater than 0.');
      return;
    }
    if (currentNum < 0 || currentNum > targetNum) {
      toast.error('Validation Error', 'Current amount cannot exceed target amount.');
      return;
    }

    try {
      await createGoal({
        name: name.trim(),
        target: targetNum,
        current: currentNum,
        color,
        category,
        targetDate: targetDate || undefined,
      });
      setIsModalOpen(false);
      setName('');
      setTarget('');
      setCurrent('');
      setTargetDate('');
    } catch {
      // Toast handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load financial goals"
        message={(error as Error)?.message || 'Something went wrong while loading your financial goals.'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Goals</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Plan, monitor, and fund your short-term and long-term milestones.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Goal
        </Button>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <EmptyState
          title="No financial goals created yet"
          message="Set up your first financial milestone like an emergency fund, travel fund, or real estate deposit."
          actionText="Create Goal"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
            const remaining = Math.max(0, goal.target - goal.current);
            const isCompleted = progress >= 100;

            return (
              <div
                key={goal.id}
                className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${goal.color}`} />
                      <h3 className="font-semibold text-slate-900 text-base">{goal.name}</h3>
                    </div>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                      title="Delete goal"
                      aria-label={`Delete ${goal.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {goal.category && (
                    <span className="inline-block text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded mb-4">
                      {goal.category}
                    </span>
                  )}

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mt-2">
                    <div className="flex justify-between text-xs text-slate-600 font-medium">
                      <span>Saved: ₹{goal.current.toLocaleString('en-IN')}</span>
                      <span>Target: ₹{goal.target.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${goal.color} rounded-full transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="font-bold text-slate-900">{progress}% Funded</span>
                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">
                          ₹{remaining.toLocaleString('en-IN')} remaining
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {goal.targetDate && (
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Target Date: {goal.targetDate}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Goal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Financial Goal"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Goal Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Emergency Fund, Europe Vacation"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Target Amount (₹)
              </label>
              <Input
                type="number"
                min="1"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="100000"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Current Saved (₹)
              </label>
              <Input
                type="number"
                min="0"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Safety Net">Safety Net</option>
                <option value="Travel">Travel</option>
                <option value="Gadgets">Gadgets</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Investment">Investment</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Target Date (Optional)
              </label>
              <Input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Color Tag
            </label>
            <div className="flex gap-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c.name}
                  onClick={() => setColor(c.class)}
                  className={`w-7 h-7 rounded-full ${c.class} transition-transform ${
                    color === c.class ? 'ring-2 ring-offset-2 ring-indigo-600 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isCreating}>
              {isCreating ? 'Saving...' : 'Save Goal'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
