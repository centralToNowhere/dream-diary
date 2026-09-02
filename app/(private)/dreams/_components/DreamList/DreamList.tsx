import { memo } from 'react'
import type { DreamItem } from './types'
import { DreamItem as DreamItemComponent } from "."
import Link from "next/link";
import styles from "./DreamList.module.css"

interface DreamList {
  items: DreamItem[]
}

const DreamList = memo(({ items }: DreamList) => {
  return (
    <ul className={styles.list}>
      {items.map((data) => (
        <li key={data.id}>
          <Link
            href={`/dream/${data.id}`}
          >
            <DreamItemComponent data={data} />
          </Link>
        </li>
      ))}
    </ul>
  )
})

export default DreamList;