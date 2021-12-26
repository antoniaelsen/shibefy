### Authentication

### Sessions

User sessions are stored with `express-sessions` in conjunction with `passport`.

Once authentication has been performed in the backend, a cookie is set -- subsequent requests will not contain credentials, rather, the user (and credentials) will be deserialized from the session.

For more information, [read the passport docs on sessions](https://www.passportjs.org/docs/configure/#sessions);