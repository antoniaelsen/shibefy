import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import https from 'https';
import session from 'express-session';
import passport from 'passport';
import config from './config';
import createAuthMiddleware from './auth';
import createImageMiddleware from './image';
import { logger } from "./util/logger";
 

// TODO(aelsen): no implicit any

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
  const privateKey  = fs.readFileSync('ssl/localhost-key.pem', 'utf8');
  const certificate = fs.readFileSync('ssl/localhost.pem', 'utf8');
  const credentials = { key: privateKey, cert: certificate };

  const app = express();
  app.use(cors());
  
  // Configure user sessions
  app.use(
    session({
      secret: config.sessionSecret,
      resave: true,
      saveUninitialized: true,
    })
  );

  // Configure passport - auth
  configurePassport();
  app.use(passport.initialize());
  app.use(passport.session());

  // Middleware - Log
  app.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(`[${req.method}] "${req.path}"${req.xhr ? ' XHR' : ''}`,
      `from "${req.headers.referer}" (${req.get('Origin')})`)
    next();
  });

  app.use(createAuthMiddleware());
  app.use(createImageMiddleware());

  const httpsServer = https.createServer(credentials, app);
  return httpsServer;
}
 
logger.info(`Launching shibefy backend (${process.env.NODE_ENV || "development"})`);

const app = createServer();
const port = process.env.PORT || 8888;

logger.info(`Service launched, listening on port ${port}`);
app.listen(port);
