import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { DialogProvider } from "./context/DialogContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <AuthProvider>
      <DialogProvider>
        <AppRoutes />

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#151c2e",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.08)",
            },
          }}
        />
      </DialogProvider>
    </AuthProvider>
  );
}

export default App;