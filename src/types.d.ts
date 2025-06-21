/// <reference types="astro/client" />

// Types for image assets
declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

// Types pour le contenu du blog
interface BlogFrontmatter {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  heroImage?: string | { src: string; alt?: string };
  tags?: string[];
}

// Types pour les collections de contenu
interface CollectionEntry<T> {
  id: string;
  slug: string;
  body: string;
  collection: string;
  data: T;
}

// Types globaux pour l'environnement
declare namespace App {
  // interface Locals {}
  // interface PageData {}
  // interface Platform {}
}