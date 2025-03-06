import { ReactNode } from 'react';
import styles from './Dashboard.module.css';

interface ScrollableSectionProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function ScrollableSection({ 
  title, 
  children, 
  footer,
  className = ''
}: ScrollableSectionProps) {
  return (
    <div className={`${styles.section} ${className}`}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <div className={styles.questListContainer}>
        {children}
        {footer && (
          <div className={styles.stickyAddButton}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
} 