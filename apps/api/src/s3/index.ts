import { OpenAPIHono } from "@hono/zod-openapi";
import Env from "../../lib/env";
import multipartApp from "./multipart";

const app = new OpenAPIHono<Env>();

app.route("/multipart", multipartApp);

export default app;
