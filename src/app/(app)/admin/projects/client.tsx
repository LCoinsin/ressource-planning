"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  createProject,
  updateProject,
  deleteProject,
} from "@/actions/projects";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Project = {
  id: string;
  nom: string;
  client: string;
  status: string;
  _count: { tasks: number };
};

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: "Actif",
    className: "bg-emerald-500/10 text-emerald-600 border-0",
  },
  PAUSED: {
    label: "En pause",
    className: "bg-amber-500/10 text-amber-600 border-0",
  },
  DONE: {
    label: "Termine",
    className: "bg-muted text-muted-foreground border-0",
  },
};

function ProjectForm({
  project,
  onClose,
}: {
  project?: Project;
  onClose: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [nom, setNom] = useState(project?.nom ?? "");
  const [client, setClient] = useState(project?.client ?? "");
  const [status, setStatus] = useState(project?.status ?? "ACTIVE");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        nom,
        client,
        status: status as "ACTIVE" | "PAUSED" | "DONE",
      };
      if (project) {
        await updateProject(project.id, data);
        toast.success("Projet mis a jour");
      } else {
        await createProject(data);
        toast.success("Projet cree");
      }
      router.refresh();
      onClose();
    } catch {
      toast.error("Une erreur est survenue");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nom">Nom du projet</Label>
        <Input
          id="nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className="rounded-xl border-border/50"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="client">Client</Label>
        <Input
          id="client"
          value={client}
          onChange={(e) => setClient(e.target.value)}
          className="rounded-xl border-border/50"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Statut</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="rounded-xl border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Actif</SelectItem>
            <SelectItem value="PAUSED">En pause</SelectItem>
            <SelectItem value="DONE">Termine</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          onClick={onClose}
        >
          Annuler
        </Button>
        <Button type="submit" className="rounded-xl" disabled={loading}>
          {loading ? "..." : project ? "Modifier" : "Creer"}
        </Button>
      </div>
    </form>
  );
}

export function ProjectsClient({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | undefined>();

  function handleEdit(p: Project) {
    setEditing(p);
    setDialogOpen(true);
  }

  function handleClose() {
    setDialogOpen(false);
    setEditing(undefined);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce projet et toutes ses taches ?")) return;
    try {
      await deleteProject(id);
      toast.success("Projet supprime");
      router.refresh();
    } catch {
      toast.error("Une erreur est survenue");
    }
  }

  return (
    <>
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) handleClose();
          else setDialogOpen(true);
        }}
      >
        <DialogTrigger asChild>
          <Button
            className="rounded-xl"
            onClick={() => {
              setEditing(undefined);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau projet
          </Button>
        </DialogTrigger>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Modifier le projet" : "Nouveau projet"}
            </DialogTitle>
          </DialogHeader>
          <ProjectForm project={editing} onClose={handleClose} />
        </DialogContent>
      </Dialog>

      <div className="rounded-2xl border border-border/40 bg-background shadow-sm overflow-hidden mt-4">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-xs">Nom</TableHead>
              <TableHead className="text-xs">Client</TableHead>
              <TableHead className="text-xs">Statut</TableHead>
              <TableHead className="text-xs">Taches</TableHead>
              <TableHead className="text-xs w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-12 text-sm"
                >
                  Aucun projet
                </TableCell>
              </TableRow>
            ) : (
              projects.map((p) => (
                <TableRow
                  key={p.id}
                  className="border-border/20 hover:bg-muted/20"
                >
                  <TableCell className="font-medium text-sm">
                    {p.nom}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.client}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`rounded-lg text-[10px] ${STATUS_CONFIG[p.status]?.className ?? ""}`}
                    >
                      {STATUS_CONFIG[p.status]?.label ?? p.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="rounded-lg text-[10px]"
                    >
                      {p._count.tasks}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg"
                        onClick={() => handleEdit(p)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg"
                        onClick={() => handleDelete(p.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
