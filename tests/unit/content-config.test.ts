import { describe, it, expect } from "vitest";
import { z } from "zod";
import { collections } from "../../src/content.config";

describe("Content Configuration", () => {
  it("should export collections object", () => {
    expect(collections).toBeDefined();
    expect(typeof collections).toBe("object");
  });

  it("should have blog collection defined", () => {
    expect(collections.blog).toBeDefined();
    expect(typeof collections.blog).toBe("object");
  });

  it("should have blog collection with required properties", () => {
    const blogCollection = collections.blog;

    // Vérifier que la collection a un schéma (fonction ou objet)
    expect(blogCollection.schema).toBeDefined();

    // La propriété schema peut être soit une fonction soit un objet selon le contexte
    const schemaType = typeof blogCollection.schema;
    expect(["function", "object"].includes(schemaType)).toBe(true);
  });

  it("should have a valid Zod schema that can be instantiated and used", () => {
    const blogCollection = collections.blog;
    const schema = blogCollection.schema;

    // Si le schema est une fonction, l'appeler pour obtenir l'objet schema
    let schemaObject;
    if (typeof schema === "function") {
      // Mock de la fonction image pour les tests - retourne un schéma Zod valide
      const mockImage = () =>
        z
          .object({
            src: z.string(),
            width: z.number(),
            height: z.number(),
            format: z.string(),
          })
          .optional();

      // Utilisation d'une assertion de type pour les tests
      schemaObject = schema({ image: mockImage as any });
    } else {
      schemaObject = schema;
    }

    // Vérifier que l'objet schema résultant a les méthodes Zod attendues
    expect(schemaObject).toBeDefined();

    if (schemaObject) {
      expect(schemaObject.parse).toBeDefined();
      expect(typeof schemaObject.parse).toBe("function");

      // Optionnel: vérifier d'autres méthodes Zod communes
      expect(schemaObject.safeParse).toBeDefined();
      expect(typeof schemaObject.safeParse).toBe("function");
    }
  });

  it("should be a valid Astro content collection configuration", () => {
    // Vérifier que la structure générale est correcte
    expect("blog" in collections).toBe(true);

    const blogCollection = collections.blog;
    expect(blogCollection).toBeDefined();

    // Vérifier les propriétés attendues d'une collection Astro
    expect(blogCollection.schema).toBeDefined();
  });

  it("should export only expected collections", () => {
    const collectionKeys = Object.keys(collections);
    expect(collectionKeys).toContain("blog");

    // Pour ce projet, on s'attend à avoir uniquement la collection blog
    expect(collectionKeys.length).toBe(1);
  });
});
