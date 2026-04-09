"use client";

import { useState, useEffect, useRef } from "react";
import { X, Save, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Field {
  key: string;
  label: string;
  type: "text" | "number" | "select";
  options?: string[];
  required?: boolean;
}

interface EditRowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
  row: Record<string, unknown> | null;
  fields: Field[];
  title: string;
}

export function EditRowModal({
  isOpen, onClose, onSave, row, fields, title,
}: EditRowModalProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (row) setValues({ ...row });
    setErrors({});
  }, [row]);

  // Focus trap — RGAA 7.3
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Fermer sur Escape — RGAA 7.5
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const validate = () => {
    const errs: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.required && !values[f.key]) errs[f.key] = "Ce champ est requis";
      if (f.type === "number" && values[f.key] !== "" && isNaN(Number(values[f.key])))
        errs[f.key] = "Doit être un nombre";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const parsed: Record<string, unknown> = {};
    fields.forEach((f) => {
      parsed[f.key] = f.type === "number" ? Number(values[f.key]) : values[f.key];
    });
    onSave(parsed);
    onClose();
  };

  if (!isOpen) return null;

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card shadow-xl m-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 id="modal-title" className="font-display text-base font-semibold text-foreground">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fermer la fenêtre d'édition"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Formulaire */}
        <form
          className="p-6 space-y-4"
          onSubmit={(e) => { e.preventDefault(); handleSave(); }}
          noValidate
        >
          {fields.map((field, idx) => {
            const hasError = !!errors[field.key];
            const inputId = `field-${field.key}`;
            const errorId = `error-${field.key}`;

            return (
              <div key={field.key}>
                <label
                  htmlFor={inputId}
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-destructive" aria-hidden="true">*</span>
                  )}
                </label>

                {field.type === "select" ? (
                  <select
                    id={inputId}
                    value={String(values[field.key] ?? "")}
                    onChange={(e) => setValues((p) => ({ ...p, [field.key]: e.target.value }))}
                    aria-describedby={hasError ? errorId : undefined}
                    aria-invalid={hasError}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2 text-sm bg-background text-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      hasError ? "border-destructive" : "border-border"
                    )}
                  >
                    <option value="">Sélectionner…</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    ref={idx === 0 ? firstInputRef : undefined}
                    id={inputId}
                    type={field.type === "number" ? "number" : "text"}
                    value={String(values[field.key] ?? "")}
                    onChange={(e) => setValues((p) => ({ ...p, [field.key]: e.target.value }))}
                    aria-describedby={hasError ? errorId : undefined}
                    aria-invalid={hasError}
                    aria-required={field.required}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2 text-sm bg-background text-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      hasError ? "border-destructive" : "border-border"
                    )}
                  />
                )}

                {hasError && (
                  <p id={errorId} role="alert" className="mt-1 flex items-center gap-1 text-xs text-destructive">
                    <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                    {errors[field.key]}
                  </p>
                )}
              </div>
            );
          })}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Save}>
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
