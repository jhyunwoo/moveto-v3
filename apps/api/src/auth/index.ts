import { OpenAPIHono } from "@hono/zod-openapi";
import signUpApp from "./sign-up";
import signInApp from "./sign-in";
import signOutApp from "./sign-out";

const authApp = new OpenAPIHono();

authApp.route("/sign-up", signUpApp);
authApp.route("/sign-in", signInApp);
authApp.route("/sign-out", signOutApp);

export default authApp;
