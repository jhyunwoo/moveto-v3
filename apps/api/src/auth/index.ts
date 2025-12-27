import { OpenAPIHono } from "@hono/zod-openapi";
import signUpApp from "./sign-up";

const authApp = new OpenAPIHono();

authApp.route("/sign-up", signUpApp);

export default authApp;
