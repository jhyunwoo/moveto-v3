import { OpenAPIHono } from "@hono/zod-openapi";
import signUpApp from "./sign-up";
import signInApp from "./sign-in";

const authApp = new OpenAPIHono();

authApp.route("/sign-up", signUpApp);
authApp.route("/sign-in", signInApp);

export default authApp;
