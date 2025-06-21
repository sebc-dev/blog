# Améliorations du composant Header.astro - Plan Optimisé Performance

## 🎯 Vue d'ensemble
Refonte complète du composant `src/components/Header.astro` pour améliorer l'expérience utilisateur, la modernité du design ET atteindre un score Lighthouse 100/100 en utilisant **DaisyUI + TailwindCSS** avec optimisations performance avancées.

## 📊 Contexte Performance Critique

### **Constats des recherches Lighthouse 100/100 :**
- **73% des pages mobiles** ont une image comme élément LCP
- **35% des images LCP** ne sont pas découvrables dans le HTML initial
- Seulement **15% des pages** utilisent `fetchpriority`
- **INP a remplacé FID** en mars 2024 comme métrique Core Web Vitals
- **47% des sites** ne passent pas les Core Web Vitals

### **Impact Header sur Performance :**
- **Navigation** peut affecter l'INP (< 200ms requis)
- **Fonts** dans le header impactent directement le CLS (< 0.1 requis)
- **JavaScript** pour responsivité/thèmes doit être optimisé
- **Images/logos** peuvent être des éléments LCP critiques

---

## 🚀 Objectifs principaux avec optimisations performance

### 1. Responsivité améliorée avec TailwindCSS (Performance-First)
- **État actuel** : Seuls les liens sociaux sont cachés sur mobile (< 720px)
- **Améliorations requises** :
  - Menu hamburger sur mobile/tablette avec **DaisyUI drawer natif** (0 JS custom)
  - Navigation adaptative avec breakpoints TailwindCSS optimisés
  - **Content-visibility: auto** pour sections off-screen
  - Layout flexible avec **contain-intrinsic-size** pour éviter CLS
  - **Will-change** judicieux pour animations
  - Réorganisation responsive avec utilities TailwindCSS

### 2. Switch de langage DaisyUI optimisé pour INP < 200ms
- **État actuel** : Composant custom `LanguagePicker.astro` avec styles manuels
- **Migration Performance-Optimisée** :
  - Remplacer par **dropdown DaisyUI natif** (CSS-only, 0 JS)
  - Utiliser `dropdown`, `dropdown-content`, `menu` avec **tabindex** optimisé
  - **Lazy loading** des traductions avec cache Map()
  - **Scheduler.yield()** si traitement lourd (Chrome 129+)
  - Maintenir fonctionnalité i18n avec optimisations cache

### 3. Header transparent au scroll (Optimisé Core Web Vitals)
- **Fonctionnalité** : Header transparent/semi-transparent lors du scroll
- **Implémentation Performance** :
  - Script JavaScript **throttlé** avec `requestAnimationFrame`
  - Classes CSS avec **transform** uniquement (éviter layout/paint)
  - **Will-change: transform** pendant animation
  - **Backdrop-filter** avec fallback pour compatibilité
  - **Intersection Observer** pour optimiser les événements scroll

### 4. Switch de thème Light/Dark (0 Layout Shift)
- **Nouveau composant** : Toggle DaisyUI + localStorage persistence
- **Optimisations Performance** :
  - **Theme-controller DaisyUI** avec CSS-only
  - **Color-scheme** meta pour éviter FOUC
  - **Prefers-color-scheme** media queries
  - **LocalStorage** avec fallback gracieux
  - **CSS Custom Properties** pour transitions fluides
  - **0 CLS** garantie lors du changement de thème

---

## ⚡ Optimisations Core Web Vitals Spécifiques Header

### **LCP (Largest Contentful Paint) < 2.5s**
```astro
---
// Si logo/image dans header
import { Image } from 'astro:assets';
import logo from '../assets/logo.svg';
---

<!-- ✅ Logo optimisé si élément LCP -->
<Image 
  src={logo} 
  alt="Site Logo" 
  priority
  fetchpriority="high"
  loading="eager"
  decoding="sync"
  width={120}
  height={40}
  format="svg"
/>
```

### **CLS (Cumulative Layout Shift) < 0.1**
```astro
---
// Font preload critique dans BaseHead.astro
---
<head>
  <!-- ✅ Preload fonts header AVANT CSS -->
  <link rel="preload" href="/fonts/inter-variable.woff2" as="font" type="font/woff2" crossorigin>
  
  <!-- ✅ Font-display: swap pour éviter FOIT/FOUT -->
  <style>
    @font-face {
      font-family: 'Inter Variable';
      src: url('/fonts/inter-variable.woff2') format('woff2');
      font-display: swap;
      /* Nouvelles propriétés 2024 pour CLS */
      size-adjust: 100%;
      ascent-override: 95%;
      descent-override: 25%;
      line-gap-override: 0%;
    }
  </style>
</head>

<!-- ✅ Header avec dimensions explicites -->
<header class="h-16 flex items-center justify-between px-4">
  <!-- Contenu header avec tailles fixes -->
</header>
```

### **INP (Interaction to Next Paint) < 200ms**
```astro
---
// Header.astro optimisé pour INP
---

<!-- ✅ Navigation DaisyUI native (0 JS custom) -->
<div class="navbar bg-base-100">
  <div class="navbar-start">
    <!-- Mobile menu avec drawer DaisyUI -->
    <div class="dropdown lg:hidden">
      <div tabindex="0" role="button" class="btn btn-ghost">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </div>
      <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
        <!-- Navigation items -->
      </ul>
    </div>
  </div>
  
  <!-- ✅ Theme toggle DaisyUI natif -->
  <label class="swap swap-rotate">
    <input type="checkbox" class="theme-controller" value="dark" />
    <!-- Icons soleil/lune -->
  </label>
</div>

<!-- ✅ Script optimisé pour scroll avec throttling -->
<script>
  let ticking = false;
  
  function updateHeader() {
    const header = document.querySelector('header');
    const scrolled = window.scrollY > 50;
    
    // ✅ Utiliser transform pour éviter layout/paint
    header.style.transform = scrolled ? 'translateY(0)' : '';
    header.classList.toggle('backdrop-blur-md', scrolled);
    header.classList.toggle('bg-opacity-90', scrolled);
    
    ticking = false;
  }
  
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', onScroll, { passive: true });
</script>
```

