import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { parse } from "node-html-parser";

/**
 * Critères de performance basés sur les documents /docs
 * Lighthouse 100/100 requirements
 */

export interface PerformanceCriteria {
  // Core Web Vitals
  lcpOptimized: boolean;
  clsOptimized: boolean;
  inpOptimized: boolean;

  // Performance
  assetsOptimized: boolean;
  imagesOptimized: boolean;
  fontsOptimized: boolean;
  cssOptimized: boolean;
  jsOptimized: boolean;

  // Accessibility
  accessibilityCompliant: boolean;

  // SEO
  seoOptimized: boolean;

  // Best Practices
  bestPracticesCompliant: boolean;
}

export class LighthouseCriteriaValidator {
  private readonly distPath: string;

  constructor(distPath: string = "./dist") {
    this.distPath = distPath;
  }

  /**
   * Valide tous les critères Lighthouse 100/100
   */
  async validateAllCriteria(): Promise<PerformanceCriteria> {
    return {
      lcpOptimized: this.validateLCP(),
      clsOptimized: this.validateCLS(),
      inpOptimized: this.validateINP(),
      assetsOptimized: this.validateAssets(),
      imagesOptimized: this.validateImages(),
      fontsOptimized: this.validateFonts(),
      cssOptimized: this.validateCSS(),
      jsOptimized: this.validateJS(),
      accessibilityCompliant: this.validateAccessibility(),
      seoOptimized: this.validateSEO(),
      bestPracticesCompliant: this.validateBestPractices(),
    };
  }

  /**
   * LCP (Largest Contentful Paint) < 2.5s
   * Vérifie les optimisations critiques pour LCP
   */
  private validateLCP(): boolean {
    const htmlFiles = this.getHTMLFiles();
    let hasOptimizations = true;

    for (const file of htmlFiles) {
      const content = readFileSync(file, "utf-8");
      const doc = parse(content);

      // ✅ Vérifier preload des fonts critiques
      const fontPreloads = doc.querySelectorAll(
        'link[rel="preload"][as="font"]',
      );
      if (fontPreloads.length === 0) {
        console.warn(`❌ LCP: Missing font preload in ${file}`);
        hasOptimizations = false;
      }

      // ✅ Vérifier fetchpriority="high" pour images critiques
      const priorityImages = doc.querySelectorAll('img[fetchpriority="high"]');
      const images = doc.querySelectorAll("img");
      if (images.length > 0 && priorityImages.length === 0) {
        console.warn(
          `❌ LCP: Missing fetchpriority="high" for images in ${file}`,
        );
        hasOptimizations = false;
      }

      // ✅ Vérifier CSS inline critique
      const inlineStyles = doc.querySelectorAll("style");
      if (inlineStyles.length === 0) {
        console.warn(`❌ LCP: Missing critical CSS inline in ${file}`);
        hasOptimizations = false;
      }

      // ✅ Vérifier absence de render-blocking resources

      const blockingCSS = doc.querySelectorAll(
        'link[rel="stylesheet"]:not([media])',
      );
      if (blockingCSS.length > 2) {
        // Tolérance pour 1-2 fichiers CSS
        console.warn(`❌ LCP: Too many render-blocking CSS files in ${file}`);
        hasOptimizations = false;
      }
    }

    return hasOptimizations;
  }

