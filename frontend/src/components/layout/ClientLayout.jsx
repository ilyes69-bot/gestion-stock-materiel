import { Outlet } from "react-router-dom";
import ClientNavbar from "./ClientNavbar";
import ClientChatbot from "../chatbot/ClientChatbot";

const ClientLayout = () => {
  return (
    <div>
      <ClientNavbar />

      <main className="page-container">
        <Outlet />
      </main>
      
      <ClientChatbot />
    </div>
  );
};

export default ClientLayout;