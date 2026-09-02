import styles from "./StarRating.module.css"

interface StarRatingProps {
  value: number
  maxRate: number
}

const StarRating = ({ value, maxRate }: StarRatingProps) => {
  if (!value) {
    console.error('StarRating error: no rating data provided');
    return null;
  }

  return (
    <div className={styles.container}>
      <div
        className={styles.outer}
        style={{
          '--star-rating': `${(value / maxRate) * 100}%`
        } as React.CSSProperties}
      >
        ★★★★★
        <div className={styles.inner}>
          ★★★★★
        </div>
      </div>
      <span className={styles.value}>{`${value} / ${maxRate}`}</span>
    </div>
  )
}

StarRating.displayName = 'StarRating';

export default StarRating;