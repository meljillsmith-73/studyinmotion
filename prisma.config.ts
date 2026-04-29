import 'dotenv/config'; // <-- THIS IS THE MISSING LINK
import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});