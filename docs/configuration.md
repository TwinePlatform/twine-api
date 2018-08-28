# Configuration

All application configuration is stored in the `/config` directory located in the project root.

Secrets and configuration variables that are likely to change between deployment environments are stored in a `.env` file. This file should NOT be checked into source control.

Default configuration variables are stored in `config.defaults.js`. Configuration parameters specific to `development`, `testing` and `production` environments are stored in `config.development.js`, `config.testing.js` and `config.production.js` respectively.

To create a project configuration, create the `.env` in the config directory. Populate it with `=`-separated key-value pairs. Ensure at least the following parameters are provided:

```
# Used to sign JWTs for session authentication
JWT_SECRET=...

# Postgres connection strings for postgres server in various environments
# DATABASE_URL is used in production, the others are suffixed with their environments
DATABASE_URL=...
DATABASE_URL_DEVELOPMENT=...
DATABASE_URL_TESTING=...

# Postmark API key for various environments
# Postmark is the service used to send e-mails
# NOTE: Use "POSTMARK_API_TEST" as the API key in the "test" environment, this will prevent sending
#       emails when not in production. You may want a real API key in the "dev" environment to allow
#       manual testing
#       See https://github.com/TwinePlatform/twine-visitor/issues/240
POSTMARK_KEY_DEVELOPMENT=...
POSTMARK_KEY_TESTING=...
POSTMARK_KEY_PRODUCTION=...

#JWT secret for signing cookies
JWT_SECRET_DEVELOPMENT=...
JWT_SECRET_TESTING=...
JWT_SECRET_PRODUCTION=...

# Used to sign QR codes for visitor authentication
QRCODE_HMAC_SECRET=...
```
