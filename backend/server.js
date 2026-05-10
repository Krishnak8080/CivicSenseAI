require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));

const issueRoutes = require("./routes/issueRoutes");
app.use("/api", issueRoutes);

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

app.listen(8000, () => {
  console.log("Server running on port 8000");
});
