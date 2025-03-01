import Link from 'next/link';
import styles from './login.module.css';

export default function Login() {
  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Welcome, Adventurer</h1>
        <form className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="your@email.com"
              required
              className={styles.input}
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
            />
          </div>
          <button type="submit" className={styles.submitButton}>
            Enter the Realm
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