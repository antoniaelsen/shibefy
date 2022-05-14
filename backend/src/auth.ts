import { CookieOptions, NextFunction, Response, Router } from 'express';
import passport from 'passport';
import { Strategy as SpotifyStrategy } from "passport-spotify";
import { URLSearchParams } from 'url';

import { Request } from './types/Request';
import config from "./config";
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

  const cookieParams: CookieOptions = {
    // domain:,
    httpOnly: true,
    // maxAge:,
    // path:,
    sameSite: "lax",
    secure: true,
  };

  const saveReturnTo = (req: Request, res: Response, next: NextFunction) => {
    if (req.query && req.query.returnTo) {
      const url = (req.query.returnTo as string);
      const returnTo = url.endsWith('/') ? url.slice(0, -1) : url;
      (req as any).session.returnTo = returnTo;
    }
    return next();
  };

  const setAuthStateCookie = (req: Request, res: Response) => {
    const authState = {
      isLoggedIn: !!req.user,
    };
  
    res.cookie("shibefy-auth", JSON.stringify(authState), { ...cookieParams, httpOnly: false });
  };
 
  const redirectWithError = (req, res) => {
    const defaultUrl = `https://${config.frontendDomain}`;
    const returnTo = (req as any).session.returnTo || defaultUrl;
    const error = req.session.error;
    logger.info(`Redirecting with error: ${JSON.stringify(error)} to ${returnTo}`);

    const params = new URLSearchParams({ error: encodeURIComponent(error) });
    const returnParams = `${returnTo}?${params.toString()}`;
  
    return res.redirect(returnParams);
  };
 
  const redirectToReturnTo = (req: Request, res: Response) => {
    const defaultUrl = `https://${config.frontendDomain}/`;
    const returnTo = (req as any).session.returnTo || defaultUrl;
    setAuthStateCookie(req, res);

    return res.redirect(returnTo);
  };

  const params = {
    clientID: config.clientID,
    clientSecret: config.clientSecret,
    callbackURL: `https://${config.backendDomain}/auth/spotify/callback`,
    passReqToCallback: true
  }

  const verifyCallback = (req, accessToken, refreshToken, expires_in, profile, done, ) => {
    const { id, displayName } = profile;
    logger.info(`Authenticated user [${id}] "${displayName}"`);

    // TODO(aelsen): verify?
    const user = {
      id,
      tokens: {
        accessToken,
        refreshToken
      }
    };
    return done(null, user);
  };

  passport.use(
    new SpotifyStrategy(
      params,
      verifyCallback
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
    redirectToReturnTo
  );
  
  return router;
};

export default createAuthMiddleware;