// Mock pour astro:assets

// Mock de l'interface ImageMetadata
export interface ImageMetadata {
  src: string;
  width: number;
  height: number;
  format: string;
}

// Mock du composant Image - structure plus proche d'un composant Astro
export function Image(props: {
  src: string | ImageMetadata;
  alt: string;
  width?: number;
  height?: number;
  [key: string]: any;
}) {
  const { src, alt, width, height, ...otherProps } = props;

  // Retourne une structure qui ressemble à un composant Astro rendu
  // Les composants Astro sont transformés en HTML, donc on simule cette structure
  return {
    $$metadata: {
      type: "astro:component",
      componentName: "Image",
      hydrated: false,
    },
    type: "img",
    props: {
      src: typeof src === "string" ? src : src.src,
      alt,
      width,
      height,
      ...otherProps,
    },
    // Simule le rendu HTML final du composant Astro
    render: () => {
      const imgSrc = typeof src === "string" ? src : src.src;
      const escapeHtml = (unsafe: string) =>
        unsafe
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");

      return `<img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(alt)}"${
        width ? ` width="${escapeHtml(String(width))}"` : ""
      }${
        height ? ` height="${escapeHtml(String(height))}"` : ""
      }${Object.entries(otherProps)
        .map(
          ([key, value]) => ` ${escapeHtml(key)}="${escapeHtml(String(value))}"`
        )
        .join("")} />`;
    },
    // Méthode pour obtenir les attributs finaux (utile pour les tests)
    getAttributes: () => ({
      src: typeof src === "string" ? src : src.src,
      alt,
      width,
      height,
      ...otherProps,
    }),
  };
}

// Mock de la fonction image pour les schémas
export function image() {
  return {
    optional: () => ({
      parse: (input: any) => input,
      safeParse: (input: any) => ({ success: true, data: input }),
      _def: {
        typeName: "ZodOptional",
        innerType: {
          typeName: "ZodObject",
          shape: {
            src: { typeName: "ZodString" },
            width: { typeName: "ZodNumber" },
            height: { typeName: "ZodNumber" },
            format: { typeName: "ZodString" },
          },
        },
      },
    }),
  };
}

// Mock de getImage
export async function getImage(options: any) {
  return {
    src: options.src || "/mock-image.jpg",
    width: options.width || 800,
    height: options.height || 600,
    format: options.format || "jpg",
  };
}
