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

/**
 * Blog frontmatter interface
 * 
 * Note: While dates are written as strings in the Markdown frontmatter 
 * (e.g., pubDate: 'Jul 08 2022'), they are automatically transformed 
 * into Date objects by Astro's content collection schema using z.coerce.date().
 * See src/content.config.ts for the transformation logic.
 */
interface BlogFrontmatter {
  title: string;
  description: string;
  /** Publication date - transformed from string to Date object by content schema */
  pubDate: Date;
  /** Last updated date - transformed from string to Date object by content schema */
  updatedDate?: Date;
  heroImage?: string | { src: string; alt?: string };
  tags?: string[];
}

// Types pour les collections de contenu
export interface CollectionEntry<T> {
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