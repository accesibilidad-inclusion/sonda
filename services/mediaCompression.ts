/**
 * Media Compression Service
 *
 * Compresses images, videos, and audio to reduce localStorage size
 */

import { IS_DEVELOPER_MODE } from '../constants';

// Configuration
const IMAGE_MAX_DIMENSION = 1000;  // Max width or height in pixels
const IMAGE_QUALITY = 0.8;         // JPEG quality (0.0 - 1.0)
const VIDEO_MAX_DIMENSION = 720;   // Max width or height for videos
const VIDEO_MAX_DURATION = 30;     // Max duration in seconds

/**
 * Compress an image file to JPEG with max dimension
 */
export const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (IS_DEVELOPER_MODE) console.log(`[Compression] Starting image compression for ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);

    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Calculate new dimensions maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > IMAGE_MAX_DIMENSION) {
            height = Math.round((height * IMAGE_MAX_DIMENSION) / width);
            width = IMAGE_MAX_DIMENSION;
          }
        } else {
          if (height > IMAGE_MAX_DIMENSION) {
            width = Math.round((width * IMAGE_MAX_DIMENSION) / height);
            height = IMAGE_MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG Base64
        const compressedBase64 = canvas.toDataURL('image/jpeg', IMAGE_QUALITY);

        if (IS_DEVELOPER_MODE) {
          const originalSize = file.size / 1024;
          const compressedSize = (compressedBase64.length * 0.75) / 1024; // Rough Base64 to bytes
          const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
          console.log(`[Compression] Image compressed: ${originalSize.toFixed(2)}KB → ${compressedSize.toFixed(2)}KB (${reduction}% reduction)`);
          console.log(`[Compression] New dimensions: ${width}x${height}`);
        }

        resolve(compressedBase64);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Compress a video file by resizing frames
 */
export const compressVideo = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (IS_DEVELOPER_MODE) console.log(`[Compression] Starting video compression for ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);

    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      const duration = video.duration;

      if (IS_DEVELOPER_MODE) console.log(`[Compression] Video duration: ${duration.toFixed(2)}s`);

      // Check duration limit
      if (duration > VIDEO_MAX_DURATION) {
        reject(new Error(`El video es demasiado largo (${duration.toFixed(0)}s). El máximo permitido es ${VIDEO_MAX_DURATION}s.`));
        return;
      }

      // For now, we'll just resize the first frame as a thumbnail
      // Full video compression would require a library or backend processing
      video.currentTime = 0;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Calculate new dimensions
        let width = video.videoWidth;
        let height = video.videoHeight;

        if (width > height) {
          if (width > VIDEO_MAX_DIMENSION) {
            height = Math.round((height * VIDEO_MAX_DIMENSION) / width);
            width = VIDEO_MAX_DIMENSION;
          }
        } else {
          if (height > VIDEO_MAX_DIMENSION) {
            width = Math.round((width * VIDEO_MAX_DIMENSION) / height);
            height = VIDEO_MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(video, 0, 0, width, height);

        // Return thumbnail as placeholder
        const thumbnail = canvas.toDataURL('image/jpeg', IMAGE_QUALITY);

        if (IS_DEVELOPER_MODE) {
          console.log(`[Compression] Video thumbnail created: ${width}x${height}`);
        }

        resolve(thumbnail);
      } catch (error) {
        reject(error);
      }
    };

    video.onerror = () => {
      reject(new Error('Failed to load video'));
    };

    video.src = URL.createObjectURL(file);
  });
};

/**
 * Get optimized audio recording constraints
 */
export const getAudioConstraints = (): MediaStreamConstraints => {
  return {
    audio: {
      channelCount: 1,          // Mono audio (reduces size by 50%)
      sampleRate: 16000,        // 16kHz (sufficient for voice)
      echoCancellation: true,   // Improve voice clarity
      noiseSuppression: true,   // Reduce background noise
      autoGainControl: true     // Normalize volume
    }
  };
};

/**
 * Get optimized MediaRecorder options for audio
 */
export const getAudioRecorderOptions = (): { mimeType: string; audioBitsPerSecond: number } => {
  // Try to use Opus codec (best for voice compression)
  let mimeType = 'audio/webm';

  if (typeof MediaRecorder !== 'undefined') {
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      mimeType = 'audio/webm;codecs=opus';
    } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
      mimeType = 'audio/mp4'; // Safari fallback
    } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
      mimeType = 'audio/ogg;codecs=opus';
    } else if (MediaRecorder.isTypeSupported('audio/wav')) {
      mimeType = 'audio/wav';
    }
  }

  return {
    mimeType,
    audioBitsPerSecond: 32000  // 32kbps - good quality for voice
  };
};

/**
 * Calculate estimated file size from base64 string
 */
export const estimateFileSize = (base64: string): number => {
  // Base64 is ~33% larger than binary, so divide by 1.33 to get approximate bytes
  return (base64.length * 0.75) / 1024; // Return KB
};
