export interface DreamItem {
  id: number;
  title: string;
  description: string;
  date: Date | string;
  rate: number;
  imageSrc?: string | null;
}