  /**
   * CLS (Cumulative Layout Shift) < 0.1
   * Vérifie les optimisations pour éviter les layout shifts
   */
  private validateCLS(): boolean {
    const htmlFiles = this.getHTMLFiles();
    let hasOptimizations = true;

    for (const file of htmlFiles) {
      const content = readFileSync(file, "utf-8");
      const doc = parse(content);

      // ✅ Vérifier dimensions explicites pour images
      const images = doc.querySelectorAll("img");
      for (const img of images) {
        const width = img.getAttribute("width");
        const height = img.getAttribute("height");
        const style = img.getAttribute("style");

        if (!width || !height) {
          if (!style?.includes("aspect-ratio")) {
            console.warn(`❌ CLS: Image missing dimensions in ${file}`);
            hasOptimizations = false;
          }
        }
      }

      // ✅ Vérifier font-display: swap (CSS peut être minifié)
      const styles = doc.querySelectorAll("style");
      let hasFontDisplaySwap = false;

      for (const style of styles) {
        const styleContent = style.innerHTML;
        if (
          styleContent.includes("font-display:swap") ||
          styleContent.includes("font-display: swap")
        ) {
          hasFontDisplaySwap = true;
          break;
        }
      }

      if (!hasFontDisplaySwap && styles.length > 0) {
        console.warn(`❌ CLS: Missing font-display: swap in ${file}`);
        hasOptimizations = false;
      }

      // ✅ Vérifier size-adjust pour fonts (nouvelle propriété 2024)
      let hasSizeAdjust = false;
      for (const style of styles) {
        const styleContent = style.innerHTML;
        if (
          styleContent.includes("size-adjust:") ||
          styleContent.includes("size-adjust: ")
        ) {
          hasSizeAdjust = true;
          break;
        }
      }
      if (!hasSizeAdjust && styles.length > 0) {
        console.warn(`❌ CLS: Missing size-adjust property in ${file}`);
        hasOptimizations = false;
      }
    }
    return hasOptimizations;
  }

  /**
   * INP (Interaction to Next Paint) < 200ms
   * Vérifie les optimisations pour les interactions
   */
  private validateINP(): boolean {
    const htmlFiles = this.getHTMLFiles();
    let hasOptimizations = true;

    for (const file of htmlFiles) {
      const content = readFileSync(file, "utf-8");
      const doc = parse(content);

      // ✅ Vérifier scripts optimisés (pas de long tasks)
      const scripts = doc.querySelectorAll(
        'script:not([type="application/ld+json"])',
      );
      for (const script of scripts) {
        const scriptContent = script.innerHTML;

        // Vérifier utilisation de requestAnimationFrame
        if (
          scriptContent.includes("scroll") &&
          !scriptContent.includes("requestAnimationFrame")
        ) {
          console.warn(
            `❌ INP: Script without requestAnimationFrame optimization in ${file}`,
          );
          hasOptimizations = false;
        }

        // Vérifier utilisation de passive listeners
        if (
          scriptContent.includes("addEventListener") &&
          !scriptContent.includes("passive: true")
        ) {
          console.warn(`❌ INP: Missing passive listeners in ${file}`);
          hasOptimizations = false;
        }
      }

      // ✅ Vérifier structure DOM optimisée (< 1500 éléments)
      const allElements = doc.querySelectorAll("*");
      if (allElements.length > 1500) {
        console.warn(
          `❌ INP: DOM too complex (${allElements.length} elements) in ${file}`,
        );
        hasOptimizations = false;
      }
    }

    return hasOptimizations;
  }

  /**
   * Validation des assets (images, fonts, CSS, JS)
   */
  private validateAssets(): boolean {
    const assetsDir = join(this.distPath, "_astro");
    try {
      const stats = statSync(assetsDir);
      if (!stats.isDirectory()) {
        console.warn("❌ Assets: _astro is not a directory");
        return false;
      }
    } catch {
      console.warn("❌ Assets: _astro directory not found");
      return false;
    }
    const files = readdirSync(assetsDir);
    let totalSize = 0;

    for (const file of files) {
      const filePath = join(assetsDir, file);
      const stats = statSync(filePath);
      totalSize += stats.size;
    }

    // ✅ Vérifier taille totale des assets < 500KB
    const totalSizeKB = totalSize / 1024;
    if (totalSizeKB > 500) {
      console.warn(
        `❌ Assets: Total size too large (${totalSizeKB.toFixed(2)}KB)`,
      );
      return false;
    }

    return true;
  }

