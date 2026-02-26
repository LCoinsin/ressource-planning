"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, X } from "lucide-react";

type Member = { id: string; nom: string; prenom: string };

interface MultiMemberSelectProps {
  members: Member[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function MultiMemberSelect({
  members,
  selectedIds,
  onChange,
}: MultiMemberSelectProps) {
  const [open, setOpen] = useState(false);

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  function remove(id: string) {
    onChange(selectedIds.filter((sid) => sid !== id));
  }

  const selectedMembers = members.filter((m) => selectedIds.includes(m.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between rounded-xl border-border/50 h-auto min-h-9 px-3 py-1.5"
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedMembers.length === 0 ? (
              <span className="text-muted-foreground text-sm">
                Selectionner des membres...
              </span>
            ) : (
              selectedMembers.map((m) => (
                <Badge
                  key={m.id}
                  variant="secondary"
                  className="rounded-lg text-xs gap-1 pr-1"
                >
                  {m.prenom} {m.nom}
                  <button
                    type="button"
                    className="hover:bg-muted rounded-full p-0.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(m.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 rounded-xl" align="start">
        <div className="max-h-60 overflow-auto p-1">
          {members.map((m) => {
            const selected = selectedIds.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggle(m.id)}
                className={cn(
                  "flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm hover:bg-muted/50 transition-colors text-left",
                  selected && "bg-muted/30"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-4 h-4 rounded border transition-colors",
                    selected
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border"
                  )}
                >
                  {selected && <Check className="h-3 w-3" />}
                </div>
                <span>
                  {m.prenom} {m.nom}
                </span>
              </button>
            );
          })}
          {members.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucun membre disponible
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
