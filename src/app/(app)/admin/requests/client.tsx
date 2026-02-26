"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, Trash2 } from "lucide-react";
import {
  updateRequestStatus,
  deleteProjectRequest,
} from "@/actions/project-requests";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type ProjectRequest = {
  id: string;
  contactName: string;
  contactEmail: string;
  description: string;
  desiredDate: string | null;
  status: string;
  createdAt: string;
};

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "En attente",
    className: "bg-amber-500/10 text-amber-600 border-0",
  },
  ACCEPTED: {
    label: "Acceptee",
    className: "bg-emerald-500/10 text-emerald-600 border-0",
  },
  REJECTED: {
    label: "Refusee",
    className: "bg-red-500/10 text-red-600 border-0",
  },
};

export function RequestsClient({
  requests,
}: {
  requests: ProjectRequest[];
}) {
  const router = useRouter();

  async function handleStatus(id: string, status: "ACCEPTED" | "REJECTED") {
    try {
      await updateRequestStatus(id, status);
      toast.success(
        status === "ACCEPTED" ? "Demande acceptee" : "Demande refusee"
      );
      router.refresh();
    } catch {
      toast.error("Une erreur est survenue");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette demande ?")) return;
    try {
      await deleteProjectRequest(id);
      toast.success("Demande supprimee");
      router.refresh();
    } catch {
      toast.error("Une erreur est survenue");
    }
  }

  return (
    <div className="rounded-2xl border border-border/40 bg-background shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border/30 hover:bg-transparent">
            <TableHead className="text-xs">Contact</TableHead>
            <TableHead className="text-xs">Description</TableHead>
            <TableHead className="text-xs">Date souhaitee</TableHead>
            <TableHead className="text-xs">Statut</TableHead>
            <TableHead className="text-xs">Recue le</TableHead>
            <TableHead className="text-xs w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground py-12 text-sm"
              >
                Aucune demande
              </TableCell>
            </TableRow>
          ) : (
            requests.map((r) => {
              const config = statusConfig[r.status] ?? statusConfig.PENDING;
              return (
                <TableRow
                  key={r.id}
                  className="border-border/20 hover:bg-muted/20"
                >
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{r.contactName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {r.contactEmail}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {r.description}
                  </TableCell>
                  <TableCell className="text-sm">
                    {r.desiredDate
                      ? format(new Date(r.desiredDate), "dd MMM yyyy", {
                          locale: fr,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`rounded-lg text-[10px] ${config.className}`}
                    >
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(r.createdAt), "dd MMM yyyy", {
                      locale: fr,
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      {r.status === "PENDING" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg"
                            onClick={() => handleStatus(r.id, "ACCEPTED")}
                            title="Accepter"
                          >
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg"
                            onClick={() => handleStatus(r.id, "REJECTED")}
                            title="Refuser"
                          >
                            <X className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg"
                        onClick={() => handleDelete(r.id)}
                        title="Supprimer"
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
  );
}
