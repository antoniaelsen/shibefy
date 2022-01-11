import { NextFunction, Request, Response, Router } from 'express';
import passport from 'passport';
import { Strategy as SpotifyStrategy } from "passport-spotify";
import config from "./config";
import { URLSearchParams } from 'url';
 

const scope = [
  "user-library-read",
  "playlist-read-private",
  "playlist-modify-public",
  "playlist-modify-private",
  "ugc-image-upload"
];

const createAuthMiddleware = () => {
  const saveReturnTo = (req: Request, res: Response, next: NextFunction) => {
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

    if (!req.user) {
      return res.redirect(returnTo);
    }
    const token = req.user.auth?.accessToken;
    if (!token) {
      return res.redirect(returnTo);
    }

    const params = new URLSearchParams({ access_token: token });
    const returnParams = `${returnTo}?${params.toString()}`;
  
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