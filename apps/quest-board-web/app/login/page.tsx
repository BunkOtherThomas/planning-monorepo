'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, FormEvent } from 'react';
import styles from './login.module.css';
import { login } from '../lib/api';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await login(email, password);
      
      // Redirect to the original destination or dashboard
      const redirectTo = searchParams.get('from') || '/dashboard';
      router.push(redirectTo);
    } catch (err) {
      setError('Your scroll of passage seems to be incorrect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Welcome, Adventurer</h1>
        {error && <div className={styles.error}>{error}</div>}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="your@email.com"
              required
              className={styles.input}
              disabled={isLoading}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              required
              className={styles.input}
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            className={`${styles.submitButton} ${isLoading ? styles.loading : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Opening Portal...' : 'Enter the Realm'}
          </button>
        </form>
        <div className={styles.links}>
          <Link href="/forgot-password" className={styles.link}>
            Forgot your scroll of passage?
          </Link>
          <Link href="/signup" className={styles.link}>
            Join the Quest Board
          </Link>
        </div>
      </div>
    </div>
  );
} 