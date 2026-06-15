import { Redirect } from 'expo-router';

import { FullscreenLoader } from '../components/shared/FullscreenLoader';
import { HomeScreen } from '../components/home/HomeScreen';
import { useAuthSession } from '../src/providers/AuthSessionProvider';

export default function MainScreen() {
  const { isReady, profile, profileLoading, refreshProfile, session } = useAuthSession();

  if (!isReady) {
    return <FullscreenLoader label="Открываем главную" />;
  }

  if (!session) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <HomeScreen
      profile={profile}
      profileLoading={profileLoading}
      refreshProfile={refreshProfile}
      session={session}
    />
  );
}