  /**
   * Validation des images optimisées
   */
  private validateImages(): boolean {
    const htmlFiles = this.getHTMLFiles();
    let hasOptimizations = true;

    for (const file of htmlFiles) {
      const content = readFileSync(file, "utf-8");
      const doc = parse(content);

      const images = doc.querySelectorAll("img");
      for (const img of images) {
        const src = img.getAttribute("src");

        // ✅ Vérifier formats modernes (WebP, AVIF)
        if (
          src &&
          !src.includes(".webp") &&
          !src.includes(".avif") &&
          !src.includes(".svg")
        ) {
          console.warn(`❌ Images: Non-optimized format in ${file}: ${src}`);
          hasOptimizations = false;
        }

        // ✅ Vérifier lazy loading pour images non-critiques
        const loading = img.getAttribute("loading");
        const priority = img.getAttribute("priority");
        const fetchpriority = img.getAttribute("fetchpriority");

        if (!priority && !fetchpriority && loading !== "lazy") {
          console.warn(`❌ Images: Missing lazy loading in ${file}`);
          hasOptimizations = false;
        }
      }
    }

    return hasOptimizations;
  }

  /**
   * Validation des fonts optimisées
   */
  private validateFonts(): boolean {
    const htmlFiles = this.getHTMLFiles();
    let hasOptimizations = true;

    for (const file of htmlFiles) {
      const content = readFileSync(file, "utf-8");
      const doc = parse(content);

      // ✅ Vérifier preload des fonts
      const fontPreloads = doc.querySelectorAll(
        'link[rel="preload"][as="font"]',
      );
      if (fontPreloads.length === 0) {
        console.warn(`❌ Fonts: Missing font preload in ${file}`);
        hasOptimizations = false;
      }

      // ✅ Vérifier crossorigin pour fonts
      for (const preload of fontPreloads) {
        const hasCrossorigin = preload.hasAttribute("crossorigin");

        if (!hasCrossorigin) {
          console.warn(`❌ Fonts: Missing crossorigin attribute in ${file}`);
          hasOptimizations = false;
        }
      }
    }

    return hasOptimizations;
  }

  /**
   * Validation CSS optimisé
   */
  private validateCSS(): boolean {
    const cssFiles = this.getCSSFiles();
    let hasOptimizations = true;

    // ✅ Vérifier qu'il y a peu de fichiers CSS (bundling)
    if (cssFiles.length > 3) {
      console.warn(`❌ CSS: Too many CSS files (${cssFiles.length})`);
      hasOptimizations = false;
    }

    // ✅ Vérifier taille des fichiers CSS
    for (const file of cssFiles) {
      const stats = statSync(file);
      const sizeKB = stats.size / 1024;

      if (sizeKB > 100) {
        console.warn(
          `❌ CSS: File too large (${sizeKB.toFixed(2)}KB): ${file}`,
        );
        hasOptimizations = false;
      }
    }

    return hasOptimizations;
  }

  /**
   * Validation JavaScript optimisé
   */
  private validateJS(): boolean {
    const jsFiles = this.getJSFiles();
    let hasOptimizations = true;

    // ✅ Vérifier JS minimal (Astro génère peu de JS)
    if (jsFiles.length > 5) {
      console.warn(`❌ JS: Too many JS files (${jsFiles.length})`);
      hasOptimizations = false;
    }

    // ✅ Vérifier taille des fichiers JS
    for (const file of jsFiles) {
      const stats = statSync(file);
      const sizeKB = stats.size / 1024;

      if (sizeKB > 50) {
        console.warn(`❌ JS: File too large (${sizeKB.toFixed(2)}KB): ${file}`);
        hasOptimizations = false;
      }
    }

    return hasOptimizations;
  }

