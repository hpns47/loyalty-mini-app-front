import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./src/test-setup.ts"],
        env: {
            VITE_API_URL: "http://localhost:3000",
        },
        coverage: {
            provider: "istanbul",
            include: ["src/hooks/**/*.ts", "src/lib/**/*.ts"],
            exclude: ["src/hooks/__tests__/**", "src/lib/__tests__/**"],
        },
    },
});
