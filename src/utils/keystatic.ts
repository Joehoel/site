import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "~/keystatic.config";

export const ks = createReader(process.cwd(), keystaticConfig);
