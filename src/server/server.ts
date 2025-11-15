import express from 'express';
import compression from 'compression';
import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import Logger from "../common/logger"
import { GlobalPaths } from "./core/basic"
import Service from "./service"
import Upload from "./upload"

Logger.Info("server going to start.");


const mainApp: express.Application = express();
mainApp.use(compression());
mainApp.use('/', express.static(GlobalPaths.ROOT_CLIENT));
mainApp.use('/assets', express.static(`${GlobalPaths.ROOT_CONTENT}assets/`));
mainApp.use(cookieParser('singedMyCookie'));
mainApp.post("/service", bodyParser.json({ limit: "1mb" }), Service);
mainApp.post('/upload', Upload);

const _PORT: number = 8181;
mainApp.listen(_PORT, () => Logger.Info(`SLOG HTTP server is now listening port: ${_PORT}`));


Logger.Info("server is working ...");