  /**
   * Validation accessibilité
   */
  private validateAccessibility(): boolean {
    const htmlFiles = this.getHTMLFiles();
    let hasOptimizations = true;

    for (const file of htmlFiles) {
      const content = readFileSync(file, "utf-8");
      const doc = parse(content);

      // ✅ Vérifier lang attribute
      const html = doc.querySelector("html");
      if (!html?.getAttribute("lang")) {
        console.warn(`❌ A11y: Missing lang attribute in ${file}`);
        hasOptimizations = false;
      }

      // ✅ Vérifier alt text pour images
      const images = doc.querySelectorAll("img");
      for (const img of images) {
        if (!img.getAttribute("alt")) {
          console.warn(`❌ A11y: Missing alt text in ${file}`);
          hasOptimizations = false;
        }
      }

      // ✅ Vérifier structure heading
      const h1Count = doc.querySelectorAll("h1").length;

      if (h1Count !== 1) {
        console.warn(`❌ A11y: Invalid h1 count (${h1Count}) in ${file}`);
        hasOptimizations = false;
      }
    }

    return hasOptimizations;
  }

  /**
   * Validation SEO
   */
  private validateSEO(): boolean {
    const htmlFiles = this.getHTMLFiles();
    let hasOptimizations = true;

    for (const file of htmlFiles) {
      const content = readFileSync(file, "utf-8");
      const doc = parse(content);

      // ✅ Vérifier meta description
      const metaDescription = doc.querySelector('meta[name="description"]');
      if (!metaDescription) {
        console.warn(`❌ SEO: Missing meta description in ${file}`);
        hasOptimizations = false;
      }

      // ✅ Vérifier canonical URL
      const canonical = doc.querySelector('link[rel="canonical"]');
      if (!canonical) {
        console.warn(`❌ SEO: Missing canonical URL in ${file}`);
        hasOptimizations = false;
      }

      // ✅ Vérifier Open Graph
      const ogTitle = doc.querySelector('meta[property="og:title"]');
      const ogDescription = doc.querySelector(
        'meta[property="og:description"]',
      );

      if (!ogTitle || !ogDescription) {
        console.warn(`❌ SEO: Missing Open Graph tags in ${file}`);
        hasOptimizations = false;
      }

      // ✅ Vérifier JSON-LD
      const jsonLd = doc.querySelector('script[type="application/ld+json"]');
      if (!jsonLd) {
        console.warn(`❌ SEO: Missing JSON-LD structured data in ${file}`);
        hasOptimizations = false;
      }
    }

    return hasOptimizations;
  }

  /**
   * Validation best practices
   */
  private validateBestPractices(): boolean {
    const htmlFiles = this.getHTMLFiles();
    let hasOptimizations = true;

    for (const file of htmlFiles) {
      const content = readFileSync(file, "utf-8");
      const doc = parse(content);

      // ✅ Vérifier meta viewport
      const viewport = doc.querySelector('meta[name="viewport"]');
      if (!viewport) {
        console.warn(`❌ Best Practices: Missing viewport meta in ${file}`);
        hasOptimizations = false;
      }

      // ✅ Vérifier charset
      const charset = doc.querySelector("meta[charset]");
      if (!charset) {
        console.warn(`❌ Best Practices: Missing charset meta in ${file}`);
        hasOptimizations = false;
      }

      // ✅ Vérifier HTTPS (simulé via canonical)
      const canonical = doc.querySelector('link[rel="canonical"]');
      if (
        canonical &&
        !canonical.getAttribute("href")?.startsWith("https://")
      ) {
        console.warn(`❌ Best Practices: Non-HTTPS canonical URL in ${file}`);
        hasOptimizations = false;
      }
    }

    return hasOptimizations;
  }

  /**
   * Utilitaires pour récupérer les fichiers
   */
  private getHTMLFiles(): string[] {
    return this.getFilesByExtension(".html");
  }

  private getCSSFiles(): string[] {
    return this.getFilesByExtension(".css");
  }

  private getJSFiles(): string[] {
    return this.getFilesByExtension(".js");
  }

  private getFilesByExtension(extension: string): string[] {
    const files: string[] = [];

    const scanDirectory = (dir: string) => {
      const items = readdirSync(dir);

      for (const item of items) {
        const itemPath = join(dir, item);
        const stats = statSync(itemPath);

        if (stats.isDirectory()) {
          scanDirectory(itemPath);
        } else if (extname(item) === extension) {
          files.push(itemPath);
        }
      }
    };

    scanDirectory(this.distPath);
    return files;
  }
}
