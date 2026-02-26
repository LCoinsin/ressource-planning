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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, Pencil, Trash2, Check } from "lucide-react";
import * as LucideIcons from "lucide-react";
import {
  createTechnology,
  updateTechnology,
  deleteTechnology,
} from "@/actions/technologies";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const ICON_OPTIONS = [
  "atom",
  "code",
  "server",
  "database",
  "globe",
  "smartphone",
  "monitor",
  "cpu",
  "hard-drive",
  "cloud",
  "terminal",
  "git-branch",
  "layers",
  "box",
  "package",
  "zap",
  "shield",
  "lock",
  "settings",
  "puzzle",
  "braces",
  "file-code",
  "binary",
  "blocks",
  "cable",
  "circuit-board",
  "container",
  "flame",
  "hexagon",
  "network",
  "rocket",
  "webhook",
];

const COLOR_PRESETS = [
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#84CC16",
  "#22C55E",
  "#10B981",
  "#14B8A6",
  "#06B6D4",
  "#0EA5E9",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#A855F7",
  "#D946EF",
  "#EC4899",
  "#F43F5E",
];

type Technology = {
  id: string;
  nom: string;
  couleur: string;
  iconName: string;
};

function getIcon(iconName: string) {
  const pascalCase = iconName
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (LucideIcons as any)[pascalCase] as
    | React.ComponentType<{ className?: string }>
    | undefined;
  if (!IconComponent) return null;
  return <IconComponent className="h-4 w-4" />;
}

function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 rounded-xl border-border/50"
        >
          {getIcon(value) ?? <span className="text-muted-foreground">?</span>}
          <span className="text-sm">{value}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-3 rounded-xl" align="start">
        <div className="grid grid-cols-8 gap-1">
          {ICON_OPTIONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => {
                onChange(icon);
                setOpen(false);
              }}
              className={cn(
                "flex items-center justify-center p-2 rounded-lg hover:bg-muted/50 transition-colors",
                value === icon && "bg-primary/10 ring-1 ring-primary"
              )}
              title={icon}
            >
              {getIcon(icon) ?? (
                <span className="text-[10px]">{icon.slice(0, 2)}</span>
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-8 gap-1.5">
        {COLOR_PRESETS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={cn(
              "w-7 h-7 rounded-lg border-2 transition-all hover:scale-110",
              value === color ? "border-foreground scale-110" : "border-transparent"
            )}
            style={{ backgroundColor: color }}
          >
            {value === color && (
              <Check className="h-3 w-3 text-white mx-auto" />
            )}
          </button>
        ))}
      </div>
      <div className="flex gap-2 items-center">
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-8 p-0.5 cursor-pointer rounded-lg border-border/50"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-xl border-border/50 text-xs font-mono"
          placeholder="#3B82F6"
        />
      </div>
    </div>
  );
}

function TechnologyForm({
  technology,
  onClose,
}: {
  technology?: Technology;
  onClose: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [nom, setNom] = useState(technology?.nom ?? "");
  const [couleur, setCouleur] = useState(technology?.couleur ?? "#3B82F6");
  const [iconName, setIconName] = useState(technology?.iconName ?? "code");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (technology) {
        await updateTechnology(technology.id, { nom, couleur, iconName });
        toast.success("Technologie mise a jour");
      } else {
        await createTechnology({ nom, couleur, iconName });
        toast.success("Technologie creee");
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
        <Label htmlFor="nom">Nom</Label>
        <Input
          id="nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="React, Node.js..."
          className="rounded-xl border-border/50"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Couleur</Label>
        <ColorPicker value={couleur} onChange={setCouleur} />
      </div>
      <div className="space-y-2">
        <Label>Icone</Label>
        <IconPicker value={iconName} onChange={setIconName} />
      </div>
      {/* Preview */}
      <div className="rounded-xl border border-border/30 bg-muted/20 p-4 flex items-center gap-3">
        <div
          className="rounded-xl p-2.5"
          style={{ backgroundColor: `${couleur}20`, color: couleur }}
        >
          {getIcon(iconName)}
        </div>
        <span className="font-medium text-sm">{nom || "Apercu"}</span>
        <div
          className="w-12 h-3 rounded-full ml-auto"
          style={{ backgroundColor: couleur }}
        />
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
          {loading ? "..." : technology ? "Modifier" : "Creer"}
        </Button>
      </div>
    </form>
  );
}

export function TechnologiesClient({
  technologies,
}: {
  technologies: Technology[];
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Technology | undefined>();

  function handleEdit(tech: Technology) {
    setEditing(tech);
    setDialogOpen(true);
  }

  function handleClose() {
    setDialogOpen(false);
    setEditing(undefined);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette technologie ?")) return;
    try {
      await deleteTechnology(id);
      toast.success("Technologie supprimee");
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
            Nouvelle technologie
          </Button>
        </DialogTrigger>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Modifier la technologie" : "Nouvelle technologie"}
            </DialogTitle>
          </DialogHeader>
          <TechnologyForm technology={editing} onClose={handleClose} />
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-4">
        {technologies.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-12 text-sm">
            Aucune technologie. Commencez par en creer une.
          </div>
        ) : (
          technologies.map((tech) => (
            <div
              key={tech.id}
              className="group rounded-2xl border border-border/40 bg-background p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="rounded-xl p-2.5"
                    style={{
                      backgroundColor: `${tech.couleur}15`,
                      color: tech.couleur,
                    }}
                  >
                    {getIcon(tech.iconName)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{tech.nom}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tech.couleur }}
                      />
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {tech.couleur}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg"
                    onClick={() => handleEdit(tech)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg"
                    onClick={() => handleDelete(tech.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
