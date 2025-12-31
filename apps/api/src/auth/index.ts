import { OpenAPIHono } from "@hono/zod-openapi";
import signUpApp from "./signUp";
import signInApp from "./signIn";
import signOutApp from "./signOut";
import meApp from "./me";

const authApp = new OpenAPIHono();

const app = authApp
  .route("/signUp", signUpApp)
  .route("/signIn", signInApp)
  .route("/signOut", signOutApp)
  .route("/me", meApp);

export default app;
