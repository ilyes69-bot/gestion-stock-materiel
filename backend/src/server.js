const express = require("express");
const cors = require("cors");
require("dotenv").config();

const dashboardRoutes = require("./routes/dashboard.routes");
const authRoutes = require("./routes/auth.routes");
const materielRoutes = require("./routes/materiel.routes");
const empruntRoutes = require("./routes/emprunt.routes");
const notificationRoutes = require("./routes/notification.routes");
const historiqueRoutes = require("./routes/historique.routes");
const userRoutes = require("./routes/user.routes");
const app = express();
const workerRoutes = require("./routes/worker.routes");


app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.json({
    message: "API Gestion de stock et prêt de matériel lancée",
  });
});

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/materiels", materielRoutes);
app.use("/api/emprunts", empruntRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/historique", historiqueRoutes);
app.use("/api/users", userRoutes);
app.use("/api/worker", workerRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});