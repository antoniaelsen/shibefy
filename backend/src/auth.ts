import { NextFunction, Request, Response, Router } from 'express';
import passport from 'passport';
import { Strategy as SpotifyStrategy } from "passport-spotify";
import config from "./config";
import { URLSearchParams } from 'url';
import { logger as rootLogger } from './util/logger';
 

const scope = [
  "user-library-read",
  "playlist-read-private",
  "playlist-modify-public",
  "playlist-modify-private",
  "ugc-image-upload"
];

const createAuthMiddleware = () => {
  const logger = rootLogger.child({ labels: ["auth"] });
  const saveReturnTo = (req: Request, res: Response, next: NextFunction) => {
    if (req.query && req.query.returnTo) {
      const url = (req.query.returnTo as string);
      const returnTo = url.endsWith('/') ? url.slice(0, -1) : url;
      (req as any).session.returnTo = returnTo;
    }
    return next();
  };
 
  const redirectWithError = (req, res) => {
    const defaultUrl = `https://${config.redirectDomain}`;
    const returnTo = (req as any).session.returnTo || defaultUrl;
    const error = req.session.error;
    logger.info(`Redirecting with error: ${JSON.stringify(error)} to ${returnTo}`);

    const params = new URLSearchParams({ error: encodeURIComponent(error) });
    const returnParams = `${returnTo}?${params.toString()}`;
  
    return res.redirect(returnParams);
  };
 
  const redirectWithToken = (req, res) => {
    const defaultUrl = `https://${config.redirectDomain}`;
    const returnTo = (req as any).session.returnTo || defaultUrl;
    
    if (!req.user) {
      logger.warning(`Redirecting without token to ${returnTo}`);
      return res.redirect(returnTo);
    }
    const token = req.user.auth?.accessToken;
    if (!token) {
      logger.warning(`Redirecting without token to ${returnTo}`);
      return res.redirect(returnTo);
    }
    
    const params = new URLSearchParams({ access_token: token });
    const returnParams = `${returnTo}?${params.toString()}`;
    
    logger.debug(`Redirecting with token to ${returnTo}`);
    return res.redirect(returnParams);
  };

  passport.use(
    new SpotifyStrategy(
      {
        clientID: config.clientID,
        clientSecret: config.clientSecret,
        callbackURL: `https://${config.callbackDomain}/auth/spotify/callback`,
        passReqToCallback: true
      },
      (_req, accessToken, refreshToken, expires_in, profile, done, ) => {
        const { id, displayName } = profile;
        logger.info(`Authenticated user [${id}] "${displayName}"`);
        return done(null, { ...profile, auth: { accessToken, refreshToken, expires_in } });
      }
    )
  );

  const authenticate = passport.authenticate('spotify', { scope });

  const router = Router();

  const errorHandler = (err, req, res, next) => {
    // Passport error handing
    //  https://github.com/jaredhanson/passport-facebook/issues/255
    if (err) {
      logger.error(`Passport error: ${JSON.stringify(err, null, 2)}`);
      const { oauthError } = err;
      if (oauthError && oauthError.data) {
        req.session.error = oauthError.data;
      } else if (err.message) {
        req.session.error = err.message;
      } else {
        req.session.error = "Unknown error. Please try again later.";
      }
      redirectWithError(req, res);
    }
  };

  router.get(
    '/spotify',
    saveReturnTo,
    authenticate,
    errorHandler,
  );

  router.get(
    '/spotify/callback',
    authenticate,
    errorHandler,
    redirectWithToken
  );
  
  return router;
};

export default createAuthMiddleware;