import '@testing-library/jest-dom';
import { beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';

// Configuration globale pour les tests
beforeAll(async () => {
  // Nettoyer le dossier dist s'il existe
  if (existsSync('./dist')) {
    rmSync('./dist', { recursive: true, force: true });
  }
  
  // Construire le projet pour les tests
  console.log('🔨 Building project for performance tests...');
  try {
    execSync('npm run build', { stdio: 'inherit' });    
    console.log('✅ Build completed successfully');
  } catch (error) {
    console.error('❌ Build failed:', error);
    throw error;
  }
});

afterAll(() => {
  // Nettoyage optionnel après les tests
  console.log('🧹 Test cleanup completed');
});

// Matchers personnalisés pour les tests de performance
declare global {
  namespace Vi {
    interface JestAssertion<T = any> {
      toBeOptimizedForLighthouse(): T;
      toHaveValidCoreWebVitals(): T;
      toBeAccessible(): T;
      toHaveSEOOptimizations(): T;
    }
  }
} 