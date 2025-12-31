// src/components/common/cloudinaryApi.js
// Cloudinary upload/download utilities for encrypted files

import cloudinaryConfig from "../../cloudinaryConfig";

/**
 * Upload an encrypted blob to Cloudinary
 * Uses unsigned upload (no API secret required on client)
 * 
 * SETUP REQUIRED:
 * 1. Go to Cloudinary Dashboard > Settings > Upload
 * 2. Create an upload preset with "Unsigned" signing mode  
 * 3. Add VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name to .env
 * 
 * @param {Blob} blob - The encrypted file blob
 * @param {string} publicId - Unique identifier for the file
 * @returns {Promise<{url: string, publicId: string}>}
 */
export async function uploadToCloudinary(blob, publicId) {
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    // Debug logging - remove after fixing
    console.log("🔍 Cloudinary Debug:", {
        cloudName: cloudinaryConfig.cloudName,
        uploadPreset: uploadPreset,
        allEnv: import.meta.env
    });

    if (!uploadPreset) {
        throw new Error("Missing VITE_CLOUDINARY_UPLOAD_PRESET in .env. Create an unsigned upload preset in Cloudinary Dashboard first.");
    }

    if (!cloudinaryConfig.cloudName) {
        throw new Error("Missing VITE_CLOUDINARY_CLOUD_NAME in .env file.");
    }

    const formData = new FormData();
    formData.append("file", blob);
    formData.append("upload_preset", uploadPreset);
    formData.append("public_id", publicId);
    formData.append("resource_type", "auto");

    // Use 'auto' resource type for any file type
    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/auto/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!response.ok) {
        const error = await response.json();
        console.error("Cloudinary upload error:", error);
        throw new Error(error.error?.message || "Cloudinary upload failed");
    }

    const data = await response.json();
    return {
        url: data.secure_url,
        publicId: data.public_id,
    };
}

/**
 * Download file bytes from Cloudinary URL
 * 
 * @param {string} url - The Cloudinary file URL
 * @returns {Promise<ArrayBuffer>}
 */
export async function downloadFromCloudinary(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to download file from Cloudinary");
    }

    return response.arrayBuffer();
}

/**
 * Delete a file from Cloudinary
 * NOTE: Deletion requires server-side Admin API call.
 * For now, this is a placeholder that logs a warning.
 * Files will need manual cleanup from Cloudinary dashboard.
 * 
 * @param {string} publicId - The Cloudinary public_id
 */
export async function deleteFromCloudinary(publicId) {
    // Cloudinary deletion requires Admin API with API Secret
    // which should NOT be exposed in client-side code.
    // 
    // Options for production:
    // 1. Create a backend endpoint that calls Cloudinary Admin API
    // 2. Use Cloudinary's auto-delete feature with expiring URLs
    // 3. Manual cleanup from Cloudinary dashboard

    console.warn(
        `[Cloudinary] File deletion skipped (requires server-side API): ${publicId}`
    );

    // Return true to allow Firestore cleanup to proceed
    return true;
}
