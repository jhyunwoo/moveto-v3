import { OpenAPIHono } from "@hono/zod-openapi";
import signUpApp from "./sign-up";
import signInApp from "./sign-in";
import signOutApp from "./sign-out";

const authApp = new OpenAPIHono();

const app = authApp
  .route("/sign-up", signUpApp)
  .route("/sign-in", signInApp)
  .route("/sign-out", signOutApp);

export default app;
