import express from "express";
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"
import http from "http"
import websiteRoutes from "./routes/website.js"
import messageRoutes from "./routes/message.js"
import sessionsRoutes from "./routes/session.js"
import adminRoutes from "./routes/admin.js"
import sitedataRoutes from "./routes/sitedata.js"
import path from "path"
import socket from "./socket.js"
import { ComponentLoader } from 'adminjs';
import Message from './models/message.js'
import Session from './models/session.js'
import SiteData from './models/sitedata.js'
import { fileURLToPath } from "url";
import AdminJS from "adminjs"
import AdminJSExpress from "@adminjs/express"
import { Database, Resource } from "@adminjs/mongoose"
import Website from "./models/website.js";
import { io } from "socket.io-client";
import { testAi } from "./utils/prompt/test_run.js";
const SOCKET_URL = process.env.SOCKET_URL
export const socketClient = io(SOCKET_URL);


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { setupSocket } = socket
dotenv.config();
const componentLoader = new ComponentLoader();
const DialogueComponent = componentLoader.add('dialogue', path.resolve(__dirname, 'components', 'Dialogue.jsx'));

const app = express();

// const allowedOrigins = ["https://ai-chatbot-zvln.onrender.com", 'http://localhost:5459', process.env.LINK_CORS];
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(express.static(path.join(__dirname, "public")));
const server = http.createServer(app);

app.get('/chatapp.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript'); // Ensure correct MIME type
  res.sendFile(path.join(__dirname, 'public', 'chatapp.js'));
});

app.use(express.json());

// testAi("67bfb113e65f411a3e1acfbd")

app.use("/api/websites", websiteRoutes);
app.use("/api/sitedata", sitedataRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);


const PORT = 5459
const connection = mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => {
    console.log(err.message);
  });

// Models

setupSocket(server);




const customAfter = (originalResponse, request, context) => {
  socketClient.emit("create:website", originalResponse.record.params); // Emit to all connected clients
  return originalResponse
}

AdminJS.registerAdapter({ Database, Resource });

const admin = new AdminJS({
  resources: [
    {
      resource: Website,
      options: {
        parent: { name: "Database" },
        actions: {
          new: {
            after: [customAfter]
          },
        },
      },
    },
    {
      resource: Session,
      options: { parent: { name: "Database" } },
    },
    {
      resource: Message,
      options: { parent: { name: "Database" } },
    },
    {
      resource: SiteData,
      options: { parent: { name: "Database" } },
    },
  ],

  componentLoader,
  rootPath: '/admin',

  pages: {
    DialogueComponent: {
      handler: async (request, response, context) => {
        console.log({ message: "Custom page loaded successfully!" })
        return {
          message: "Custom page loaded successfully!",
        };
      },
      component: DialogueComponent,
      icon: "icon"
    }
  }
});




const adminRouter = AdminJSExpress.buildRouter(admin);


app.use("/admin", adminRouter);


server.listen(PORT, () => {
  console.log(`🚀 AdminJS running at http://localhost:${PORT}/admin`);
});


setTimeout(() => {
  // notifyWebsiteCreation({ website: "MyNewSite", owner: "Admin" });
}, 5000);