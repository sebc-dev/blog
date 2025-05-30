import { describe, expect, it, beforeEach, vi } from 'vitest';
import { type CollectionEntry } from 'astro:content';

// Mock astro:content avec une factory function pour éviter le hoisting
vi.mock('astro:content', () => ({
    getCollection: vi.fn(),
  }));

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
  } as unknown as CollectionEntry<'blog'>;
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

  it('devrait retourner plusieurs traductions et ignorer les posts non pertinents', async () => {
    const currentPost = createMockBlogPost({
      translationId: 'multi-trans-id',
      lang: 'fr',
      title: 'Article Actuel en Français',
      slug: 'article-actuel-francais',
    });

    const englishTranslation1 = createMockBlogPost({
      translationId: 'multi-trans-id',
      lang: 'en',
      title: 'First English Translation',
      slug: 'first-english-translation',
    });

    const englishTranslation2 = createMockBlogPost({
      translationId: 'multi-trans-id',
      lang: 'en',
      title: 'Second English Translation',
      slug: 'second-english-translation',
    });

    const anotherFrenchPostWithSameId = createMockBlogPost({
      translationId: 'multi-trans-id', // Même ID de traduction
      lang: 'fr', // Même langue que currentPost
      title: 'Autre Article Français',
      slug: 'autre-article-francais',
    });

    const unrelatedPost = createMockBlogPost({
      translationId: 'other-id', // ID de traduction différent
      lang: 'en',
      title: 'Unrelated English Post',
      slug: 'unrelated-english-post',
    });

    mockGetCollection.mockResolvedValue([
      currentPost,
      englishTranslation1,
      englishTranslation2,
      anotherFrenchPostWithSameId,
      unrelatedPost,
    ]);

    const result = await getTranslatedArticles(currentPost);

    expect(result).toEqual([
      {
        lang: 'en',
        slug: 'first-english-translation',
        title: 'First English Translation',
      },
      {
        lang: 'en',
        slug: 'second-english-translation',
        title: 'Second English Translation',
      },
    ]);
    expect(result).toHaveLength(2);
    expect(mockGetCollection).toHaveBeenCalledWith('blog');
  });
});
