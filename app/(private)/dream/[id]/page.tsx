import Link from 'next/link';
import { Button } from '@/_components/ui';
import { notFound } from 'next/navigation';
import getUserDreamById from '@/lib/features/dreams/getUserDreamById';
import DreamImage from './_components/DreamImage';

import styles from './page.module.css';

type DreamPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DreamPage({ params }: DreamPageProps) {
  const { id } = await params;
  const dream = await getUserDreamById(id);

  if (!dream) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <article className={styles.article}>
          <div className={styles.header}>
            <h1 className={styles.title}>{dream.title}</h1>
            <div>
              <p className={styles.date}>Дата сна: {dream.dreamDate}</p>
              <div className={styles.rating}>Оценка: {dream.rating}/10</div>
            </div>
          </div>

          {dream.imageUrl && (
            <DreamImage
              key={dream.imageUrl}
              src={dream.imageUrl}
              alt={`Иллюстрация сна «${dream.title}»`}
            />
          )}

          <p className={styles.description}>{dream.description}</p>
        </article>

        <div className={styles.controls}>
          <Button asChild>
            <Link href={`/dream/${id}/edit`} className={styles.editLink}>
              Редактировать
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
