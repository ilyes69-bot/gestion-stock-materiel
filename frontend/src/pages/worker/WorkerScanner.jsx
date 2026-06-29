import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import toast from "react-hot-toast";

const WorkerScanner = () => {
  const navigate = useNavigate();

  const [manualValue, setManualValue] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const scannerRef = useRef(null);
  const readerId = "worker-qr-reader";

  const extractQrToken = (value) => {
    const cleanValue = value.trim();

    if (!cleanValue) {
      return "";
    }

    try {
      const url = new URL(cleanValue);
      const parts = url.pathname.split("/").filter(Boolean);
      return parts[parts.length - 1] || "";
    } catch (error) {
      const parts = cleanValue.split("/").filter(Boolean);
      return parts[parts.length - 1] || cleanValue;
    }
  };

  const isValidUuid = (value) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    return uuidRegex.test(value);
  };

  const goToScanResult = (value) => {
    const qrToken = extractQrToken(value);

    if (!qrToken || !isValidUuid(qrToken)) {
      toast.error("QR code invalide ou incomplet.");
      return;
    }

    navigate(`/worker/scan/${qrToken}`);
  };

  const stopCamera = async () => {
    if (!scannerRef.current) {
      return;
    }

    try {
      await scannerRef.current.stop();
    } catch (error) {
      // La caméra peut déjà être arrêtée
    }

    try {
      scannerRef.current.clear();
    } catch (error) {
      // Nettoyage silencieux
    }

    scannerRef.current = null;
    setIsScanning(false);
  };

  const startCamera = async () => {
    setCameraError("");

    try {
      const scanner = new Html5Qrcode(readerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
        },
        async (decodedText) => {
          await stopCamera();
          goToScanResult(decodedText);
        },
        () => {}
      );

      setIsScanning(true);
    } catch (error) {
      setCameraError(
        "Impossible d’ouvrir la caméra. Vérifiez l’autorisation du navigateur."
      );
      setIsScanning(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    goToScanResult(manualValue);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="worker-page">
      <div className="worker-header">
        <h1>Scanner un matériel</h1>
        <p>
          Scannez le QR code collé sur le matériel pour confirmer sa sortie ou
          gérer son retour.
        </p>
      </div>

      <div className="worker-card">
        <h2>Scan avec caméra</h2>

        <p>
          Cliquez sur le bouton ci-dessous puis montrez le QR code du matériel à
          la caméra.
        </p>

        <div id={readerId} className="worker-camera-box"></div>

        {cameraError && <p className="error-message">{cameraError}</p>}

        <div className="worker-actions">
          {!isScanning ? (
            <button onClick={startCamera}>Ouvrir la caméra</button>
          ) : (
            <button className="secondary-button" onClick={stopCamera}>
              Arrêter le scan
            </button>
          )}
        </div>
      </div>

      <div className="worker-card">
        <h2>Scan manuel</h2>

        <p>
          Vous pouvez aussi coller ici le lien du QR code ou le token du
          matériel.
        </p>

        <form onSubmit={handleManualSubmit} className="worker-manual-form">
          <input
            type="text"
            placeholder="Coller le lien ou le QR token ici..."
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value)}
          />

          <button type="submit">Valider</button>
        </form>
      </div>
    </div>
  );
};

export default WorkerScanner;