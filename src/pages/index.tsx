import Router from 'next/router'
import styles from '../styles/Home.module.scss'
import { useEffect, useState } from 'react';
import useAuth from '@/utils/use-auth';

function Home() {
  const { token } = useAuth();

  return <h1 className={styles.test}>HOMEEE</h1>
}

export default Home