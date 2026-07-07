import { createContext, useContext, useRef, useState } from "react";

const DialogContext = createContext(null);

export const DialogProvider = ({ children }) => {
  const [dialog, setDialog] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const resolverRef = useRef(null);

  const closeDialog = () => {
    setDialog(null);
    setInputValue("");
    resolverRef.current = null;
  };

  const confirmDialog = ({
    title = "Confirmation",
    message = "Voulez-vous continuer ?",
    confirmText = "Confirmer",
    cancelText = "Annuler",
    variant = "default",
  }) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;

      setDialog({
        type: "confirm",
        title,
        message,
        confirmText,
        cancelText,
        variant,
      });
    });
  };

  const promptDialog = ({
    title = "Information",
    message = "",
    label = "Votre réponse",
    placeholder = "",
    confirmText = "Valider",
    cancelText = "Annuler",
    variant = "default",
    required = false,
  }) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setInputValue("");

      setDialog({
        type: "prompt",
        title,
        message,
        label,
        placeholder,
        confirmText,
        cancelText,
        variant,
        required,
      });
    });
  };

  const handleCancel = () => {
    if (resolverRef.current) {
      resolverRef.current(dialog.type === "confirm" ? false : null);
    }

    closeDialog();
  };

  const handleConfirm = () => {
    if (!dialog) return;

    if (dialog.type === "prompt") {
      if (dialog.required && inputValue.trim() === "") {
        return;
      }

      resolverRef.current(inputValue.trim());
    } else {
      resolverRef.current(true);
    }

    closeDialog();
  };

  return (
    <DialogContext.Provider value={{ confirmDialog, promptDialog }}>
      {children}

      {dialog && (
        <div className="app-dialog-overlay">
          <div className="app-dialog-card">
            <div className="app-dialog-header">
              <h2>{dialog.title}</h2>

              <button type="button" onClick={handleCancel}>
                ×
              </button>
            </div>

            {dialog.message && (
              <p className="app-dialog-message">{dialog.message}</p>
            )}

            {dialog.type === "prompt" && (
              <div className="app-dialog-field">
                <label>{dialog.label}</label>

                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={dialog.placeholder}
                  rows="4"
                  autoFocus
                />

                {dialog.required && inputValue.trim() === "" && (
                  <small>Ce champ est obligatoire.</small>
                )}
              </div>
            )}

            <div className="app-dialog-actions">
              <button
                type="button"
                className="app-dialog-cancel"
                onClick={handleCancel}
              >
                {dialog.cancelText}
              </button>

              <button
                type="button"
                className={
                  dialog.variant === "danger"
                    ? "app-dialog-confirm danger"
                    : "app-dialog-confirm"
                }
                onClick={handleConfirm}
              >
                {dialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error("useDialog doit être utilisé dans DialogProvider");
  }

  return context;
};