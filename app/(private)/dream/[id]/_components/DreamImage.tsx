'use client';

import { useCallback, useState } from 'react';

import styles from '../page.module.css';

type DreamImageProps = {
  src: string;
  alt: string;
};

export default function DreamImage(props: DreamImageProps) {
  return <ImageRequest key={props.src} {...props} />;
}

function ImageRequest({ src, alt }: DreamImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    'loading',
  );
  const setImageRef = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete) {
      setStatus(image.naturalWidth > 0 ? 'loaded' : 'error');
    }
  }, []);

  return (
    <div className={styles.imageContainer}>
      {status === 'loading' && (
        <div
          className={styles.imageSkeleton}
          aria-label="Загрузка изображения"
        />
      )}
      {status === 'error' ? (
        <p role="img" aria-label={alt}>
          Не удалось загрузить изображение
        </p>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={setImageRef}
          src={src}
          alt={alt}
          className={styles.dreamImage}
          data-loaded={status === 'loaded'}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}
    </div>
  );
}
