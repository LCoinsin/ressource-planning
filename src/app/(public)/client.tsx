"use client";

import { useMemo, useState } from "react";
import { GanttPublic } from "@/components/gantt/gantt-public";
import { CapacityChart } from "@/components/capacity/capacity-chart";
import { getTimeRange, getMinWidth } from "@/components/gantt/packing";
import type { GanttTask } from "@/components/gantt/packing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Calendar,
  Clock,
  Send,
  TrendingUp,
  Users,
} from "lucide-react";
import { createProjectRequest } from "@/actions/project-requests";
import { toast } from "sonner";

type PublicMember = {
  id: string;
  nom: string;
  prenom: string;
  dateArrivee: string;
  dateDepart: string | null;
  upcomingLoad: number;
  taskCount: number;
};

interface PublicClientProps {
  tasks: GanttTask[];
  members: PublicMember[];
}

export function PublicClient({ tasks, members }: PublicClientProps) {
  const { start, end } = useMemo(() => getTimeRange(tasks), [tasks]);
  const minWidth = getMinWidth(start, end, "week");

  // Members for capacity chart
  const capacityMembers = members.map((m) => ({
    id: m.id,
    dateArrivee: m.dateArrivee,
    dateDepart: m.dateDepart,
  }));

  // Available members (load < 0.8)
  const availableMembers = members.filter((m) => m.upcomingLoad < 0.8);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">
          Planning &amp; Disponibilites
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Visualisez l&apos;activite en cours de notre equipe, le taux de charge
          global et les disponibilites a venir.
        </p>
      </div>

      {/* === BLOC SEAMLESS GANTT + CHART (public) === */}
      <div className="rounded-2xl border border-border/40 bg-background shadow-sm overflow-hidden">
        {/* Section titre Gantt */}
        <div className="px-4 py-3 border-b border-border/30">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Projets en cours
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Vue simplifiee de l&apos;activite courante
          </p>
        </div>

        {/* Gantt anonymise */}
        <GanttPublic tasks={tasks} />

        {/* Separateur subtil */}
        <div className="px-4">
          <div className="border-t border-border/20" />
        </div>

        {/* Section titre Charge */}
        <div className="px-4 pt-3 pb-1">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            Taux de charge global
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Capacite de l&apos;equipe vs charge planifiee
          </p>
        </div>

        {/* Chart */}
        <div className="px-4 pb-4">
          <CapacityChart
            tasks={tasks}
            members={capacityMembers}
            start={start}
            end={end}
            zoom="week"
            minWidth={minWidth}
          />
        </div>
      </div>

      {/* Disponibilites */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight">Disponibilites</h2>
        </div>
        {availableMembers.length === 0 ? (
          <div className="rounded-2xl border border-border/40 bg-background p-8 text-center text-sm text-muted-foreground shadow-sm">
            <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            Aucune disponibilite immediate. Contactez-nous pour planifier un projet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableMembers.map((m) => {
              const loadPercent = Math.round(m.upcomingLoad * 100);
              const freePercent = 100 - loadPercent;
              return (
                <div
                  key={m.id}
                  className="rounded-2xl border border-border/40 bg-background p-4 shadow-sm flex items-center gap-3"
                >
                  <Avatar className="h-10 w-10 border border-border/30">
                    <AvatarFallback className="text-xs bg-muted/50">
                      {m.prenom[0]}
                      {m.nom[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {m.prenom} {m.nom[0]}.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.taskCount === 0
                        ? "Disponible maintenant"
                        : `${freePercent}% de dispo`}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="rounded-lg text-[10px] bg-emerald-500/10 text-emerald-600 border-0 flex-shrink-0"
                  >
                    Dispo
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Formulaire de contact */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight">
            Soumettre un projet
          </h2>
        </div>
        <ContactForm />
      </section>
    </div>
  );
}

function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [description, setDescription] = useState("");
  const [desiredDate, setDesiredDate] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await createProjectRequest({
        contactName,
        contactEmail,
        description,
        desiredDate: desiredDate || null,
      });
      toast.success("Votre demande a ete envoyee !");
      setContactName("");
      setContactEmail("");
      setDescription("");
      setDesiredDate("");
    } catch {
      toast.error("Une erreur est survenue. Verifiez les champs.");
    }
    setLoading(false);
  }

  return (
    <div className="rounded-2xl border border-border/40 bg-background p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Votre nom</Label>
            <Input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="rounded-xl border-border/50"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Votre email</Label>
            <Input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="rounded-xl border-border/50"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Description du projet</Label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex min-h-[100px] w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Decrivez votre besoin..."
            required
            minLength={10}
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Date souhaitee (optionnel)
          </Label>
          <Input
            type="date"
            value={desiredDate}
            onChange={(e) => setDesiredDate(e.target.value)}
            className="rounded-xl border-border/50 w-48"
          />
        </div>
        <Button type="submit" className="rounded-xl" disabled={loading}>
          {loading ? (
            "Envoi..."
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Envoyer la demande
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
