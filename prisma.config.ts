import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema-india.prisma",
  datasource: {
    url: process.env.DATABASE_URL_INDIA!,
  },
});