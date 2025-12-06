import { createRoot } from "react-dom/client";
import { NavbarProvider } from "./context/NavbarContext";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <NavbarProvider>
    <App />
  </NavbarProvider>
);
