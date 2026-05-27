import { Gateway, Header } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { secret } from "encore.dev/config";
import { APIError } from "encore.dev/api";

const adminBearerToken = secret("ZyntricAdminBearerToken");

interface AuthParams {
  authorization: Header<"Authorization">;
}

interface AuthData {
  userID: string;
  role: "admin";
}

export const auth = authHandler<AuthParams, AuthData>(async ({ authorization }) => {
  const [scheme, token] = authorization.split(" ", 2);

  if (scheme !== "Bearer" || !token) {
    throw APIError.unauthenticated("missing bearer token");
  }

  if (token !== adminBearerToken()) {
    throw APIError.unauthenticated("invalid admin bearer token");
  }

  return {
    userID: "catalogue-admin",
    role: "admin",
  };
});

export const gateway = new Gateway({
  authHandler: auth,
});
