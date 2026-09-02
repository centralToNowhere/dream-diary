'use client';

import Image from 'next/image';
import LogoImageLight from '@/public/dream-diary-logo-purple.png';
import LogoImageDark from '@/public/dream-diary-logo-contrast.png';
import { useTheme } from '@/hooks/useTheme';

type LogoProps = {
  width?: React.CSSProperties['width']
  height?: React.CSSProperties['height']
}

const containerStyles = {
  display: 'flex'
}

const Logo = ({ width, height }: LogoProps) => {
  let Logo;
  const theme = useTheme();

  if (theme.value === 'dark') {
    Logo = LogoImageLight;
  } else {
    Logo = LogoImageDark;
  }

  return (
    <div style={containerStyles}>
      <Image
        style={{
          width,
          height,
          borderRadius: '12px',
          flexShrink: 0
        }}
        src={Logo}
        alt="Dream Diary"
      />
    </div>
  )
}

export default Logo

