import { useEffect, useState } from 'react';
import { galleryImages } from './galleryImages';

function ImageRotator() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || galleryImages.length <= 1) return undefined;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % galleryImages.length);
    }, 3600);

    return () => clearInterval(interval);
  }, [isPaused]);

  const showNext = () => setIndex((prev) => (prev + 1) % galleryImages.length);
  const showPrevious = () => setIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

  return (
    <div
      className="image-rotator"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      aria-label="Festival photo rotator"
    >
      {galleryImages.map((image, imageIndex) => (
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
        {galleryImages.map((image, imageIndex) => (
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