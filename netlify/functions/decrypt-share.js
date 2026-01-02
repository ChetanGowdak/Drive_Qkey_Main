/**
 * Netlify Function: decrypt-share
 * 
 * Decrypts an encrypted file and uploads the decrypted version to Cloudinary
 * for sharing. Returns the shareable URL.
 */

import crypto from 'crypto';

// Cloudinary config from environment
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

export const handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { fileURL, cryptoMeta, password, filename } = JSON.parse(event.body);

        if (!fileURL || !cryptoMeta || !password || !filename) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        // 1. Download encrypted file from Cloudinary
        const encryptedResponse = await fetch(fileURL);
        if (!encryptedResponse.ok) {
            throw new Error('Failed to download encrypted file');
        }
        const encryptedBuffer = Buffer.from(await encryptedResponse.arrayBuffer());

        // 2. Decrypt the file
        const decryptedBuffer = await decryptFile(encryptedBuffer, cryptoMeta, password);

        // 3. Upload decrypted file to Cloudinary (public with random name for security)
        const shareId = `shared/${Date.now()}_${crypto.randomBytes(16).toString('hex')}_${filename}`;
        const uploadResult = await uploadToCloudinary(decryptedBuffer, shareId);

        // 4. Return shareable URL
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                shareURL: uploadResult.secure_url,
                message: 'Share link created!'
            })
        };

    } catch (error) {
        console.error('❌ Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: error.message || 'Failed to process file'
            })
        };
    }
};

/**
 * Decrypt file using Node.js crypto compatible with client-side encryption
 */
async function decryptFile(encryptedBuffer, meta, password) {
    // Decode base64 values
    const salt = Buffer.from(meta.salt_b64, 'base64');
    const iv = Buffer.from(meta.iv_b64, 'base64');
    const wrappedKey = Buffer.from(meta.wrapped_key_b64, 'base64');
    const keyWrapIv = Buffer.from(meta.key_wrap_iv_b64, 'base64');
    const iterations = meta.iters || 250000;

    // Derive key from password using PBKDF2
    const passwordKey = crypto.pbkdf2Sync(
        password,
        salt,
        iterations,
        32,
        'sha256'
    );

    // Unwrap the data key using AES-GCM
    const authTagLength = 16;
    const wrappedKeyData = wrappedKey.slice(0, -authTagLength);
    const authTag = wrappedKey.slice(-authTagLength);

    const decipher = crypto.createDecipheriv('aes-256-gcm', passwordKey, keyWrapIv);
    decipher.setAuthTag(authTag);

    let dataKey;
    try {
        dataKey = Buffer.concat([
            decipher.update(wrappedKeyData),
            decipher.final()
        ]);
    } catch (e) {
        throw new Error('Wrong password or corrupted file');
    }

    // Decrypt the actual file content
    const encryptedContent = encryptedBuffer.slice(0, -authTagLength);
    const fileAuthTag = encryptedBuffer.slice(-authTagLength);

    const fileDecipher = crypto.createDecipheriv('aes-256-gcm', dataKey, iv);
    fileDecipher.setAuthTag(fileAuthTag);

    try {
        const decrypted = Buffer.concat([
            fileDecipher.update(encryptedContent),
            fileDecipher.final()
        ]);
        return decrypted;
    } catch (e) {
        throw new Error('Decryption failed - wrong password or corrupted file');
    }
}

/**
 * Upload buffer to Cloudinary using base64
 * @param {Buffer} buffer - File buffer
 * @param {string} publicId - Public ID for the file
 * @param {string} type - Access type: 'upload' (public) or 'authenticated' (private)
 */
async function uploadToCloudinary(buffer, publicId, type = 'upload') {
    const timestamp = Math.floor(Date.now() / 1000);

    // Build parameters to sign (alphabetically sorted)
    const paramsToSign = {
        public_id: publicId,
        timestamp: timestamp,
        type: type
    };

    // Generate signature (sorted alphabetically, concatenated)
    const signatureString = Object.keys(paramsToSign)
        .sort()
        .map(key => `${key}=${paramsToSign[key]}`)
        .join('&') + CLOUDINARY_API_SECRET;

    const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

    // Convert buffer to base64 data URI
    const base64Data = `data:application/octet-stream;base64,${buffer.toString('base64')}`;

    // Use URL-encoded form data
    const params = new URLSearchParams({
        file: base64Data,
        public_id: publicId,
        timestamp: timestamp.toString(),
        type: type,
        api_key: CLOUDINARY_API_KEY,
        signature: signature
    });

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        }
    );

    if (!response.ok) {
        const error = await response.json();
        console.error('Cloudinary error:', error);
        throw new Error('Failed to upload to Cloudinary');
    }

    return await response.json();
}
