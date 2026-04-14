import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { galleryImages } from './galleryImages';

const MAX_ROTATOR_IMAGES = 7;

function ImageRotator() {
  const [images, setImages] = useState([]);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch active images from homepage_images table, fall back to galleryImages
  useEffect(() => {
    const loadImages = async () => {
      try {
        const { data, error } = await supabase
          .from('homepage_images')
          .select('id, image_url')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .limit(MAX_ROTATOR_IMAGES);

        if (error) throw error;

        if (data && data.length > 0) {
          setImages(data.map((row) => ({ src: row.image_url, alt: `Festa Italia photo ${row.id}` })));
        } else {
          setImages(galleryImages.slice(0, MAX_ROTATOR_IMAGES));
        }
      } catch {
        setImages(galleryImages.slice(0, MAX_ROTATOR_IMAGES));
      }
    };

    loadImages();
  }, []);

  useEffect(() => {
    if (isPaused || images.length <= 1) return undefined;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3600);

    return () => clearInterval(interval);
  }, [isPaused, images.length]);

  const showNext = () => setIndex((prev) => (prev + 1) % images.length);
  const showPrevious = () => setIndex((prev) => (prev - 1 + images.length) % images.length);

  if (images.length === 0) return null;

  return (
    <div
      className="image-rotator"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      aria-label="Festival photo rotator"
    >
      {images.map((image, imageIndex) => (
        <img
          key={image.src}
          src={image.src}
          alt={image.alt}
          className={imageIndex === index ? 'active' : ''}
          aria-hidden={imageIndex === index ? 'false' : 'true'}
        />
      ))}

      <div className="image-rotator-controls" aria-label="Photo controls">
        <button
          type="button"
          className="rotator-btn"
          onClick={showPrevious}
          aria-label="Previous photo"
        >
          ‹
        </button>
        <button
          type="button"
          className="rotator-btn"
          onClick={showNext}
          aria-label="Next photo"
        >
          ›
        </button>
      </div>

      <div className="image-rotator-dots" aria-label="Photo selection">
        {images.map((image, imageIndex) => (
          <button
            key={`${image.src}-dot`}
            type="button"
            className={`rotator-dot ${imageIndex === index ? 'active' : ''}`}
            onClick={() => setIndex(imageIndex)}
            aria-label={`Show photo ${imageIndex + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default ImageRotator;