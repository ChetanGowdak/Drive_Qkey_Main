// Cloudinary configuration
const cloudinaryConfig = {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
    // Note: API Secret should NOT be used in client-side code for production
    // Use unsigned upload presets instead
};

export default cloudinaryConfig;
