import { Fragment } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import getUserDreams from '@/lib/features/dreams/getUserDreams';
import { DreamList } from './_components/DreamList';
import { Button } from '@/_components/ui';
import { PlusIcon } from 'lucide-react';
import PageHeader from '@/_components/PageHeader';

export default async function DreamsPage() {
  const dreams = await getUserDreams();
  const dreamsItems = dreams.map((draemDto) => ({
    ...draemDto,
    rate: draemDto.rating,
    date: draemDto.dreamDate,
    imageSrc: draemDto.imageUrl,
  }));

  return (
    <Fragment>
      <PageHeader title="Все сны">
        <Button asChild>
          <Link href="/dream/new" className={styles.createLink}>
            <PlusIcon size={20} />
            <span>Добавить</span>
          </Link>
        </Button>
      </PageHeader>

      <section className={styles.dreamsListContainer}>
        <DreamList items={dreamsItems} />
      </section>
    </Fragment>
  );
}
