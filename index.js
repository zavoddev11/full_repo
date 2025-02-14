const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const messageRoutes = require("./routes/message")
const sessionsRoutes = require("./routes/session")
const path = require("path");
const { setupSocket } = require("./socket");

dotenv.config();


const app = express();

app.use(express.static(path.join(__dirname, "public")));
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use(cors({ origin: "http://localhost:8000" }));

app.use("/api/messages", messageRoutes);
app.use("/api/sessions", sessionsRoutes);

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.loginso("DB Connection Successful");
  })
  .catch((err) => {
    console.log(err.message);
  });

server.listen(process.env.PORT, () => console.log(`Server started on ${process.env.PORT}`));


setupSocket(server);
