
  import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { AuthProvider } from "./app/components/cip/AuthContext.tsx";
import { initNativeApp } from "./lib/native";

// Native (Capacitor) setup: status bar, splash, Android back button and auth
// deep links. No-ops in a normal browser.
void initNativeApp();

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
  