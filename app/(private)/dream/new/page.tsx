import DreamForm from "../_components/DreamForm";
import { createDreamAction } from "./actions";
import styles from "./page.module.css";

export default async function NewDreamPage() {
		return (
		<div className={styles.page}>
			<header className={styles.header}>
				<h1 className={styles.title}>Новый сон</h1>
			</header>

			<DreamForm mode="create" action={createDreamAction} />
		</div>
	);
}
