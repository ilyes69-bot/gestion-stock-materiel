import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ClientChatbot = () => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Bonjour 👋 Je suis votre assistant client. Comment puis-je vous aider ?",
    },
  ]);

  const addBotMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text,
      },
    ]);
  };

  const handleQuestion = (type) => {
    if (type === "emprunter") {
      addBotMessage(
        "Pour emprunter un matériel, allez dans le catalogue, choisissez un matériel disponible, cliquez sur Voir détail, puis sur Emprunter ce matériel."
      );
    }

    if (type === "catalogue") {
      addBotMessage("Je vous redirige vers le catalogue des matériels.");
      navigate("/client/catalogue");
    }

    if (type === "emprunts") {
      addBotMessage("Je vous redirige vers la page de vos emprunts.");
      navigate("/client/mes-emprunts");
    }

    if (type === "notifications") {
      addBotMessage("Je vous redirige vers vos notifications.");
      navigate("/client/notifications");
    }

    if (type === "statuts") {
      addBotMessage(
        "Voici les statuts principaux : DISPONIBLE signifie que le matériel peut être emprunté. EMPRUNTE signifie qu’il est déjà pris. INDISPONIBLE signifie qu’il ne peut pas être utilisé. ENDOMMAGE signifie qu’il est abîmé."
      );
    }

    if (type === "retard") {
      addBotMessage(
        "Si votre emprunt est en retard, vous devez retourner le matériel rapidement. L’administrateur pourra ensuite valider le retour."
      );
    }
  };

  return (
    <>
      <button className="chatbot-toggle" onClick={() => setOpen(!open)}>
        {open ? "×" : "💬"}
      </button>

      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div>
              <strong>Assistant Client</strong>
              <span>Aide et navigation</span>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={
                  message.sender === "bot"
                    ? "chatbot-message bot-message"
                    : "chatbot-message user-message"
                }
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="chatbot-actions">
            <button onClick={() => handleQuestion("emprunter")}>
              Comment emprunter ?
            </button>

            <button onClick={() => handleQuestion("catalogue")}>
              Voir le catalogue
            </button>

            <button onClick={() => handleQuestion("emprunts")}>
              Mes emprunts
            </button>

            <button onClick={() => handleQuestion("notifications")}>
              Mes notifications
            </button>

            <button onClick={() => handleQuestion("statuts")}>
              Comprendre les statuts
            </button>

            <button onClick={() => handleQuestion("retard")}>
              Emprunt en retard
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ClientChatbot;