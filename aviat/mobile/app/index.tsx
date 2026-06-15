import { Redirect } from 'expo-router';

import { AppStartScreen } from '../components/start/AppStartScreen';
import { useAuthSession } from '../src/providers/AuthSessionProvider';

export default function IndexScreen() {
  const { isReady, session } = useAuthSession();

  if (!isReady) {
    return <AppStartScreen />;
  }

  return <Redirect href={session ? '/main' : '/auth/login'} />;
}
