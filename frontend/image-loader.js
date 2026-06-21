export default function imageKitLoader({ src, width, quality }) {
  if (!src) {
    return 'https://ik.imagekit.io/demo/img/tr:di-medium_cafe_B11Z2HA8Q.jpg';
  }

  // 1. If it's an ImageKit URL, strip existing query params and apply dynamic transformations
  if (src.includes('ik.imagekit.io')) {
    const [baseUrl] = src.split('?');
    const params = [];
    if (width) {
      params.push(`w-${width}`);
    }
    // Set quality or default to 80 for visually lossless compression
    const q = quality || 80;
    params.push(`q-${q}`);
    params.push('f-auto'); // auto-format selection (AVIF/WebP)

    return `${baseUrl}?tr=${params.join(',')}`;
  }

  // 2. Seamless support for legacy Cloudinary URLs
  if (src.includes('res.cloudinary.com')) {
    const [baseUrl] = src.split('?');
    if (baseUrl.includes('/upload/')) {
      const q = quality || 80;
      return baseUrl.replace('/upload/', `/upload/w_${width},q_${q},f_auto/`);
    }
    return baseUrl;
  }

  // 3. Fallback for placeholder urls or relative paths
  return src;
}