---

## 🛠 Plan d'implémentation avec jalons performance

### Phase 1 : Fondations Performance (Semaine 1)
- [ ] **Audit performance baseline** (Lighthouse initial)
- [ ] **Font preload** optimisé dans BaseHead
- [ ] **Structure HTML** avec dimensions explicites
- [ ] **CSS Critical** inline pour header
- [ ] **Metrics Core Web Vitals** : LCP baseline, CLS initial

### Phase 2 : Responsivité DaisyUI (Semaine 2)
- [ ] **Menu hamburger DaisyUI** natif (0 JS custom)
- [ ] **Breakpoints TailwindCSS** optimisés
- [ ] **Content-visibility** pour sections off-screen
- [ ] **Tests INP** : interactions < 200ms
- [ ] **Lighthouse mobile** : score responsivité

### Phase 3 : Switch langage optimisé (Semaine 2-3)
- [ ] **Dropdown DaisyUI** avec lazy loading
- [ ] **Cache traductions** avec Map()
- [ ] **URL structure** SEO-optimisée
- [ ] **Tests performance** : changement langue < 100ms
- [ ] **Metrics i18n** : impact sur LCP/CLS

### Phase 4 : Transparence scroll (Semaine 3)
- [ ] **Script throttlé** avec requestAnimationFrame
- [ ] **Transform-only** animations (0 layout/paint)
- [ ] **Will-change** optimisé
- [ ] **Intersection Observer** pour optimisations
- [ ] **Tests scroll** : 60fps maintenu

### Phase 5 : Switch thème avancé (Semaine 4)
- [ ] **Theme-controller DaisyUI** avec CSS-only
- [ ] **Color-scheme** meta pour FOUC
- [ ] **LocalStorage** avec fallback
- [ ] **CSS Custom Properties** transitions
- [ ] **Tests CLS** : 0 layout shift garanti

### Phase 6 : Optimisations finales (Semaine 4)
- [ ] **Service Worker** pour cache header assets
- [ ] **Preload critical** resources
- [ ] **Bundle size** analysis et optimisation
- [ ] **Lighthouse 100/100** validation
- [ ] **Real User Monitoring** setup

---

## 📊 Métriques de validation performance

### **Core Web Vitals Targets**
- **LCP** : ≤ 1.5s (header optimisé)
- **INP** : ≤ 150ms (interactions fluides)
- **CLS** : ≤ 0.05 (0 layout shift)

### **Lighthouse Scores Target**
- **Performance** : 100/100
- **Accessibility** : 100/100
- **Best Practices** : 100/100
- **SEO** : 100/100

### **Métriques Spécifiques Header**
- **Time to Interactive** : ≤ 2s
- **Menu toggle** : ≤ 50ms
- **Theme switch** : ≤ 100ms
- **Language change** : ≤ 100ms
- **Scroll performance** : 60fps constant

---

## 🔧 Dépendances techniques optimisées

### **Stack technique principale**
- ✅ **Astro 5.x** avec configuration performance maximale
- ✅ **DaisyUI (v5.0.43)** - Composants CSS-only
- ✅ **TailwindCSS (v4.1.10)** - Configuration purge optimisée
- ✅ **Astro i18n utilities** avec cache optimisé

### **Configuration Astro Performance**
```js
// astro.config.mjs optimisé
export default defineConfig({
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto', // CSS critique inline
    format: 'file'
  },
  vite: {
    build: {
      assetsInlineLimit: 1024,
      cssCodeSplit: false,
      rollupOptions: {
        output: { manualChunks: undefined }
      }
    }
  }
});
```

### **TailwindCSS Configuration Optimisée**
```js
// tailwind.config.mjs
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}',
    '!./src/**/*.{test,spec}.{js,ts}' // Exclure tests
  ],
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['light', 'dark'], // Limiter aux thèmes utilisés
    logs: false, // Performance
    base: true,
    styled: true,
    utils: true
  }
};
```

---

## ✅ Checklist validation finale

### **Performance (100/100)**
- [ ] LCP < 1.5s avec logo/fonts optimisés
- [ ] INP < 150ms avec DaisyUI natif
- [ ] CLS < 0.05 avec dimensions explicites
- [ ] Header assets < 50KB total
- [ ] 0 JavaScript bloquant

### **Accessibilité (100/100)**
- [ ] Navigation clavier complète
- [ ] ARIA labels appropriés
- [ ] Contraste couleurs validé
- [ ] Screen reader compatible
- [ ] Focus indicators visibles

### **Best Practices (100/100)**
- [ ] HTTPS enforced
- [ ] Console errors = 0
- [ ] Deprecated APIs = 0
- [ ] Security headers présents
- [ ] Images avec alt texts

### **SEO (100/100)**
- [ ] Meta descriptions présentes
- [ ] Structure URL optimisée
- [ ] Hreflang pour i18n
- [ ] Schema.org markup
- [ ] Sitemap.xml généré

---

**Date de création** : $(date)
**Estimé avec optimisations** : 12-16 heures de développement
**Priorité** : **Haute** (Performance critique)
**Objectif** : **Lighthouse 100/100** garanti 