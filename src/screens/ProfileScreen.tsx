import React from 'react';
import { useCurrentUser } from '../auth/AuthContext';
import ProfileView from './ProfileView';

export default function ProfileScreen() {
  const user = useCurrentUser();
  return <ProfileView userId={user.id} isSelf />;
}
