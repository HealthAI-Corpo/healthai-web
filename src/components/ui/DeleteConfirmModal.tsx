"use client";

import { useEffect, useRef } from "react";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemDescription: string;
}

export function DeleteConfirmModal({
  isOpen, onClose, onConfirm, itemDescription,
}: DeleteConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus sur Annuler par défaut (pattern sécurité) — RGAA 7.3
  useEffect(() => {
    if (isOpen) setTimeout(() => cancelRef.current?.focus(), 50);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-title"
      aria-describedby="delete-desc"
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-xl m-4 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Trash2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 id="delete-title" className="font-display text-base font-semibold text-foreground">
              Supprimer cette ligne ?
            </h2>
            <p id="delete-desc" className="mt-1 text-sm text-muted-foreground">
              La ligne <strong className="text-foreground">{itemDescription}</strong> sera supprimée.
              Cette action ne peut pas être annulée.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Annuler la suppression"
            className="rounded-lg p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button ref={cancelRef} variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            size="sm"
            icon={Trash2}
            onClick={() => { onConfirm(); onClose(); }}
            aria-label={`Confirmer la suppression de ${itemDescription}`}
          >
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  );
}
