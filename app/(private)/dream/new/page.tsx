import DreamForm from '../_components/DreamForm';
import { createDreamAction } from '../../../../lib/features/dreams/actions/createDreamAction';
import styles from './page.module.css';

export default async function NewDreamPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Новый сон</h1>
      </div>

      <DreamForm mode="create" action={createDreamAction} />
    </div>
  );
}
