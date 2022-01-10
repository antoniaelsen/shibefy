import { CookieOptions, NextFunction, Request, Response, Router } from 'express';
import passport from 'passport';
import { Strategy as SpotifyStrategy } from "passport-spotify";
import { logger } from "./util/logger";
import config from "./config";
import { URLSearchParams } from 'url';
 

const scope = [
  "user-library-read",
  "user-read-email",
  "user-read-private",
  "playlist-modify-public",
  "playlist-modify-private",
  "ugc-image-upload"
];

const createAuthMiddleware = () => {
  const cookieParams: CookieOptions = {
    // domain:,
    httpOnly: true,
    // maxAge:,
    // path:,
    sameSite: "lax",
    // secure: true,
  };

  const saveReturnTo = (req: Request, res: Response, next: NextFunction) => {
    logger.info(`Saving returnTo: ${req.query?.returnTo}`)
    if (req.query && req.query.returnTo) {
      const url = (req.query.returnTo as string);
      const returnTo = url.endsWith('/') ? url.slice(0, -1) : url;
      (req as any).session.returnTo = returnTo;
    }
    return next();
  };
 
  const redirectWithToken = (req, res) => {
    const defaultUrl = `https://${config.redirectDomain}`;
    const returnTo = (req as any).session.returnTo || defaultUrl;

    // TODO(aelsen): implement token
    logger.info(`Redirect with token...`);
    logger.info(`- returnTo: ${returnTo}`);
    logger.info(`- user: ${JSON.stringify(req.user, null, 2)}`);
    logger.info(`- account: ${JSON.stringify(req.user.auth, null, 2)}`);

    if (!req.user) {
      logger.info(`NO USER`);
      return res.redirect(returnTo);
    }
    const token = req.user.auth?.accessToken;
    if (!token) {
      logger.info(`NO TOKEN`);
      return res.redirect(returnTo);
    }

    const params = new URLSearchParams({ access_token: token });
    const returnParams = `${returnTo}?${params.toString()}`;
    logger.info(`- returnTo with params: ${returnParams}`)
  
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
      (req, accessToken, refreshToken, expires_in, profile, done, ) => {
        logger.info(`GOT PROFILE ${JSON.stringify(profile)}`);
        return done(null, { ...profile, auth: { accessToken, refreshToken, expires_in } });
      }
    )
  );

  const authenticate = passport.authenticate('spotify', { scope });

  const router = Router();

  router.get(
    '/spotify',
    saveReturnTo,
    authenticate,
  );

  // TODO(aelsen): failure redirect
  router.get(
    '/spotify/callback',
    authenticate,
    redirectWithToken
  );
  
  return router;
};

export default createAuthMiddleware;