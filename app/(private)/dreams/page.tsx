import Link from "next/link";
import styles from "./page.module.css";
import getUserDreams from "@/features/dreams/getUserDreams"
import { DreamList } from "./_components/DreamList";
import { Button } from "@/_components/ui";
import { PlusIcon } from "lucide-react";

export default async function DreamsPage() {
  const dreams = await getUserDreams();
  const dreamsItems = dreams.map((draemDto) => ({
    ...draemDto,
    rate: draemDto.rating,
    date: draemDto.dreamDate,
    imageSrc: draemDto.imageUrl,
  }))

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>Все сны</h1>
          <Button asChild>
            <Link
              href="/dream/new"
              className={styles.createLink}
            >
              <PlusIcon />
              <span>Добавить</span>
            </Link>
          </Button>
        </header>

        <section className={styles.dreamsListContainer}>
          <DreamList items={dreamsItems} />
        </section>
      </div>
    </div>
  );
}
