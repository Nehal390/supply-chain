import path from "path";
import { fileURLToPath } from "url";
import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { sessionMiddleware } from "./lib/session";
import { mockFallbackMiddleware } from "./mock-middleware";

const app: Express = express();

app.set("trust proxy", 1);

app.use(
  (pinoHttp as any).default({
    logger,
    serializers: {
  req(req: any) {
    return {
      id: req.id,
      method: req.method,
      url: req.url?.split("?")[0],
    };
  }, 
     res(res: any) { 
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);

app.use("/api", mockFallbackMiddleware);
app.use("/api", router);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendPath = path.resolve(
  __dirname,
  "../../supply-chain/dist/public"
);

app.use(express.static(frontendPath));

app.use((_req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});
export default app;
