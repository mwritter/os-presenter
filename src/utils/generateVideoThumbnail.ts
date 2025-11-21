/**
 * Generate a thumbnail image from a video file
 * Captures a frame from the middle of the video and returns it as a PNG blob
 * 
 * @param videoUrl - The URL or path to the video file
 * @returns A Promise that resolves to a Blob containing the thumbnail PNG, or null if generation fails
 */
export async function generateVideoThumbnail(
  videoUrl: string
): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      // Create hidden video element
      const video = document.createElement('video');
      // Don't set crossOrigin for local asset:// URLs
      video.preload = 'auto'; // Load enough data for seeking
      video.muted = true; // Mute to avoid audio issues
      video.style.display = 'none';
      
      // Add to DOM (required for some browsers to load metadata properly)
      document.body.appendChild(video);

      let hasResolved = false;
      const cleanup = () => {
        if (video.parentNode) {
          document.body.removeChild(video);
        }
      };

      const safeResolve = (result: Blob | null) => {
        if (!hasResolved) {
          hasResolved = true;
          cleanup();
          resolve(result);
        }
      };

      // Handle errors
      video.addEventListener('error', (e) => {
        console.error('Video loading error:', e);
        safeResolve(null);
      });

      // Wait for metadata to load to get video duration
      video.addEventListener('loadedmetadata', () => {
        console.log('Video metadata loaded:', {
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight
        });
      });

      // Wait for enough data to be loaded before seeking
      video.addEventListener('loadeddata', () => {
        console.log('Video data loaded, seeking to middle');
        // Seek to middle of video
        const middleTime = Math.max(1, video.duration / 2); // At least 1 second in
        video.currentTime = middleTime;
      });

      // Once seek is complete, capture the frame
      video.addEventListener('seeked', async () => {
        try {
          console.log('Seeked event fired, currentTime:', video.currentTime);
          
          // Play briefly to ensure frame is rendered
          try {
            await video.play();
            video.pause();
          } catch (playError) {
            console.warn('Could not play video briefly:', playError);
          }
          
          // Give the browser a moment to render the frame
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              try {
                // Verify video dimensions are valid
                if (video.videoWidth === 0 || video.videoHeight === 0) {
                  console.error('Invalid video dimensions');
                  safeResolve(null);
                  return;
                }

                // Create canvas with appropriate dimensions
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d', { willReadFrequently: false });
                
                if (!ctx) {
                  console.error('Could not get canvas context');
                  safeResolve(null);
                  return;
                }

                // Calculate dimensions maintaining aspect ratio
                // Use 1280px max width for high quality thumbnails (720p quality)
                const maxWidth = 1280;
                const aspectRatio = video.videoHeight / video.videoWidth;
                
                // Don't upscale - use video dimensions if smaller than max
                const width = Math.min(maxWidth, video.videoWidth);
                const height = Math.floor(width * aspectRatio);
                
                canvas.width = width;
                canvas.height = height;

                // Draw the current video frame to canvas
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Check if canvas has any pixels drawn
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const hasContent = imageData.data.some((value, index) => {
                  // Check alpha channel (every 4th value starting at index 3)
                  if (index % 4 === 3) return value > 0;
                  return false;
                });

                if (!hasContent) {
                  console.error('Canvas is empty - no pixels drawn from video');
                  safeResolve(null);
                  return;
                }

                console.log('Canvas has content, converting to blob:', {
                  width: canvas.width,
                  height: canvas.height
                });

                // Convert canvas to blob
                canvas.toBlob(
                  (blob) => {
                    if (blob && blob.size > 0) {
                      console.log('Thumbnail blob created successfully:', blob.size, 'bytes');
                      safeResolve(blob);
                    } else {
                      console.error('Failed to create blob from canvas or blob is empty');
                      safeResolve(null);
                    }
                  },
                  'image/png'
                );
              } catch (innerError) {
                console.error('Error in requestAnimationFrame:', innerError);
                safeResolve(null);
              }
            });
          });
        } catch (error) {
          console.error('Error capturing video frame:', error);
          safeResolve(null);
        }
      });

      // Set timeout to prevent hanging
      setTimeout(() => {
        console.error('Thumbnail generation timeout');
        safeResolve(null);
      }, 30000); // 30 second timeout

      // Start loading the video
      video.src = videoUrl;
    } catch (error) {
      console.error('Error setting up video thumbnail generation:', error);
      resolve(null);
    }
  });
}

