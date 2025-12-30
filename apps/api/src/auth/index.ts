import { OpenAPIHono } from "@hono/zod-openapi";
import signUpApp from "./signUp";
import signInApp from "./signIn";
import signOutApp from "./signOut";

const authApp = new OpenAPIHono();

const app = authApp
  .route("/signUp", signUpApp)
  .route("/signIn", signInApp)
  .route("/signOut", signOutApp);

export default app;
