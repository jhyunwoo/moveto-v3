import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Usage: node build-with-env.mjs <env-file> <command>");
  process.exit(1);
}

const envFile = args[0];
const command = args[1];

try {
  const envPath = resolve(process.cwd(), envFile);
  const data = readFileSync(envPath, "utf8");

  const envVars = {};
  data.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    // Handle KEY=VALUE
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();

      // Remove quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      envVars[key] = value;
    }
  });

  console.log(`Loaded environment variables from ${envFile}`);

  // Spawn the command
  const child = spawn(command, {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, ...envVars },
  });

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });
} catch (error) {
  console.error(`Error loading env file ${envFile}:`, error);
  process.exit(1);
}
