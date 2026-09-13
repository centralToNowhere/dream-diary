'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ComponentPropsWithoutRef, ElementType } from 'react';

type BackButtonLinkProps = Omit<
  ComponentPropsWithoutRef<typeof Link>,
  'href' | 'onClick'
>;

const linkStyle = { flexShrink: 0 };
export default function BackButton({ ...props }: BackButtonLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.back();
  };

  return (
    <Link
      {...props}
      href="/"
      onClick={handleClick}
      aria-label="Назад"
      style={linkStyle}
    >
      <ChevronLeft />
    </Link>
  );
}
