import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import DashboardAdmin from "../pages/admin/DashboardAdmin";
import ListeMateriels from "../pages/admin/ListeMateriels";
import AjouterMateriel from "../pages/admin/AjouterMateriel";
import ModifierMateriel from "../pages/admin/ModifierMateriel";
import GestionEmprunts from "../pages/admin/GestionEmprunts";
import HistoriqueGlobal from "../pages/admin/HistoriqueGlobal";

import Catalogue from "../pages/client/Catalogue";
import DetailMateriel from "../pages/client/DetailMateriel";
import CreerEmprunt from "../pages/client/CreerEmprunt";
import MesEmprunts from "../pages/client/MesEmprunts";
import Notifications from "../pages/client/Notifications";
import HistoriqueClient from "../pages/client/HistoriqueClient";

import NotFound from "../pages/errors/NotFound";
import Unauthorized from "../pages/errors/Unauthorized";

import ProtectedRoute from "../components/layout/ProtectedRoute";
import ClientLayout from "../components/layout/ClientLayout";
import AdminLayout from "../components/layout/AdminLayout";

import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import Home from "../pages/public/Home";
import ProfilClient from "../pages/client/ProfilClient";
import ProfilAdmin from "../pages/admin/ProfilAdmin";
import GestionUtilisateurs from "../pages/admin/GestionUtilisateurs";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Routes Client */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <ClientLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/client/catalogue" element={<Catalogue />} />
          <Route path="/client/materiel/:id" element={<DetailMateriel />} />
          <Route path="/client/emprunt/:materielId" element={<CreerEmprunt />} />
          <Route path="/client/mes-emprunts" element={<MesEmprunts />} />
          <Route path="/client/notifications" element={<Notifications />} />
          <Route path="/client/historique" element={<HistoriqueClient />} />
          <Route path="/client/profil" element={<ProfilClient />} />
        </Route>

        {/* Routes Admin */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<DashboardAdmin />} />
          <Route path="/admin/materiels" element={<ListeMateriels />} />
          <Route path="/admin/materiels/ajouter" element={<AjouterMateriel />} />
          <Route path="/admin/materiels/modifier/:id" element={<ModifierMateriel />} />
          <Route path="/admin/emprunts" element={<GestionEmprunts />} />
          <Route path="/admin/historique" element={<HistoriqueGlobal />} />
          <Route path="/admin/profil" element={<ProfilAdmin />} />
          <Route path="/admin/utilisateurs" element={<GestionUtilisateurs />} />
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;