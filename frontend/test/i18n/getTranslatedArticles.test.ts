import { describe, expect, it, beforeEach, vi } from 'vitest';
import { type CollectionEntry } from 'astro:content';

// Mock astro:content avec une factory function pour éviter le hoisting
vi.mock('astro:content', () => {
  return {
    getCollection: vi.fn(),
  };
});

// Import après le mock
import { getTranslatedArticles } from '../../src/lib/i18n/i18nUtils.ts';
import { getCollection } from 'astro:content';

// Cast du mock pour avoir les bonnes typings
const mockGetCollection = getCollection as ReturnType<typeof vi.fn>;

// Helper pour créer des posts de test
const createMockBlogPost = (
  overrides: Partial<CollectionEntry<'blog'>['data']> & { slug?: string } = {}
): CollectionEntry<'blog'> => {
  const { slug = 'default-slug', ...dataOverrides } = overrides;

  return {
    data: {
      lang: 'en',
      title: 'Default Title',
      ...dataOverrides,
    },
    slug,
    id: slug,
    collection: 'blog',
    render: async () => ({ Content: () => null, headings: [], remarkPluginFrontmatter: {} }),
  } as CollectionEntry<'blog'>;
};

describe('getTranslatedArticles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devrait retourner un tableau vide si le post n'a pas de translationId", async () => {
    const currentPost = createMockBlogPost({ lang: 'fr' });

    const result = await getTranslatedArticles(currentPost);

    expect(result).toEqual([]);
    expect(mockGetCollection).not.toHaveBeenCalled();
  });

  it("devrait retourner un tableau vide si aucune traduction n'est trouvée", async () => {
    const currentPost = createMockBlogPost({
      translationId: 'unique-id-1',
      lang: 'fr',
      slug: 'article-francais'
    });

    mockGetCollection.mockResolvedValue([currentPost]);

    const result = await getTranslatedArticles(currentPost);

    expect(result).toEqual([]);
    expect(mockGetCollection).toHaveBeenCalledWith('blog');
  });

  it('devrait retourner les traductions trouvées', async () => {
    const currentPost = createMockBlogPost({
      translationId: 'unique-id-2',
      lang: 'fr',
      title: 'Article en français',
      slug: 'article-francais'
    });

    const englishTranslation = createMockBlogPost({
      translationId: 'unique-id-2',
      lang: 'en',
      title: 'Article in English',
      slug: 'english-article'
    });

    mockGetCollection.mockResolvedValue([currentPost, englishTranslation]);

    const result = await getTranslatedArticles(currentPost);

    expect(result).toEqual([
      {
        lang: 'en',
        slug: 'english-article',
        title: 'Article in English',
      },
    ]);
    expect(mockGetCollection).toHaveBeenCalledWith('blog');
  });
});
