import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z
    .object({
      title: z.string(),
      description: z.string(),
      pubDate: z.date(),
      updatedDate: z.date().optional(),
      lang: z.enum(['fr', 'en']),
      translationId: z.string(),
      slug: z.string().optional(),
      tags: z.array(z.string()).optional(),
      isDraft: z.boolean().default(false).optional(),
      image: z.string().optional(),
      imageAlt: z.string().optional(),
    })
    .refine((data) => !data.image || (data.image && data.imageAlt), {
      message: "L'attribut 'image_alt' est requis si 'image' est fourni.",
      path: ['image_alt'],
    }),
});

export const collections = {
  blog: blogCollection,
};
