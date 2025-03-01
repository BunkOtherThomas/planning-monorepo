'use client';

import { useEffect, useState } from 'react';
import styles from './PasswordRequirements.module.css';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  {
    label: '8+ characters',
    test: (password) => password.length >= 8,
  },
  {
    label: '1 lowercase',
    test: (password) => /[a-z]/.test(password),
  },
  {
    label: '1 uppercase',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: '1 number',
    test: (password) => /[0-9]/.test(password),
  },
];

interface Props {
  password: string;
  onValidityChange?: (isValid: boolean) => void;
}

export default function PasswordRequirements({ password, onValidityChange }: Props) {
  const [validRequirements, setValidRequirements] = useState<boolean[]>(
    requirements.map(() => false)
  );

  useEffect(() => {
    const newValidRequirements = requirements.map(req => req.test(password));
    setValidRequirements(newValidRequirements);
    
    const isValid = newValidRequirements.every(Boolean);
    onValidityChange?.(isValid);
  }, [password, onValidityChange]);

  return (
    <div className={styles.requirements}>
      {requirements.map((req, index) => (
        <span 
          key={req.label} 
          className={`${styles.item} ${validRequirements[index] ? styles.valid : styles.invalid}`}
        >
          {validRequirements[index] ? '✓' : '×'} {req.label}
        </span>
      ))}
    </div>
  );
} 