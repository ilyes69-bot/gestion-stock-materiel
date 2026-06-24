import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "rgba(18, 18, 22, 0.96)",
            color: "#ffffff",
            border: "1px solid rgba(255, 122, 0, 0.35)",
            borderRadius: "16px",
            boxShadow: "0 18px 40px rgba(0, 0, 0, 0.45)",
            padding: "14px 16px",
            fontWeight: "700",
          },
          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;