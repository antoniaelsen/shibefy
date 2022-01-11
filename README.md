# About

Create or update a playlist with your <n> most recently liked tracks. Add some flavor.


## Design

The frontend is a (CRA) React app leveraging MUI (and emotion).
The FE router routes between two pages: `/login` and `/` (the playlist page).
Authentication is handled by the AuthProvider.

The backend is an express server leveraging passport for authentication. It serves the built CRA as well.
It runs as http for staging / prod, https locally (heroku terminates ssl).

The frontend redirects the user to the backend to perform auth via spotify.

KISS.

All environment variables are stored in .env files, with the exception of secrets, which are stored in heroku's config store.


## TODO

Backend  

- [ ] tests
- [ ] remove sessions
- [ ] handle auth failure
- [ ] update TS config, disallow implicit any


Frontend  

- [ ] tests
- [ ] add ko-fi to playlist page, I guess
- [ ] add a favicon
- [ ] responsiveness: shrink # column, remove track album image within xs
- [ ] add border radius to playlist track (table row)
- [ ] add white text on track hover
- [ ] TS cleanup
