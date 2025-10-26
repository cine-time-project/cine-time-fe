"use client";
import { createContext, useContext, useState, useCallback } from "react";

const SidebarCtx = createContext(null);

export function SidebarProvider({ children }) {
  const [open, setOpen] = useState(false);
  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen(v => !v), []);
  return (
    <SidebarCtx.Provider value={{ open, show, hide, toggle }}>
      {children}
    </SidebarCtx.Provider>
  );
}
export const useSidebar = () => useContext(SidebarCtx);
