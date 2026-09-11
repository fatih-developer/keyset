// Fixture only: credentials are supplied through environment variables.
export const providers = [{ id: "google", clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET }];
