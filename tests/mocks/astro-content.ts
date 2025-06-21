// Mock pour astro:content
import { z } from 'zod';

// Mock de la fonction defineCollection
export function defineCollection<T extends Record<string, any>>(config: {
  loader?: any;
  schema?: any;
}) {
  return config;
}

// Configuration interface for mock data
interface MockCollectionConfig {
  [collectionName: string]: any[];
}

// Global mock data storage
let mockCollectionData: MockCollectionConfig = {};

// Helper function to set custom mock data for tests
export function setMockCollectionData(config: MockCollectionConfig) {
  mockCollectionData = { ...config };
}

// Helper function to reset mock data to defaults
export function resetMockCollectionData() {
  mockCollectionData = {};
}

// Default mock data sets
const defaultMockData: MockCollectionConfig = {
  blog: [
    {
      id: 'first-post',
      slug: 'first-post',
      body: 'Mock post content',
      collection: 'blog',
      data: {
        title: 'First Post',
        description: 'A mock blog post',
        pubDate: new Date('2024-01-15'),
        updatedDate: new Date('2024-01-16'),
        tags: ['test', 'mock']
      }
    },
    {
      id: 'fr/premier-article',
      slug: 'fr/premier-article',
      body: 'Contenu de test en français',
      collection: 'blog',
      data: {
        title: 'Premier Article',
        description: 'Un article de blog de test',
        pubDate: new Date('2024-01-15'),
        updatedDate: new Date('2024-01-16'),
        tags: ['test', 'français']
      }
    },
    {
      id: 'second-post',
      slug: 'second-post',
      body: 'Another mock post content',
      collection: 'blog',
      data: {
        title: 'Second Post',
        description: 'Another mock blog post',
        pubDate: new Date('2024-01-20'),
        updatedDate: new Date('2024-01-21'),
        tags: ['test', 'example']
      }
    }
  ],
  docs: [
    {
      id: 'getting-started',
      slug: 'getting-started',
      body: 'Documentation content',
      collection: 'docs',
      data: {
        title: 'Getting Started',
        description: 'How to get started',
        pubDate: new Date('2024-01-10'),
        category: 'guide'
      }
    }
  ]
};

// Enhanced getCollection function with filtering support
export async function getCollection(
  collection: string,
  filter?: (entry: any) => boolean
) {
  // Use custom mock data if available, otherwise fall back to defaults
  const collectionData = mockCollectionData[collection] || defaultMockData[collection] || [];
  
  // Apply filter if provided
  if (filter && typeof filter === 'function') {
    return collectionData.filter(filter);
  }
  
  return collectionData;
}

// Overloaded version for more specific filtering
export async function getCollectionWithOptions(
  collection: string,
  options: {
    filter?: (entry: any) => boolean;
    sort?: (a: any, b: any) => number;
    limit?: number;
    lang?: string;
  } = {}
) {
  let data = await getCollection(collection, options.filter);
  
  // Language filtering
  if (options.lang) {
    data = data.filter(entry => {
      if (options.lang === 'fr') {
        return entry.id.startsWith('fr/') || entry.slug.startsWith('fr/');
      } else {
        return !entry.id.startsWith('fr/') && !entry.slug.startsWith('fr/');
      }
    });
  }
  
  // Sorting
  if (options.sort) {
    data = data.sort(options.sort);
  }
  
  // Limiting
  if (options.limit && options.limit > 0) {
    data = data.slice(0, options.limit);
  }
  
  return data;
}

// Mock de render
export async function render(entry: any) {
  // Simulate more realistic Astro render output
  const mockHeadings = [
    { depth: 1, slug: 'introduction', text: 'Introduction' },
    { depth: 2, slug: 'getting-started', text: 'Getting Started' },
    { depth: 2, slug: 'conclusion', text: 'Conclusion' }
  ];

  const mockContent = `
    <h1 id="introduction">Introduction</h1>
    <p>This is a mock rendered content for ${entry?.data?.title || 'Untitled'}.</p>
    ${entry?.data?.description ? `<p><em>${entry.data.description}</em></p>` : ''}
    <h2 id="getting-started">Getting Started</h2>
    <p>${entry?.body || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}</p>
    <h2 id="conclusion">Conclusion</h2>
    <p>This concludes our mock content for "${entry?.data?.title || 'this post'}".</p>
  `;

  return {
    Content: function MockContent(props: any = {}) {
      // Simulate Astro component behavior
      if (typeof props.children === 'function') {
        return props.children();
      }
      return mockContent;
    },
    headings: mockHeadings,
    remarkPluginFrontmatter: {
      readingTime: 2,
      wordCount: 45
    },
    compiledContent: () => mockContent,
    rawContent: () => entry?.body || 'Mock raw content',
    file: entry?.id ? `src/content/blog/${entry.id}.md` : 'mock-file.md',
    url: entry?.slug ? `/blog/${entry.slug}` : '/blog/mock-post'
  };
}

// Mock de glob loader
export function glob(options: any) {
  return {
    type: 'glob',
    options
  };
}

// Type mock
export type CollectionEntry<T extends string> = {
  id: string;
  slug: string;
  body: string;
  collection: T;
  data: any;
};

// Export z from zod for schema definitions
export { z }; 