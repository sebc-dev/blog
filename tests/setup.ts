import "@testing-library/jest-dom";
import { beforeAll, afterAll } from "vitest";
import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";

// Configuration globale pour les tests
beforeAll(async () => {
  // Ne faire le build que pour les tests de performance
  const isPerformanceTest = process.argv.some(
    arg => arg.includes("performance") || arg.includes("lighthouse")
  );

  if (isPerformanceTest) {
    // Nettoyer le dossier dist s'il existe
    const distPath = path.resolve(__dirname, "../dist");
    if (existsSync(distPath)) {
      rmSync(distPath, { recursive: true, force: true });
    }

    // Construire le projet pour les tests
    console.log("🔨 Building project for performance tests...");
    try {
      execSync("npm run build", { stdio: "inherit" });
      console.log("✅ Build completed successfully");
    } catch (error) {
      console.error("❌ Build failed:", error);
      throw error;
    }
  }
});

afterAll(() => {
  // Nettoyage optionnel après les tests
  console.log("🧹 Test cleanup completed");
});

// Matchers personnalisés pour les tests de performance
declare global {
  interface ViJestAssertion<T = any> {
    toBeOptimizedForLighthouse(): T;
    toHaveValidCoreWebVitals(): T;
    toBeAccessible(): T;
    toHaveSEOOptimizations(): T;
  }
}
