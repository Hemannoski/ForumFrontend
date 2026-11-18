import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCurrentUser } from '../auth/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import ProfileView from './ProfileView';

export default function UserProfileScreen({ route }: NativeStackScreenProps<RootStackParamList, 'UserProfile'>) {
  const user = useCurrentUser();
  const { userId } = route.params;
  return <ProfileView userId={userId} isSelf={userId === user.id} />;
}
