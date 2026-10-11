import { createRemoteJWKSet, jwtVerify } from "jose";

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);

const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

export type GoogleIdentity = {
  sub: string;
  email: string;
  name: string | null;
  iat: number | null;
};

export async function verifyGoogleCredential(
  credential: string,
  clientId: string,
): Promise<GoogleIdentity> {
  const { payload } = await jwtVerify(credential, GOOGLE_JWKS, {
    issuer: GOOGLE_ISSUERS,
    audience: clientId,
  });

  if (typeof payload.sub !== "string" || !payload.sub) {
    throw new Error("Google credential is missing the subject claim");
  }

  if (typeof payload.email !== "string" || !payload.email) {
    throw new Error("Google credential is missing the email claim");
  }

  if (payload.email_verified !== true) {
    throw new Error("Google email is not verified");
  }

  return {
    sub: payload.sub,
    email: payload.email.toLowerCase(),
    name: typeof payload.name === "string" ? payload.name : null,
    iat: typeof payload.iat === "number" ? payload.iat : null,
  };
}
