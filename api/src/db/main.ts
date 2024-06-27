import { process } from "@/deps.ts";
import { migrate } from "./index.ts";

migrate(process.env.APP_POSTGRES_URL);
