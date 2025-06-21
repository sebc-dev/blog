import { describe, it, expect, beforeAll } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import {
  LighthouseCriteriaValidator,
  type PerformanceCriteria,
} from "./utils/lighthouse-criteria";

/**
 * Tests de Performance Lighthouse 100/100
 * Basés sur les critères documentés dans /memory/docs/
 *
 * Ce test vérifie que le build respecte TOUS les critères nécessaires
 * pour atteindre un score Lighthouse parfait (100/100)
 */

describe("🚀 Lighthouse 100/100 Performance Tests", () => {
  let validator: LighthouseCriteriaValidator;
  let criteria: PerformanceCriteria;

  beforeAll(async () => {
    // Create absolute path for dist directory
    const distPath = path.resolve(__dirname, "../dist");
    
    // Vérifier que le build existe
    expect(existsSync(distPath)).toBe(true);

    // Initialiser le validateur
    validator = new LighthouseCriteriaValidator("./dist");

    // Exécuter toutes les validations
    criteria = await validator.validateAllCriteria();
  });

  describe("📊 Core Web Vitals Optimization", () => {
    it("should optimize for LCP (Largest Contentful Paint) < 2.5s", () => {
      expect(criteria.lcpOptimized).toBe(true);

      if (!criteria.lcpOptimized) {
        console.log(`
❌ LCP Optimization Failed
Required optimizations:
- ✅ Font preload with crossorigin
- ✅ fetchpriority="high" for critical images  
- ✅ Critical CSS inline
- ✅ Minimal render-blocking resources
- ✅ Priority attribute for hero images
        `);
      }
    });

    it("should optimize for CLS (Cumulative Layout Shift) < 0.1", () => {
      expect(criteria.clsOptimized).toBe(true);

      if (!criteria.clsOptimized) {
        console.log(`
❌ CLS Optimization Failed
Required optimizations:
- ✅ Explicit dimensions for all images
- ✅ font-display: swap for web fonts
- ✅ size-adjust property (2024 technique)
- ✅ aspect-ratio CSS property
- ✅ Reserved space for dynamic content
        `);
      }
    });

    it("should optimize for INP (Interaction to Next Paint) < 200ms", () => {
      expect(criteria.inpOptimized).toBe(true);

      if (!criteria.inpOptimized) {
        console.log(`
❌ INP Optimization Failed
Required optimizations:
- ✅ DaisyUI native components (CSS-only)
- ✅ requestAnimationFrame for scroll handlers
- ✅ Passive event listeners
- ✅ DOM complexity < 1500 elements
- ✅ scheduler.yield() for long tasks
        `);
      }
    });
  });

  describe("⚡ Performance Assets", () => {
    it("should have optimized assets bundle size", () => {
      expect(criteria.assetsOptimized).toBe(true);

      if (!criteria.assetsOptimized) {
        console.log(`
❌ Assets Optimization Failed
Requirements:
- ✅ Total assets size < 500KB
- ✅ _astro directory present
- ✅ Proper asset bundling
        `);
      }
    });

    it("should have optimized images", () => {
      expect(criteria.imagesOptimized).toBe(true);

      if (!criteria.imagesOptimized) {
        console.log(`
❌ Images Optimization Failed
Requirements:
- ✅ Modern formats (WebP, AVIF)
- ✅ Lazy loading for non-critical images
- ✅ Priority loading for critical images
- ✅ Proper alt attributes
        `);
      }
    });

    it("should have optimized fonts", () => {
      expect(criteria.fontsOptimized).toBe(true);

      if (!criteria.fontsOptimized) {
        console.log(`
❌ Fonts Optimization Failed
Requirements:
- ✅ Font preload with rel="preload"
- ✅ crossorigin attribute for fonts
- ✅ font-display: swap
- ✅ Variable fonts when possible
        `);
      }
    });

    it("should have optimized CSS", () => {
      expect(criteria.cssOptimized).toBe(true);

      if (!criteria.cssOptimized) {
        console.log(`
❌ CSS Optimization Failed
Requirements:
- ✅ Minimal CSS files (bundling)
- ✅ CSS file size < 100KB each
- ✅ Critical CSS inline
- ✅ TailwindCSS purged
        `);
      }
    });

    it("should have optimized JavaScript", () => {
      expect(criteria.jsOptimized).toBe(true);

      if (!criteria.jsOptimized) {
        console.log(`
❌ JavaScript Optimization Failed
Requirements:
- ✅ Minimal JS files (< 5 files)
- ✅ JS file size < 50KB each
- ✅ Astro static generation
- ✅ No unnecessary client-side JS
        `);
      }
    });
  });

  describe("♿ Accessibility (100/100)", () => {
    it("should be fully accessible", () => {
      expect(criteria.accessibilityCompliant).toBe(true);

      if (!criteria.accessibilityCompliant) {
        console.log(`
❌ Accessibility Failed
Requirements:
- ✅ lang attribute on html
- ✅ alt text for all images
- ✅ Proper heading structure (single h1)
- ✅ Keyboard navigation support
- ✅ ARIA labels where needed
        `);
      }
    });
  });

  describe("🔍 SEO (100/100)", () => {
    it("should be SEO optimized", () => {
      expect(criteria.seoOptimized).toBe(true);

      if (!criteria.seoOptimized) {
        console.log(`
❌ SEO Optimization Failed
Requirements:
- ✅ Meta description on all pages
- ✅ Canonical URLs
- ✅ Open Graph tags
- ✅ JSON-LD structured data
- ✅ Proper URL structure
        `);
      }
    });
  });

  describe("✅ Best Practices (100/100)", () => {
    it("should follow best practices", () => {
      expect(criteria.bestPracticesCompliant).toBe(true);

      if (!criteria.bestPracticesCompliant) {
        console.log(`
❌ Best Practices Failed
Requirements:
- ✅ Viewport meta tag
- ✅ Charset declaration
- ✅ HTTPS enforcement
- ✅ No console errors
- ✅ Security headers
        `);
      }
    });
  });

  describe("🎯 Overall Performance Summary", () => {
    it("should achieve Lighthouse 100/100 on all metrics", () => {
      expect(Object.values(criteria)).toStrictEqual(
        new Array(Object.keys(criteria).length).fill(true)
      );

      const allCriteriaMet = Object.values(criteria).every(
        criterion => criterion === true
      );

      if (!allCriteriaMet) {
        console.log(`
🎯 LIGHTHOUSE 100/100 SUMMARY
=============================

Performance Metrics:
- LCP Optimized: ${criteria.lcpOptimized ? "✅" : "❌"}
- CLS Optimized: ${criteria.clsOptimized ? "✅" : "❌"}
- INP Optimized: ${criteria.inpOptimized ? "✅" : "❌"}

Assets Optimization:
- Assets: ${criteria.assetsOptimized ? "✅" : "❌"}
- Images: ${criteria.imagesOptimized ? "✅" : "❌"}
- Fonts: ${criteria.fontsOptimized ? "✅" : "❌"}
- CSS: ${criteria.cssOptimized ? "✅" : "❌"}
- JavaScript: ${criteria.jsOptimized ? "✅" : "❌"}

Quality Scores:
- Accessibility: ${criteria.accessibilityCompliant ? "✅" : "❌"}
- SEO: ${criteria.seoOptimized ? "✅" : "❌"}
- Best Practices: ${criteria.bestPracticesCompliant ? "✅" : "❌"}

Status: ${allCriteriaMet ? "🎉 READY FOR LIGHTHOUSE 100/100" : "🔧 NEEDS OPTIMIZATION"}
        `);
      } else {
        console.log(`
🎉 LIGHTHOUSE 100/100 ACHIEVED!
===============================

Toutes les optimisations sont en place:
✅ Core Web Vitals optimisés
✅ Assets performance optimisés
✅ Accessibilité 100/100
✅ SEO 100/100
✅ Best Practices 100/100

Votre build respecte TOUS les critères documentés dans /memory/docs/
        `);
      }
    });
  });

  describe("📋 Detailed Performance Metrics", () => {
    it("should provide detailed performance insights", async () => {
      // Ce test fournit des métriques détaillées même en cas de succès
      const insights = {
        totalCriteria: Object.keys(criteria).length,
        passedCriteria: Object.values(criteria).filter(c => c === true).length,
        failedCriteria: Object.values(criteria).filter(c => c === false).length,
        successRate: Math.round(
          (Object.values(criteria).filter(c => c === true).length /
            Object.keys(criteria).length) *
            100
        ),
      };

      console.log(`
📊 PERFORMANCE INSIGHTS
=======================

Total Criteria Checked: ${insights.totalCriteria}
Passed: ${insights.passedCriteria}
Failed: ${insights.failedCriteria}
Success Rate: ${insights.successRate}%

Criteria Details:
- LCP (Largest Contentful Paint): ${criteria.lcpOptimized ? "PASS" : "FAIL"}
- CLS (Cumulative Layout Shift): ${criteria.clsOptimized ? "PASS" : "FAIL"}
- INP (Interaction to Next Paint): ${criteria.inpOptimized ? "PASS" : "FAIL"}
- Assets Optimization: ${criteria.assetsOptimized ? "PASS" : "FAIL"}
- Images Optimization: ${criteria.imagesOptimized ? "PASS" : "FAIL"}
- Fonts Optimization: ${criteria.fontsOptimized ? "PASS" : "FAIL"}
- CSS Optimization: ${criteria.cssOptimized ? "PASS" : "FAIL"}
- JavaScript Optimization: ${criteria.jsOptimized ? "PASS" : "FAIL"}
- Accessibility: ${criteria.accessibilityCompliant ? "PASS" : "FAIL"}
- SEO: ${criteria.seoOptimized ? "PASS" : "FAIL"}
- Best Practices: ${criteria.bestPracticesCompliant ? "PASS" : "FAIL"}
      `);

      // Le test passe toujours mais fournit des insights
      expect(insights.totalCriteria).toBeGreaterThan(0);
    });
  });
});
