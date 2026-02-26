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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { createMember, updateMember, deleteMember } from "@/actions/members";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Member = {
  id: string;
  nom: string;
  prenom: string;
  role: string;
  dateArrivee: string;
  dateDepart: string | null;
  _count: { tasks: number };
};

function MemberForm({
  member,
  onClose,
}: {
  member?: Member;
  onClose: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [nom, setNom] = useState(member?.nom ?? "");
  const [prenom, setPrenom] = useState(member?.prenom ?? "");
  const [role, setRole] = useState(member?.role ?? "");
  const [dateArrivee, setDateArrivee] = useState(
    member?.dateArrivee ? member.dateArrivee.split("T")[0] : ""
  );
  const [dateDepart, setDateDepart] = useState(
    member?.dateDepart ? member.dateDepart.split("T")[0] : ""
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        nom,
        prenom,
        role,
        dateArrivee,
        dateDepart: dateDepart || null,
      };
      if (member) {
        await updateMember(member.id, data);
        toast.success("Membre mis a jour");
      } else {
        await createMember(data);
        toast.success("Membre ajoute");
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="prenom">Prenom</Label>
          <Input
            id="prenom"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className="rounded-xl border-border/50"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nom">Nom</Label>
          <Input
            id="nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="rounded-xl border-border/50"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Input
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Developpeur Frontend, Chef de projet..."
          className="rounded-xl border-border/50"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateArrivee">Date d&apos;arrivee</Label>
          <Input
            id="dateArrivee"
            type="date"
            value={dateArrivee}
            onChange={(e) => setDateArrivee(e.target.value)}
            className="rounded-xl border-border/50"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateDepart">Date de depart</Label>
          <Input
            id="dateDepart"
            type="date"
            value={dateDepart}
            onChange={(e) => setDateDepart(e.target.value)}
            className="rounded-xl border-border/50"
          />
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
          {loading ? "..." : member ? "Modifier" : "Ajouter"}
        </Button>
      </div>
    </form>
  );
}

export function TeamClient({ members }: { members: Member[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Member | undefined>();

  function handleEdit(m: Member) {
    setEditing(m);
    setDialogOpen(true);
  }

  function handleClose() {
    setDialogOpen(false);
    setEditing(undefined);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce membre ?")) return;
    try {
      await deleteMember(id);
      toast.success("Membre supprime");
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
            Nouveau membre
          </Button>
        </DialogTrigger>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Modifier le membre" : "Nouveau membre"}
            </DialogTitle>
          </DialogHeader>
          <MemberForm member={editing} onClose={handleClose} />
        </DialogContent>
      </Dialog>

      <div className="rounded-2xl border border-border/40 bg-background shadow-sm overflow-hidden mt-4">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-xs">Membre</TableHead>
              <TableHead className="text-xs">Role</TableHead>
              <TableHead className="text-xs">Arrivee</TableHead>
              <TableHead className="text-xs">Depart</TableHead>
              <TableHead className="text-xs">Taches</TableHead>
              <TableHead className="text-xs w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-12 text-sm"
                >
                  Aucun membre
                </TableCell>
              </TableRow>
            ) : (
              members.map((m) => (
                <TableRow
                  key={m.id}
                  className="border-border/20 hover:bg-muted/20"
                >
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8 border border-border/30">
                        <AvatarFallback className="text-[10px] bg-muted/50">
                          {m.prenom[0]}
                          {m.nom[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">
                        {m.prenom} {m.nom}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {m.role}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(m.dateArrivee), "dd MMM yyyy", {
                      locale: fr,
                    })}
                  </TableCell>
                  <TableCell>
                    {m.dateDepart ? (
                      <span className="text-sm">
                        {format(new Date(m.dateDepart), "dd MMM yyyy", {
                          locale: fr,
                        })}
                      </span>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="rounded-lg text-[10px] bg-emerald-500/10 text-emerald-600 border-0"
                      >
                        Actif
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="rounded-lg text-[10px]"
                    >
                      {m._count.tasks}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg"
                        onClick={() => handleEdit(m)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg"
                        onClick={() => handleDelete(m.id)}
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
