import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to game screen immediately
    router.replace('/game');
  }, []);

  return null;
}
