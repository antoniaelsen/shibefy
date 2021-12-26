/**
 * MVP 1
 * 
 * Routes
 *  - "/": redirect to spotify login page
 *  - "/callback": accepts spotify auth code
 *    - requests access, refresh tokens
 *    - make api calls to update playlist
 */

/**
 * MVP 2
 * 
 * Routes
 *  - "/": homepage; if not logged in (no valid jwt):
 *    - redirect to spotify login page
 *  - "/callback": accepts spotify auth code
 *    - requests access, refresh tokens
 *    - returns user to homepage with jwt in cookie
 */

import axios, { AxiosError } from 'axios';
import express from 'express';
import session from 'express-session';
import consolidate from "consolidate";
import passport from 'passport';
import sharp from 'sharp';
import { Strategy as SpotifyStrategy } from "passport-spotify";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
 
const SPOTIFY_API = "https://api.spotify.com/v1";
const SPOTIFY_IMAGE_SIZE = 300;
const scope = [
  "user-library-read",
  "user-read-email",
  "user-read-private",
  "playlist-modify-public",
  "playlist-modify-private",
  "ugc-image-upload"
];

const downloadImage = (url: string) => {
  return axios
    .get(url, {
      responseType: 'arraybuffer'
    })
    .then(response => Buffer.from(response.data, 'binary'));
}

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
      (_req, accessToken, refreshToken, expires_in, profile, done, ) => {
        console.log("Passport | ", profile.id, profile.displayName);
        return done(null, { ...profile, auth: { accessToken, refreshToken, expires_in } });
      }
    )
  );
};

const updatePlaylistImage = async (user, playlistId: string): Promise<string | null> => {
  const { auth, displayName, id } = user;

  console.log(`Updating playlist image for user [${id}] "${displayName}" - playlist [${playlistId}]`);

  const headers = {
    "Authorization": `Bearer ${auth.accessToken}`,
    "Content-Type": "image/jpeg"
  };

  try {
    // Request Shibe image location
    const { data } = await axios.get("http://shibe.online/api/shibes");
    const url = data[0];
    
    // Download image, convert to base 64
    let buffer = await downloadImage(url);
    buffer = await sharp(buffer).resize(SPOTIFY_IMAGE_SIZE, SPOTIFY_IMAGE_SIZE).jpeg().toBuffer();
    const image = buffer.toString("base64");
    
    // Upload image
    await axios.put( `${SPOTIFY_API}/playlists/${playlistId}/images`, image, { headers });
  
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

  const headers = {
    "Authorization": `Bearer ${auth.accessToken}`,
    "Content-Type": "application/json"
  };

  try {
    // Get user playlists
    let remaining = 1;
    let offset = 0;
    const limit = 50;
    const playlists: any = [];
    while (remaining !== 0) {
      const { data: playlistsData } = await axios.get(`${SPOTIFY_API}/users/${id}/playlists?limit=${limit}&offset=${offset}`, { headers });
      const { items, total } = playlistsData;

      playlists.push(...items);
      
      const current = offset + limit;
      remaining = total > current
        ? total - current
        : 0;
      offset += limit;
    }

    // Get recently liked tracks
    remaining = 1;
    offset = 0;
    const tracks: any = [];
    while (remaining !== 0) {
      const { data: tracksData } = await axios.get(`${SPOTIFY_API}/me/tracks?limit=${limit}&offset=${offset}`, { headers });
      const { items } = tracksData;

      tracks.push(...items.map(({ track }) => track));
      
      const current = offset + limit;
      remaining = size > current
        ? size - current
        : 0;
      offset += limit;
    }
    tracks.splice(size);

  
    // Find recently liked playlist
    let playlist = playlists.find((playlist) => playlist.name === name);
  
    // Create playlist if does not exist
    if (!playlist) {
      console.log(`Creating playlist for user [${id}] "${displayName}" - playlist [${playlist.id}] "${playlist.name}"`);
      const body = {
        name,
        description: "your recently liked bananas",
        public: true
      }
      const { data: playlistData } = await axios.post(`${SPOTIFY_API}/users/${id}/playlists`, body, { headers });
      playlist = playlistData;
    }
    
    console.log(`Updating playlist for user [${id}] "${displayName}" - playlist [${playlist.id}] "${playlist.name}"`);
    
    // Replace all items in playlist
    const uris = tracks.map(({ uri }) => uri);
    await axios.put(`${SPOTIFY_API}/playlists/${playlist.id}/tracks`, { uris }, { headers });

    // Get modified playlist
    const { data: playlistData } = await axios.get(`${SPOTIFY_API}/users/${id}/playlists/${playlist.id}`, { headers });

    // Get playlist length
    const ms = playlistData.tracks.items.reduce((acc, e) => (acc + e.track.duration_ms), 0);
    const mins = ms / 60000;
    const duration = { hrs: Math.floor(mins / 60), mins: Math.floor(mins % 60) };

    playlistData.tracks.items = playlistData.tracks.items.map((item) => {
      const { track } = item;
      const duration_s = track.duration_ms / 1000;
      const mins = Math.floor(duration_s / 60);
      const secs = Math.floor(duration_s % 60);
      const duration_str = `${mins}:${`${secs}`.padStart(2, '0')}`;
      return {
        ...item,
        track: {
          ...track,
          duration_str
        }
      };
    });

    console.log(user)
    return { ...playlistData, duration };

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
  
  // Configure login sessions
  app.use(
    session({
      secret: process.env.SECRET_SESSION,
      resave: true,
      saveUninitialized: true,
    })
  );

  configurePassport();
  app.use(passport.initialize());
  app.use(passport.session());

  // Middleware - Log
  app.use((req, _res, next) => {
    console.log('Request:', req.method, req.path);
    next();
  });

  // Route - Home
  app.get('/', (req, res) => {
    res.redirect('/auth/spotify');
    return;
    res.render('index.html', { user: req.user });
  });

  // Route - Done
  app.get('/done', async (req, res) => {
    const { user } = req;

    if (!user) {
      res.redirect('/');
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
    (_req, res) => {
      res.redirect('/done');
    }
  );

  return app;
}
 
console.log(`Launching shibefy backend (${process.env.NODE_ENV || "development"})`)
console.log(`- ID:        ${process.env.SECRET_SPOTIFY_CLIENT_ID}`)
console.log(`- Secret:    ${process.env.SECRET_SPOTIFY_CLIENT_SECRET}`)
console.log(`- Callback:  ${`${process.env.HOST}/auth/spotify/callback`}`)
 const app = createServer();
 
 console.log("Service launched, listening on port 8888");
 app.listen(process.env.PORT || 8888);
 