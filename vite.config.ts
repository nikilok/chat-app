/// <reference types="vitest" />
import { defineConfig, mergeConfig } from "vite";
import { defineConfig as defineVitestConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default mergeConfig(
	defineConfig({
		plugins: [react(), svgr()],
	}),
	defineVitestConfig({
		test: {
			globals: true,
			environment: "jsdom",
			setupFiles: ["./src/test/setup.ts"],
			css: true,
		},
	}),
);
