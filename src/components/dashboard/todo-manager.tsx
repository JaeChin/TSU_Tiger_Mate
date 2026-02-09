"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  CheckSquare,
  X,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate, cn } from "@/lib/utils";

const todoCategories = [
  { label: "Academic", value: "academic" },
  { label: "Personal", value: "personal" },
  { label: "Career", value: "career" },
  { label: "Financial", value: "financial" },
  { label: "Health", value: "health" },
] as const;

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Academic", value: "academic" },
  { label: "Personal", value: "personal" },
  { label: "Career", value: "career" },
] as const;

const priorityOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
] as const;

const priorityDot: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-green-500",
};

const badgeClass: Record<string, string> = {
  academic: "badge-academic",
  personal: "badge-social",
  career: "badge-career",
  financial: "badge-financial",
  health: "badge-health",
};

interface Todo {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: string;
  due_date: string | null;
  is_completed: boolean;
}

interface TodoManagerProps {
  todos: Todo[];
  userId: string;
}

export function TodoManager({ todos, userId }: TodoManagerProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [hideCompleted, setHideCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("academic");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  // Optimistic state for toggled items
  const [optimisticToggles, setOptimisticToggles] = useState<
    Record<string, boolean>
  >({});

  function resetForm() {
    setTitle("");
    setCategory("academic");
    setPriority("medium");
    setDueDate("");
    setShowForm(false);
  }

  async function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setSaving(true);
    const supabase = createClient();

    await supabase.from("todos").insert({
      user_id: userId,
      title: trimmedTitle,
      category,
      priority,
      due_date: dueDate || null,
    });

    setSaving(false);
    resetForm();
    router.refresh();
  }

  async function handleToggle(todo: Todo) {
    const newCompleted = !(optimisticToggles[todo.id] ?? todo.is_completed);

    // Optimistic update
    setOptimisticToggles((prev) => ({ ...prev, [todo.id]: newCompleted }));
    setTogglingId(todo.id);

    const supabase = createClient();
    const { error } = await supabase
      .from("todos")
      .update({ is_completed: newCompleted })
      .eq("id", todo.id);

    if (error) {
      // Revert on error
      setOptimisticToggles((prev) => {
        const next = { ...prev };
        delete next[todo.id];
        return next;
      });
    }

    setTogglingId(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const supabase = createClient();
    await supabase.from("todos").delete().eq("id", id);
    setDeletingId(null);
    setConfirmDeleteId(null);
    router.refresh();
  }

  // Apply filters
  const filtered = todos.filter((todo) => {
    const isCompleted = optimisticToggles[todo.id] ?? todo.is_completed;
    if (hideCompleted && isCompleted) return false;
    if (filter !== "all" && todo.category !== filter) return false;
    return true;
  });

  return (
    <>
      {/* Header Row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-maroon-950 sm:text-3xl">
            My To-Dos
          </h1>
          <p className="mt-1 text-surface-600">
            Stay organized and on track
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="btn-primary text-sm py-2 px-4"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Task
        </button>
      </div>

      {/* Inline Add Form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="card mb-6 space-y-4"
        >
          <div>
            <label
              htmlFor="todo-title"
              className="block text-sm font-medium text-surface-700 mb-1.5"
            >
              Title
            </label>
            <input
              id="todo-title"
              type="text"
              required
              placeholder="What do you need to do?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              autoFocus
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="todo-category"
                className="block text-sm font-medium text-surface-700 mb-1.5"
              >
                Category
              </label>
              <select
                id="todo-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
              >
                {todoCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="todo-priority"
                className="block text-sm font-medium text-surface-700 mb-1.5"
              >
                Priority
              </label>
              <select
                id="todo-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="input-field"
              >
                {priorityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="todo-due"
                className="block text-sm font-medium text-surface-700 mb-1.5"
              >
                Due date
              </label>
              <input
                id="todo-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-sm py-2 px-5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="btn-secondary text-sm py-2 px-5"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filter Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilter(opt.value)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              filter === opt.value
                ? "bg-maroon-900 text-white"
                : "bg-white text-surface-600 border border-surface-200 hover:bg-surface-50 hover:text-surface-900"
            )}
          >
            {opt.label}
          </button>
        ))}

        <label className="ml-auto flex items-center gap-2 text-sm text-surface-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hideCompleted}
            onChange={(e) => setHideCompleted(e.target.checked)}
            className="h-4 w-4 rounded border-surface-300 text-maroon-900 focus:ring-maroon-900"
          />
          Hide completed
        </label>
      </div>

      {/* Todo List */}
      {filtered.length > 0 ? (
        <ul className="space-y-2">
          {filtered.map((todo) => {
            const isCompleted =
              optimisticToggles[todo.id] ?? todo.is_completed;

            return (
              <li
                key={todo.id}
                className={cn(
                  "card flex items-center gap-3 transition-opacity",
                  isCompleted && "opacity-60"
                )}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={() => handleToggle(todo)}
                  disabled={togglingId === todo.id}
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                    isCompleted
                      ? "border-maroon-900 bg-maroon-900"
                      : "border-surface-300 hover:border-maroon-900"
                  )}
                  aria-label={
                    isCompleted
                      ? `Mark "${todo.title}" as incomplete`
                      : `Mark "${todo.title}" as complete`
                  }
                >
                  {isCompleted && (
                    <svg
                      className="h-3 w-3 text-white"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>

                {/* Priority Dot */}
                <span
                  className={cn(
                    "h-2.5 w-2.5 shrink-0 rounded-full",
                    priorityDot[todo.priority] || "bg-surface-300"
                  )}
                  aria-label={`${todo.priority} priority`}
                />

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium text-surface-900",
                      isCompleted && "line-through text-surface-500"
                    )}
                  >
                    {todo.title}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    {todo.due_date && (
                      <span className="text-xs text-surface-500">
                        Due {formatDate(todo.due_date)}
                      </span>
                    )}
                    {todo.category && (
                      <span
                        className={
                          badgeClass[todo.category] || "badge-campus"
                        }
                      >
                        {todo.category.charAt(0).toUpperCase() +
                          todo.category.slice(1)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete */}
                {confirmDeleteId === todo.id ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDelete(todo.id)}
                      disabled={deletingId === todo.id}
                      className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      aria-label="Confirm delete"
                    >
                      {deletingId === todo.id ? (
                        <Loader2
                          className="h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="rounded-lg p-1.5 text-surface-500 hover:bg-surface-100 transition-colors"
                      aria-label="Cancel delete"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(todo.id)}
                    className="shrink-0 rounded-lg p-1.5 text-surface-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    aria-label={`Delete "${todo.title}"`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-surface-200 bg-white py-16 text-center">
          <CheckSquare
            className="mx-auto h-10 w-10 text-surface-300"
            aria-hidden="true"
          />
          <h2 className="mt-3 text-lg font-semibold text-surface-900">
            {filter !== "all" || hideCompleted
              ? "No matching tasks"
              : "No tasks yet"}
          </h2>
          <p className="mt-1 text-sm text-surface-500">
            {filter !== "all" || hideCompleted
              ? "Try changing your filters."
              : "Add your first to-do to get organized."}
          </p>
          {!showForm && filter === "all" && !hideCompleted && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="btn-primary mt-6 text-sm py-2 px-5"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Task
            </button>
          )}
        </div>
      )}
    </>
  );
}
