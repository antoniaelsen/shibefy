import express, { CookieOptions, NextFunction, Request, Response, Router } from 'express';
import cors from 'cors';
import fs from 'fs';
import http from 'http';
import https from 'https';
import session from 'express-session';
import passport from 'passport';
import config from './config';
import createAuthMiddleware from './auth';
import createImageMiddleware from './image';
import createReverseProxyMiddleware from './reverse-proxy';
import { logger as rootLogger } from "./util/logger";
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';


const __filename = fileURLToPath((import.meta as any).url);
const __dirname = dirname(__filename);
 

const configurePassport = () => {
  // Passport session setup.
  //   To support persistent login sessions, Passport needs to be able to
  //   serialize users into and deserialize users out of the session. Typically,
  //   this will be as simple as storing the user ID when serializing, and finding
  //   the user by ID when deserializing. However, since this example does not
  //   have a database of user records, the complete spotify profile is serialized
  //   and deserialized.
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });
};

const createServer = () => {
  const logger = rootLogger.child({ labels: ["express"] });
  const privateKey  = fs.readFileSync('ssl/localhost-key.pem', 'utf8');
  const certificate = fs.readFileSync('ssl/localhost.pem', 'utf8');
  const credentials = { key: privateKey, cert: certificate };
  const corsOptions = {
    credentials: true,
    origin: `https://${config.frontendDomain}`,
  };


  const app = express();
  app.use(cors(corsOptions));


  // Configure user sessions
  const cookieParams: CookieOptions = {
    // domain:,
    httpOnly: true,
    // maxAge:,
    // path:,
    sameSite: "lax",
    secure: false,
  };
  app.use(
    session({
      cookie: cookieParams,
      secret: config.sessionSecret,
      resave: true,
      saveUninitialized: false,
    })
  );

  // Configure passport - auth
  configurePassport();
  app.use(passport.initialize());
  app.use(passport.session());

  // Middleware - Log
  app.use((req: Request, res: Response, next: NextFunction) => {
    logger.debug(`[${(req as any).sessionID}] [${req.method}] "${req.path}"${req.xhr ? ' XHR' : ''}`,
      `from "${req.headers.referer}" (${req.get('Origin')})`)
    next();
  });

  
  const router = Router();
  router.use("/auth", createAuthMiddleware());
  router.use("/rproxy", createReverseProxyMiddleware());
  router.use("/shibe", createImageMiddleware());
  app.use("/api", router);

  app.use('/static', express.static(path.join(__dirname, '../../frontend/build/static')));
  app.get('*', (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, '../../frontend/build/') });
  });

  if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
    const httpsServer = https.createServer(credentials, app);
    return httpsServer;
  }
  
  const httpServer = http.createServer(app);
  return httpServer;
}
 
rootLogger.info(`Launching shibefy backend (${process.env.NODE_ENV || "no env"})`);

const app = createServer();
const port = process.env.PORT || 8888;

rootLogger.info(`Service launched, listening on port ${port}`);
app.listen(port);
