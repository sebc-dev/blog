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
      type: 'astro:component',
      componentName: 'Image',
      hydrated: false
    },
    type: 'img',
    props: {
      src: typeof src === 'string' ? src : src.src,
      alt,
      width,
      height,
      ...otherProps
    },
    // Simule le rendu HTML final du composant Astro
    render: () => {
      const imgSrc = typeof src === 'string' ? src : src.src;
      return `<img src="${imgSrc}" alt="${alt}"${width ? ` width="${width}"` : ''}${height ? ` height="${height}"` : ''}${Object.entries(otherProps).map(([key, value]) => ` ${key}="${value}"`).join('')} />`;
    },
    // Méthode pour obtenir les attributs finaux (utile pour les tests)
    getAttributes: () => ({
      src: typeof src === 'string' ? src : src.src,
      alt,
      width,
      height,
      ...otherProps
    })
  };
}

// Mock de la fonction image pour les schémas
export function image() {
  return {
    optional: () => ({
      src: 'string',
      width: 'number',
      height: 'number',
      format: 'string'
    })
  };
}

// Mock de getImage
export async function getImage(options: any) {
  return {
    src: options.src || '/mock-image.jpg',
    width: options.width || 800,
    height: options.height || 600,
    format: options.format || 'jpg'
  };
} 