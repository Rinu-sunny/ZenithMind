import path from "path";
import { fileURLToPath } from "url";

/** @type {import('next').NextConfig} */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  // Pin the workspace root for Turbopack so it stops picking the parent folder's lockfile
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
