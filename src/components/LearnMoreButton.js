import React from 'react';
import styles from './LearnMoreButton.module.css'
import Link from 'next/link';

export default function ReadMoreButton() {
  <Link href="/login" className="btn btn-secondary">
    <button className={styles.learnMoreButton}>LEARN MORE</button>
  </Link>
}
