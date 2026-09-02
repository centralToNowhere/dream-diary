import Link from "next/link";
import { Button } from "@/_components/ui"
import { notFound } from "next/navigation";
import getUserDreamById from "@/features/dreams/getUserDreamById"

import styles from "./page.module.css";
import Image from "next/image";

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
            <img
              src={dream.imageUrl}
              alt=""
              className={styles.dreamImage}
            />
          )}

          <p className={styles.description}>
            {dream.description}
          </p>
        </article>

        <div className={styles.controls}>
          <Button asChild>
            <Link
              href={`/dream/${id}/edit`}
              className={styles.editLink}
            >
              Редактировать
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
