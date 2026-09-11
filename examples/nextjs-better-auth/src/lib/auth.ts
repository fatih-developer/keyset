// Fixture only: credentials are supplied through environment variables.
export const auth = { socialProviders: { google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET } } };
