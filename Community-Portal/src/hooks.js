import { useEffect, useRef } from "react";

/* Shared behaviour hooks for the portal apps (no visual components — each app
   keeps its own UI atoms). */

// Open dialogs, topmost last — only the topmost one reacts to Escape, so a
// confirm dialog stacked on a drawer closes without closing the drawer too.
const dialogStack = [];

// Dialog behaviour: Escape closes, background scroll is locked, focus moves
// into the dialog on open and returns to the trigger on close.
export function useDialog(open, onClose) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const token = {};
    dialogStack.push(token);
    const previouslyFocused = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape" && dialogStack[dialogStack.length - 1] === token) onCloseRef.current?.();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      dialogStack.splice(dialogStack.indexOf(token), 1);
      document.body.style.overflow = prevOverflow;
      if (previouslyFocused && typeof previouslyFocused.focus === "function") previouslyFocused.focus();
    };
  }, [open]);

  return panelRef;
}

// Close a popover (menu, notification panel) on Escape.
export function useEscape(active, onEscape) {
  const ref = useRef(onEscape);
  ref.current = onEscape;
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => { if (e.key === "Escape") ref.current?.(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active]);
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
