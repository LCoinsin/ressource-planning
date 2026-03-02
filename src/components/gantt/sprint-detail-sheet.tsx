"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getSprintWithTasks,
  updateSprint,
  createSprintTask,
  toggleTaskCompleted,
  deleteSprintTask,
  deleteSprint,
} from "@/actions/sprints";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Loader2, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { GanttSprint } from "./packing";

interface SprintDetailSheetProps {
  sprint: GanttSprint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SprintTask = {
  id: string;
  titre: string;
  isCompleted: boolean;
  dateDebut: Date;
  dateFin: Date;
  load: number;
  members: { id: string; nom: string; prenom: string }[];
};

export function SprintDetailSheet({
  sprint,
  open,
  onOpenChange,
}: SprintDetailSheetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tasks, setTasks] = useState<SprintTask[]>([]);
  const [description, setDescription] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);
  const [deletingSprintId, setDeletingSprintId] = useState<string | null>(null);

  // Load sprint details when opened
  useEffect(() => {
    if (!sprint || !open) return;
    setDescription(sprint.description ?? "");

    getSprintWithTasks(sprint.id).then((data) => {
      if (data) {
        setDescription(data.description ?? "");
        setTasks(
          data.tasks.map((t) => ({
            id: t.id,
            titre: t.titre,
            isCompleted: t.isCompleted,
            dateDebut: t.dateDebut,
            dateFin: t.dateFin,
            load: t.load,
            members: t.members,
          }))
        );
      }
    });
  }, [sprint, open]);

  if (!sprint) return null;

  const completedCount = tasks.filter((t) => t.isCompleted).length;

  async function handleSaveDescription() {
    if (!sprint) return;
    startTransition(async () => {
      try {
        await updateSprint(sprint.id, { description });
        toast.success("Description mise a jour");
        router.refresh();
      } catch {
        toast.error("Erreur lors de la mise a jour");
      }
    });
  }

  async function handleToggleTask(taskId: string, checked: boolean) {
    setLoadingTaskId(taskId);
    try {
      await toggleTaskCompleted(taskId, checked);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, isCompleted: checked } : t))
      );
      router.refresh();
    } catch {
      toast.error("Erreur lors de la mise a jour");
    }
    setLoadingTaskId(null);
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim() || !sprint) return;
    startTransition(async () => {
      try {
        await createSprintTask({
          titre: newTaskTitle.trim(),
          sprintId: sprint.id,
          projectId: sprint.projectId,
        });
        setNewTaskTitle("");
        // Reload tasks
        const data = await getSprintWithTasks(sprint.id);
        if (data) {
          setTasks(
            data.tasks.map((t) => ({
              id: t.id,
              titre: t.titre,
              isCompleted: t.isCompleted,
              dateDebut: t.dateDebut,
              dateFin: t.dateFin,
              load: t.load,
              members: t.members,
            }))
          );
        }
        toast.success("Tache ajoutee");
        router.refresh();
      } catch {
        toast.error("Erreur lors de la creation");
      }
    });
  }

  async function handleDeleteSprint() {
    if (!sprint) return;
    const confirmed = window.confirm(
      `Supprimer le sprint "${sprint.titre}" et toutes ses taches ?`
    );
    if (!confirmed) return;
    setDeletingSprintId(sprint.id);
    try {
      await deleteSprint(sprint.id);
      toast.success("Sprint et ses taches supprimes");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Erreur lors de la suppression du sprint");
    }
    setDeletingSprintId(null);
  }

  async function handleDeleteTask(taskId: string) {
    setLoadingTaskId(taskId);
    try {
      await deleteSprintTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success("Tache supprimee");
      router.refresh();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
    setLoadingTaskId(null);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg w-full overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg">{sprint.titre}</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handleDeleteSprint}
              disabled={deletingSprintId === sprint.id}
              title="Supprimer le sprint"
            >
              {deletingSprintId === sprint.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
          <SheetDescription className="flex items-center gap-2 text-xs">
            <CalendarDays className="h-3.5 w-3.5" />
            {format(new Date(sprint.dateDebut), "dd MMM", { locale: fr })} -{" "}
            {format(new Date(sprint.dateFin), "dd MMM yyyy", { locale: fr })}
            <span className="mx-1">·</span>
            <span className="font-medium">{sprint.project.nom}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6">
          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Description du sprint..."
              className="w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
            />
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl text-xs"
              onClick={handleSaveDescription}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : null}
              Enregistrer
            </Button>
          </div>

          {/* Task progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">
                Taches ({completedCount}/{tasks.length})
              </h3>
              {tasks.length > 0 && (
                <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{
                      width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Task list */}
            <div className="space-y-1">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted/50 group transition-colors"
                >
                  <Checkbox
                    checked={task.isCompleted}
                    onCheckedChange={(checked) =>
                      handleToggleTask(task.id, checked === true)
                    }
                    disabled={loadingTaskId === task.id}
                  />
                  <span
                    className={`flex-1 text-sm ${
                      task.isCompleted
                        ? "line-through text-muted-foreground"
                        : ""
                    }`}
                  >
                    {task.titre}
                  </span>
                  {task.members.length > 0 && (
                    <span className="text-[10px] text-muted-foreground hidden group-hover:inline">
                      {task.members.map((m) => m.prenom).join(", ")}
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    disabled={loadingTaskId === task.id}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 rounded-lg hover:bg-destructive/10"
                  >
                    {loadingTaskId === task.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              ))}

              {tasks.length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  Aucune tache dans ce sprint
                </p>
              )}
            </div>

            {/* Inline add task */}
            <form onSubmit={handleAddTask} className="flex items-center gap-2">
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Nouvelle tache..."
                className="rounded-xl border-border/50 h-9 text-sm flex-1"
              />
              <Button
                type="submit"
                size="sm"
                className="rounded-xl h-9"
                disabled={isPending || !newTaskTitle.trim()}
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
