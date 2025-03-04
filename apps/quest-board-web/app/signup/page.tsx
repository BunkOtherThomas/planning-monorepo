'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './signup.module.css';
import { signup } from '../lib/api';
import PasswordRequirements from '../components/PasswordRequirements';

type Role = 'guild_leader' | 'adventurer';

export default function Signup() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<Role>('adventurer');
  const [password, setPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Your scroll of passage does not meet the requirements');
      return;
    }

    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Basic validation
    if (password !== confirmPassword) {
      setError('Your scrolls of passage do not match');
      setIsLoading(false);
      return;
    }

    try {
      await signup({
        email,
        password,
        displayName: username,
        isProjectManager: role === 'guild_leader',
        isTeamMember: role === 'adventurer'
      });
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof Error && err.message.includes('email')) {
        setError('This scroll of identification is already registered. Please use another.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to join the guild');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.signupCard}>
        <h1 className={styles.title}>Join the Quest Board</h1>
        {error && <div className={styles.error}>{error}</div>}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">Display Name</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="How shall we address you?"
              required
              className={styles.input}
              disabled={isLoading}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Scroll of Identification (Email) *</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="your@email.com"
              required
              className={styles.input}
              disabled={isLoading}
            />
            <span className={styles.hint}>This will be used to sign in to your account</span>
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Scroll of Passage</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              required
              className={styles.input}
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordRequirements 
              password={password}
              onValidityChange={setIsPasswordValid}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirm Scroll of Passage</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="••••••••"
              required
              className={styles.input}
              disabled={isLoading}
            />
          </div>
          <div className={styles.roleGroup}>
            <label>Choose Your Path</label>
            <div className={styles.roleOptions}>
              <label className={`${styles.roleOption} ${role === 'adventurer' ? styles.selected : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="adventurer"
                  checked={role === 'adventurer'}
                  onChange={(e) => setRole(e.target.value as Role)}
                  disabled={isLoading}
                />
                <span className={styles.roleTitle}>Adventurer</span>
                <span className={styles.roleDescription}>Take on quests and earn rewards</span>
              </label>
              <label className={`${styles.roleOption} ${role === 'guild_leader' ? styles.selected : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="guild_leader"
                  checked={role === 'guild_leader'}
                  onChange={(e) => setRole(e.target.value as Role)}
                  disabled={isLoading}
                />
                <span className={styles.roleTitle}>Guild Leader</span>
                <span className={styles.roleDescription}>Post quests and manage rewards</span>
              </label>
            </div>
          </div>
          <button 
            type="submit" 
            className={`${styles.submitButton} ${isLoading ? styles.loading : ''}`}
            disabled={isLoading || !isPasswordValid}
          >
            {isLoading ? 'Forging Your Destiny...' : 'Begin Your Journey'}
          </button>
        </form>
        <div className={styles.links}>
          <Link href="/login" className={styles.link}>
            Already a member? Return to the Guild Hall
          </Link>
        </div>
      </div>
    </div>
  );
} 