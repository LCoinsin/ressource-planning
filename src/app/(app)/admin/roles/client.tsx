"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { createRole, updateRole, deleteRole } from "@/actions/roles";
import {
  PERMISSIONS,
  PERMISSION_LABELS,
  parsePermissions,
} from "@/lib/permissions";
import type { Permission } from "@/lib/permissions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Role = {
  id: string;
  name: string;
  permissions: string;
  createdAt: string;
  _count: { members: number };
};

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

function RoleForm({
  role,
  onClose,
}: {
  role?: Role;
  onClose: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(role?.name ?? "");
  const [perms, setPerms] = useState<string[]>(
    role ? parsePermissions(role.permissions) : []
  );

  function togglePerm(perm: string) {
    setPerms((prev) =>
      prev.includes(perm)
        ? prev.filter((p) => p !== perm)
        : [...prev, perm]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (role) {
        await updateRole(role.id, { name, permissions: perms });
        toast.success("Role mis a jour");
      } else {
        await createRole({ name, permissions: perms });
        toast.success("Role cree");
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
        <Label>Nom du role</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Manager, Viewer..."
          className="rounded-xl border-border/50"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Permissions</Label>
        <div className="grid grid-cols-1 gap-2 rounded-xl border border-border/40 p-3">
          {ALL_PERMISSIONS.map((perm) => (
            <label
              key={perm}
              className="flex items-center gap-2.5 text-sm cursor-pointer hover:bg-muted/30 rounded-lg px-2 py-1.5 transition-colors"
            >
              <Checkbox
                checked={perms.includes(perm)}
                onCheckedChange={() => togglePerm(perm)}
              />
              <span>{PERMISSION_LABELS[perm as Permission]}</span>
              <span className="text-[10px] text-muted-foreground ml-auto font-mono">
                {perm}
              </span>
            </label>
          ))}
        </div>
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
          {loading ? "..." : role ? "Modifier" : "Creer"}
        </Button>
      </div>
    </form>
  );
}

export function RolesClient({ roles }: { roles: Role[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Role | undefined>();

  function handleEdit(r: Role) {
    setEditing(r);
    setDialogOpen(true);
  }

  function handleClose() {
    setDialogOpen(false);
    setEditing(undefined);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce role ?")) return;
    try {
      await deleteRole(id);
      toast.success("Role supprime");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Une erreur est survenue"
      );
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
            Nouveau role
          </Button>
        </DialogTrigger>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Modifier le role" : "Nouveau role"}
            </DialogTitle>
          </DialogHeader>
          <RoleForm role={editing} onClose={handleClose} />
        </DialogContent>
      </Dialog>

      <div className="rounded-2xl border border-border/40 bg-background shadow-sm overflow-hidden mt-4">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-xs">Role</TableHead>
              <TableHead className="text-xs">Permissions</TableHead>
              <TableHead className="text-xs">Membres</TableHead>
              <TableHead className="text-xs w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground py-12 text-sm"
                >
                  Aucun role
                </TableCell>
              </TableRow>
            ) : (
              roles.map((r) => {
                const perms = parsePermissions(r.permissions);
                return (
                  <TableRow
                    key={r.id}
                    className="border-border/20 hover:bg-muted/20"
                  >
                    <TableCell className="font-medium text-sm">
                      {r.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {perms.slice(0, 3).map((p) => (
                          <Badge
                            key={p}
                            variant="outline"
                            className="rounded-lg text-[9px] font-mono"
                          >
                            {p}
                          </Badge>
                        ))}
                        {perms.length > 3 && (
                          <Badge
                            variant="secondary"
                            className="rounded-lg text-[9px]"
                          >
                            +{perms.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="rounded-lg text-[10px]"
                      >
                        {r._count.members}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg"
                          onClick={() => handleEdit(r)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg"
                          onClick={() => handleDelete(r.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
