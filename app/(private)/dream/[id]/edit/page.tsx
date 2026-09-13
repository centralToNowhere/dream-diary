import { notFound } from 'next/navigation';
import DreamForm from '@/app/(private)/dream/_components/DreamForm';
import getUserDreamById from '@/lib/features/dreams/getUserDreamById';
import styles from './page.module.css';
import { editDreamAction } from '../../../../../lib/features/dreams/actions/editDreamActions';

type EditDreamPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditDreamPage({ params }: EditDreamPageProps) {
  const { id } = await params;
  const dream = await getUserDreamById(id);

  if (!dream) {
    notFound();
  }

  const action = editDreamAction.bind(null, dream.id);

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>Редактировать сон</h1>
        </header>

        <DreamForm mode="edit" dream={dream} action={action} />
      </div>
    </div>
  );
}
