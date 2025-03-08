'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './dashboard.module.css';
import { Button } from '@repo/ui/button';
import type { StaticImageData } from 'next/image';

interface DualImageProps {
  className?: string;
  srcLight: string | StaticImageData;
  srcDark: string | StaticImageData;
  alt?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

function DualImage({ srcLight, srcDark, alt = '', ...rest }: DualImageProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div className={`${rest.className || ''} imgLight`}>
        <img
          src={srcLight as string}
          alt={alt}
          width={rest.width}
          height={rest.height}
        />
      </div>
      <div className={`${rest.className || ''} imgDark`}>
        <img
          src={srcDark as string}
          alt={alt}
          width={rest.width}
          height={rest.height}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <DualImage
          className={styles.logo}
          srcLight="/turborepo-light.svg"
          srcDark="/turborepo-dark.svg"
          alt="Turborepo Logo"
          width={160}
          height={160}
          priority
        />
        <div className={styles.content}>
          <h1>Web</h1>
          <p>This is the Quest Board web application.</p>
        </div>
        <div className={styles.grid}>
          <Button label="Click me" />
        </div>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://vercel.com/templates?search=turborepo&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://turbo.build?utm_source=create-turbo"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to turbo.build →
        </a>
      </footer>
    </div>
  );
}
