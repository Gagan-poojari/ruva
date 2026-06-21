const ImageKit = require('imagekit');
const fs = require('fs');
const path = require('path');

let sharp;
try {
    sharp = require('sharp');
} catch (err) {
    console.warn('WARNING: Failed to load "sharp" library. Server-side pre-resizing is disabled.', err.message);
}

let imagekitInstance = null;

/**
 * Lazily retrieves the ImageKit client instance.
 * Throws a clean error if credentials are not configured.
 * @returns {ImageKit}
 */
function getImageKit() {
    if (imagekitInstance) {
        return imagekitInstance;
    }

    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    const isConfigured = 
        publicKey && publicKey !== 'your_public_key' &&
        privateKey && privateKey !== 'your_private_key' &&
        urlEndpoint && urlEndpoint !== 'https://ik.imagekit.io/your_imagekit_id/';

    if (!isConfigured) {
        throw new Error('ImageKit is not configured. Please check your environment variables.');
    }

    imagekitInstance = new ImageKit({
        publicKey,
        privateKey,
        urlEndpoint,
    });

    return imagekitInstance;
}

/**
 * Standardized response object format
 * @typedef {Object} ServiceResult
 * @property {boolean} success - True if the operation succeeded
 * @property {string} [url] - The resulting delivery URL
 * @property {string} [publicId] - The ImageKit file ID (useful for deletion)
 * @property {string} [error] - Error message if failed
 */

/**
 * Standardized Image/Video Upload Method
 * Resizes images to exactly 846x1264 using sharp before uploading to ImageKit.
 * 
 * @param {string|Buffer|Stream} fileInput - Local file path, Buffer, or Stream
 * @param {Object} [options] - Additional ImageKit upload options
 * @returns {Promise<ServiceResult>}
 */
async function uploadImage(fileInput, options = {}) {
    try {
        const imagekit = getImageKit();
        let file = fileInput;
        let fileName = options.fileName;

        if (typeof fileInput === 'string') {
            if (!fs.existsSync(fileInput)) {
                return { success: false, error: `Local file path not found: ${fileInput}` };
            }

            const ext = path.extname(fileInput).toLowerCase();
            const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.heic'].includes(ext);

            if (isImage && sharp) {
                try {
                    // Pre-resize image to 846x1264 prior to upload
                    file = await sharp(fileInput)
                        .resize(846, 1264, {
                            fit: 'contain',
                            background: { r: 255, g: 255, b: 255, alpha: 1 } //white background padding
                        })
                        .toBuffer();
                } catch (sharpError) {
                    console.error('Sharp resizing failed, falling back to original upload:', sharpError.message);
                    file = fs.createReadStream(fileInput);
                }
            } else {
                file = fs.createReadStream(fileInput);
            }

            if (!fileName) {
                fileName = path.basename(fileInput);
            }
        }

        if (!fileName) {
            fileName = `upload_${Date.now()}`;
        }

        const uploadParams = {
            file,
            fileName,
            folder: options.folder || '/saree-shop',
            ...options,
        };

        const response = await imagekit.upload(uploadParams);

        return {
            success: true,
            url: response.url,
            publicId: response.fileId,
        };
    } catch (error) {
        console.error('ImageKit Upload Error:', error);
        return {
            success: false,
            error: error.message || 'Unknown error occurred during ImageKit upload',
        };
    }
}

/**
 * Standardized URL Generation with Auto-Compression & Fallback
 * 
 * @param {string} pathOrUrl - File path in ImageKit media library or full URL
 * @param {Object} [options] - Additional transformations (e.g. height, width)
 * @returns {string} Optimized URL or fallback placeholder URL
 */
function getImageUrl(pathOrUrl, options = {}) {
    const fallbackUrl = 'https://ik.imagekit.io/demo/img/tr:di-medium_cafe_B11Z2HA8Q.jpg';

    if (!pathOrUrl || typeof pathOrUrl !== 'string') {
        return fallbackUrl;
    }

    try {
        if (pathOrUrl.includes('res.cloudinary.com')) {
            if (!pathOrUrl.includes('/q_auto') && !pathOrUrl.includes('/f_auto')) {
                return pathOrUrl.replace('/upload/', '/upload/q_auto,f_auto/');
            }
            return pathOrUrl;
        }

        const imagekit = getImageKit();

        const defaultTransformation = {
            quality: 'auto',
            format: 'auto',
            width: 846,
            height: 1264,
            cropMode: 'pad_resize',
        };

        const transformationList = options.transformation 
            ? [{ ...defaultTransformation, ...options.transformation[0] }]
            : [defaultTransformation];

        const urlParams = {
            transformation: transformationList,
        };

        if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
            urlParams.src = pathOrUrl;
        } else {
            urlParams.path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
        }

        return imagekit.url(urlParams);
    } catch (error) {
        console.warn('ImageKit URL Builder Warning:', error.message);
        if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
            return pathOrUrl;
        }
        return fallbackUrl;
    }
}

/**
 * Standardized Delete Method
 * 
 * @param {string} fileId - ImageKit file ID
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
async function deleteImage(fileId) {
    if (!fileId) {
        return { success: false, error: 'No file ID provided for deletion' };
    }
    try {
        const imagekit = getImageKit();
        await imagekit.deleteFile(fileId);
        return { success: true };
    } catch (error) {
        console.error(`ImageKit Deletion Error for ${fileId}:`, error);
        return {
            success: false,
            error: error.message || 'Failed to delete file from ImageKit',
        };
    }
}

module.exports = {
    uploadImage,
    getImageUrl,
    deleteImage,
};
