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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, KeyRound, Ban, CheckCircle } from "lucide-react";
import { createUser, updateUser, resetPassword, deleteUser } from "@/actions/users";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Role = {
  id: string;
  name: string;
  permissions: string;
  createdAt: string;
  _count: { members: number };
};

type User = {
  id: string;
  nom: string;
  prenom: string;
  role: string;
  email: string | null;
  isActive: boolean;
  roleId: string | null;
  dateArrivee: string;
  dateDepart: string | null;
  createdAt: string;
  appRole: { id: string; name: string; permissions: string; createdAt: string } | null;
};

function CreateUserForm({
  roles,
  onClose,
}: {
  roles: Role[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleMeta, setRoleMeta] = useState("");
  const [roleId, setRoleId] = useState("");
  const [dateArrivee, setDateArrivee] = useState(
    new Date().toISOString().split("T")[0]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await createUser({
        nom,
        prenom,
        email,
        password,
        role: roleMeta,
        roleId: roleId || null,
        dateArrivee,
      });
      toast.success("Utilisateur cree");
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
          <Label>Prenom</Label>
          <Input
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className="rounded-xl border-border/50"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Nom</Label>
          <Input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="rounded-xl border-border/50"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border-border/50"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Mot de passe initial</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl border-border/50"
          required
          minLength={4}
        />
      </div>
      <div className="space-y-2">
        <Label>Role metier</Label>
        <Input
          value={roleMeta}
          onChange={(e) => setRoleMeta(e.target.value)}
          placeholder="Developpeur Frontend, Chef de projet..."
          className="rounded-xl border-border/50"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Role applicatif</Label>
          <Select value={roleId} onValueChange={setRoleId}>
            <SelectTrigger className="rounded-xl border-border/50">
              <SelectValue placeholder="Choisir un role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Date d&apos;arrivee</Label>
          <Input
            type="date"
            value={dateArrivee}
            onChange={(e) => setDateArrivee(e.target.value)}
            className="rounded-xl border-border/50"
            required
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
          {loading ? "..." : "Creer"}
        </Button>
      </div>
    </form>
  );
}

function ResetPasswordDialog({ userId }: { userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(userId, password);
      toast.success("Mot de passe reinitialise");
      router.refresh();
      setOpen(false);
      setPassword("");
    } catch {
      toast.error("Une erreur est survenue");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" title="Reinitialiser le mot de passe">
          <KeyRound className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Reinitialiser le mot de passe</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-2">
            <Label>Nouveau mot de passe</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border-border/50"
              required
              minLength={4}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" className="rounded-xl" disabled={loading}>
              {loading ? "..." : "Reinitialiser"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function UsersClient({
  users,
  roles,
}: {
  users: User[];
  roles: Role[];
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleToggleActive(user: User) {
    try {
      if (user.isActive) {
        await deleteUser(user.id);
        toast.success("Utilisateur desactive");
      } else {
        await updateUser(user.id, {
          email: user.email!,
          roleId: user.roleId,
          isActive: true,
        });
        toast.success("Utilisateur reactive");
      }
      router.refresh();
    } catch {
      toast.error("Une erreur est survenue");
    }
  }

  async function handleRoleChange(userId: string, user: User, newRoleId: string) {
    try {
      await updateUser(userId, {
        email: user.email!,
        roleId: newRoleId || null,
        isActive: user.isActive,
      });
      toast.success("Role mis a jour");
      router.refresh();
    } catch {
      toast.error("Une erreur est survenue");
    }
  }

  return (
    <>
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => setDialogOpen(open)}
      >
        <DialogTrigger asChild>
          <Button className="rounded-xl" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel utilisateur
          </Button>
        </DialogTrigger>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Nouvel utilisateur</DialogTitle>
          </DialogHeader>
          <CreateUserForm
            roles={roles}
            onClose={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <div className="rounded-2xl border border-border/40 bg-background shadow-sm overflow-hidden mt-4">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-xs">Utilisateur</TableHead>
              <TableHead className="text-xs">Email</TableHead>
              <TableHead className="text-xs">Role applicatif</TableHead>
              <TableHead className="text-xs">Statut</TableHead>
              <TableHead className="text-xs w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-12 text-sm"
                >
                  Aucun utilisateur
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow
                  key={u.id}
                  className="border-border/20 hover:bg-muted/20"
                >
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8 border border-border/30">
                        <AvatarFallback className="text-[10px] bg-muted/50">
                          {u.prenom[0]}
                          {u.nom[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-medium text-sm">
                          {u.prenom} {u.nom}
                        </span>
                        <p className="text-[10px] text-muted-foreground">
                          {u.role}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={u.roleId ?? ""}
                      onValueChange={(val) => handleRoleChange(u.id, u, val)}
                    >
                      <SelectTrigger className="h-7 w-32 rounded-lg text-xs border-border/50">
                        <SelectValue placeholder="Aucun" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {u.isActive ? (
                      <Badge
                        variant="secondary"
                        className="rounded-lg text-[10px] bg-emerald-500/10 text-emerald-600 border-0"
                      >
                        Actif
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="rounded-lg text-[10px] bg-red-500/10 text-red-600 border-0"
                      >
                        Inactif
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      <ResetPasswordDialog userId={u.id} />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg"
                        onClick={() => handleToggleActive(u)}
                        title={u.isActive ? "Desactiver" : "Reactiver"}
                      >
                        {u.isActive ? (
                          <Ban className="h-3.5 w-3.5 text-destructive" />
                        ) : (
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                        )}
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
