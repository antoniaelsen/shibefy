import axios from 'axios';
import express from 'express';
import session from 'express-session';
import consolidate from "consolidate";
import passport from 'passport';
import sharp from 'sharp';
import { Strategy as SpotifyStrategy } from "passport-spotify";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { downloadImage } from './util';
import {
  createPlaylist,
  getPlaylist,
  getPlaylistDuration,
  getPlaylists,
  getRecentlyLikedTracks,
  getTrackDuration,
  replacePlaylistTracks,
  putPlaylistImage
} from './util/spotify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
 
const SPOTIFY_IMAGE_SIZE = 300;
const scope = [
  "user-library-read",
  "user-read-email",
  "user-read-private",
  "playlist-modify-public",
  "playlist-modify-private",
  "ugc-image-upload"
];

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

  passport.use(
    new SpotifyStrategy(
      {
        clientID: process.env.SECRET_SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SECRET_SPOTIFY_CLIENT_SECRET,
        callbackURL: `${process.env.HOST}/auth/spotify/callback`,
        passReqToCallback: true
      },
      (req, accessToken, refreshToken, expires_in, profile, done, ) => {
        return done(null, { ...profile, auth: { accessToken, refreshToken, expires_in } });
      }
    )
  );
};



const updatePlaylistImage = async (user, playlistId: string): Promise<string | null> => {
  const { auth, displayName, id } = user;

  console.log(`Updating playlist image for user [${id}] "${displayName}" - playlist [${playlistId}]`);


  try {
    // Request Shibe image location
    const { data } = await axios.get("http://shibe.online/api/shibes");
    const url = data[0];
    
    // Download image, convert to base 64
    let buffer = await downloadImage(url);
    buffer = await sharp(buffer).resize(SPOTIFY_IMAGE_SIZE, SPOTIFY_IMAGE_SIZE).jpeg().toBuffer();
    const image: string = buffer.toString("base64");
    
    // Upload image
    await putPlaylistImage(auth.accessToken, playlistId, image);
  
    return image;
  } catch (e: any) {
    let msg = e;
    if (e.response) {
      const { data, status, statusText } = e.response;
      msg = `${status}: "${statusText}" ${data}`;
    }
    console.log(`Failed to update playlist image for user "${displayName}" [${id}] -`, msg);
    return null;
  }
}

const updatePlaylist = async (user, options) => {
  const { auth, displayName, id } = user;
  const { name, size } = options;
  const { accessToken } = auth;

  try {
    const playlists = await getPlaylists(accessToken, id);
    const tracks = await getRecentlyLikedTracks(accessToken, size);
    let playlist = playlists.find((playlist) => playlist.name === name);
  
    if (!playlist) {
      console.log(`Creating playlist for user [${id}] "${displayName}" - playlist [${playlist.id}] "${playlist.name}"`);
      playlist = await createPlaylist(accessToken, id, name);
    }
    
    console.log(`Updating playlist for user [${id}] "${displayName}" - playlist [${playlist.id}] "${playlist.name}"`);
    await replacePlaylistTracks(accessToken, playlist.id, tracks.map(({ uri }) => uri));

    playlist = await getPlaylist(accessToken, id, playlist.id);

    const duration = getPlaylistDuration(playlist);

    playlist.tracks.items = playlist.tracks.items.map((item) => {
      const { track } = item;
      const duration = getTrackDuration(track);
      return {
        ...item,
        track: {
          ...track,
          duration
        }
      };
    });

    return { ...playlist, duration };

  } catch (e: any) {
    let msg = e;
    if (e.response) {
      const { data, status, statusText } = e.response;
      msg = `${status}: "${statusText}" ${data}`;
    }
    console.log(`Failed to update user "${displayName}" [${id}] spotify - ${msg}`);
    return null;
  }
};

const createServer = () => {
  const app = express();
  
  // Configure express to serve .html in /views
  app.set('views', __dirname + '/public/html');
  app.set('view engine', 'html');
  app.use(express.static(__dirname));
  app.engine('html', consolidate.nunjucks);
  
  // Configure user sessions
  app.use(
    session({
      secret: process.env.SECRET_SESSION,
      resave: true,
      saveUninitialized: true,
    })
  );

  // Configure passport - auth
  configurePassport();
  app.use(passport.initialize());
  app.use(passport.session());

  // Middleware - Log
  app.use((req, res, next) => {
    next();
  });

  // Route - Home
  app.get('/', async (req, res) => {
    const { user } = req;
    
    if (!user) {
      res.render('index.html', { user: req.user });
      return;
    };
  
    const playlist = await updatePlaylist(user, { name: "recently liked tracks", size: 100 });
    const img = await updatePlaylistImage(user, playlist.id);
  
    res.render('done.html', { img: `data:image/png;base64,${img}`, playlist, user });
  });

  // Route - Spotify Login Page Redirect
  //  Redirects user to Spotify login page
  app.get(
    '/auth/spotify',
    passport.authenticate('spotify', {
      scope,
      // showDialog: true
    }),
  );
  
  // Route - Spotify Login Code Redirect
  //  Processes code sent by Spotify login page,
  //  requests access, refresh token, etc.
  app.get(
    '/auth/spotify/callback',
    passport.authenticate('spotify', { failureRedirect: '/fail' }),
    (req, res) => {
      res.redirect('/');
    }
  );

  return app;
}
 
console.log(`Launching shibefy backend (${process.env.NODE_ENV || "development"})`);

 const app = createServer();
 const port = process.env.PORT || 8888;
 
 console.log("Service launched, listening on port", port);
 app.listen(port);
 