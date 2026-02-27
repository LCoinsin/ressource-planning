"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiMemberSelect } from "@/components/multi-member-select";
import { createTask } from "@/actions/tasks";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

type Member = { id: string; nom: string; prenom: string };
type Project = { id: string; nom: string };
type Technology = { id: string; nom: string; couleur: string };

interface TaskCreateDialogProps {
  members: Member[];
  projects: Project[];
  technologies: Technology[];
}

export function TaskCreateDialog({
  members,
  projects,
  technologies,
}: TaskCreateDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [titre, setTitre] = useState("");
  const type = "TASK";
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [load, setLoad] = useState("1");
  const [projectId, setProjectId] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [technologyId, setTechnologyId] = useState("");

  function reset() {
    setTitre("");
    setDateDebut("");
    setDateFin("");
    setLoad("1");
    setProjectId("");
    setMemberIds([]);
    setTechnologyId("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await createTask({
        titre,
        type: type as "SPRINT" | "TASK",
        dateDebut,
        dateFin,
        load: parseFloat(load),
        projectId,
        memberIds,
        technologyId: technologyId || null,
      });
      toast.success("Tache creee");
      router.refresh();
      reset();
      setOpen(false);
    } catch {
      toast.error("Une erreur est survenue");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle tache
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Nouvelle tache</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-titre">Titre</Label>
            <Input
              id="create-titre"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="rounded-xl border-border/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-load">Charge (0-1)</Label>
            <Input
              id="create-load"
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={load}
              onChange={(e) => setLoad(e.target.value)}
              className="rounded-xl border-border/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-dateDebut">Debut</Label>
              <Input
                id="create-dateDebut"
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="rounded-xl border-border/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-dateFin">Fin</Label>
              <Input
                id="create-dateFin"
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="rounded-xl border-border/50"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Projet</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="rounded-xl border-border/50">
                <SelectValue placeholder="Selectionner un projet" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Membres</Label>
            <MultiMemberSelect
              members={members}
              selectedIds={memberIds}
              onChange={setMemberIds}
            />
          </div>

          <div className="space-y-2">
            <Label>Technologie</Label>
            <Select
              value={technologyId || "none"}
              onValueChange={(v) => setTechnologyId(v === "none" ? "" : v)}
            >
              <SelectTrigger className="rounded-xl border-border/50">
                <SelectValue placeholder="Aucune" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune</SelectItem>
                {technologies.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: t.couleur }}
                      />
                      {t.nom}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="rounded-xl"
              disabled={loading || !projectId}
            >
              {loading ? "..." : "Creer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
