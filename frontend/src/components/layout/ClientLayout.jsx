import { Outlet } from "react-router-dom";
import ClientNavbar from "./ClientNavbar";

const ClientLayout = () => {
  return (
    <div>
      <ClientNavbar />

      <main className="page-container">
        <Outlet />
      </main>
    </div>
  );
};

export default ClientLayout;