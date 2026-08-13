import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "sonner";
import "./styles/tailwind.css";
import "./styles/global.css";
import "./styles/app.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // <React.StrictMode>
  <BrowserRouter>
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <App />
          <Toaster theme="dark" richColors closeButton />
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  </BrowserRouter>,
  // </React.StrictMode>
);
