import Link from 'next/link';
import { Button } from '@/_components/ui';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.page}>
        <h1 className={styles.title}>
          Dream diary - это место, где вы можете записывать и оценивать свои
          сны, а также генерировать к ним иллюстрации.
        </h1>
        <Button size={'lg'} asChild className={styles.button}>
          <Link href={'/dream/new'}>Создать сон</Link>
        </Button>{' '}
      </div>
    </div>
  );
}
