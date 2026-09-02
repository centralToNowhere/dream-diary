'use client'

import { DreamItem } from './types'
import { StarRating } from '@/_components/StarRating';
import styles from './DreamList.module.css'
import { useRef } from 'react';
import { useParalax } from './hooks';
import { useThrottle } from '@/hooks';

interface DreamItemProps {
  data: DreamItem
}

const paralaxConfig = { keyX: '--bg-x', keyY: '--bg-y' };

const DreamItemComponent = ({ data }: DreamItemProps) => {
  const cardRef = useRef(null);
  const handleParalax = useParalax(paralaxConfig, cardRef);
  const handleParalaxThrottled = useThrottle(handleParalax, 100, true);

  return (
    <article onMouseMove={handleParalaxThrottled} ref={cardRef} className={styles.item} style={{
      '--bg-image': `url(${data.imageSrc})`
    } as React.CSSProperties}>
      <div className={styles.itemHeading}>
        <h2 className={styles.itemTitle}>
          {data.title}
        </h2>

        <div className={styles.metaContainer}>
          <span className={styles.itemDate}>
            {new Intl.DateTimeFormat("ru-RU", {
              dateStyle: "short",
            }).format(new Date(data.date))}
          </span>

          <StarRating value={data.rate} maxRate={10} />
        </div>
      </div>

      <div className={styles.contentContainer}>
        <p className={styles.itemContent}>
          {data.description}
        </p>
      </div>
    </article>
  )
}

export default DreamItemComponent;