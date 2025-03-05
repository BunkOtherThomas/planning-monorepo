'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './signup.module.css';
import { signup } from '../lib/api';
import PasswordRequirements from '../components/PasswordRequirements';
import { AvatarSelector } from '../components/AvatarSelector';

export default function Signup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState(0);
  const [teamCode, setTeamCode] = useState('');
  const [isTeamCodeDisabled, setIsTeamCodeDisabled] = useState(false);

  useEffect(() => {
    const teamParam = searchParams.get('team');
    if (teamParam) {
      setTeamCode(teamParam);
      setIsTeamCodeDisabled(true);
    }
  }, [searchParams]);

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
      const response = await signup({
        email,
        password,
        displayName: username,
        isProjectManager: !teamCode, // If no team code, they're a PM
        isTeamMember: !!teamCode, // If there's a team code, they're a team member
        avatarId: selectedAvatarId
      });

      // Set the auth token in cookies with SameSite attribute
      const cookieValue = `auth-token=${response.token}; path=/; max-age=604800; SameSite=Lax`;  // 7 days
      document.cookie = cookieValue;

      // Redirect based on role
      if (!teamCode) {
        router.push('/goals');
      } else {
        router.push('/dashboard');
      }
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
            <label>Display Name</label>
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
          <div className={styles.inputGroup}>
            <label htmlFor="teamCode">Team Code (Optional)</label>
            <input
              type="text"
              id="teamCode"
              name="teamCode"
              placeholder="Enter team code to join as an adventurer"
              className={styles.input}
              disabled={isLoading || isTeamCodeDisabled}
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value)}
            />
            <span className={styles.hint}>
              {isTeamCodeDisabled 
                ? "You're joining as an adventurer" 
                : "Leave empty to create a new team as a Guild Leader"}
            </span>
          </div>
          <div className={styles.avatarSection}>
            <label>Choose Your Avatar</label>
            <AvatarSelector
              onSelect={setSelectedAvatarId}
              initialAvatarId={selectedAvatarId}
            />
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