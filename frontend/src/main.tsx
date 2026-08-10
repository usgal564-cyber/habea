import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// @ts-ignore
import "./index.css";
import App from "./App";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <ShadcnToaster />
  </StrictMode>,
);
