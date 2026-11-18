import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../auth/AuthContext';
import { LoadingView } from '../components/ui';
import { colors } from '../theme';
import type { AuthStackParamList, RootStackParamList, TabParamList,} from './types';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import QuestionsScreen from '../screens/QuestionsScreen';
import PublishScreen from '../screens/PublishScreen';
import MyQuestionsScreen from '../screens/MyQuestionsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import QuestionDetailScreen from '../screens/QuestionDetailScreen';
import EditQuestionScreen from '../screens/EditQuestionScreen';

import { useNotifications } from '../state/NotificationsContext';
import NotificationsScreen from '../screens/NotificationsScreen';

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.paper,
    card: colors.surface,
    text: colors.ink,
    border: colors.line,
  },
};

const headerOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTitleStyle: { color: colors.ink, fontWeight: '700' as const },
  headerTintColor: colors.primary,
  headerShadowVisible: false,
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
  Questions: 'chatbubbles-outline',
  Publish: 'add-circle-outline',
  MyQuestions: 'document-text-outline',
  Profile: 'person-circle-outline',
  Notifications: 'notifications-outline',
};

function Tabs() {
  const { unread } = useNotifications();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...headerOptions,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ color, size }) => <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Questions" component={QuestionsScreen} options={{ title: 'Questions' }} />
      <Tab.Screen name="Publish" component={PublishScreen} options={{ title: 'Publier' }} />
      <Tab.Screen name="MyQuestions" component={MyQuestionsScreen} options={{ title: 'Mes questions' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen}
      options={{ title: 'Notifications', tabBarBadge: unread > 0 ? unread : undefined }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mon profil' }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingView />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      {user ? (
        <RootStack.Navigator screenOptions={headerOptions}>
          <RootStack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <RootStack.Screen name="QuestionDetail" component={QuestionDetailScreen} options={{ title: 'Question' }} />
          <RootStack.Screen name="EditQuestion" component={EditQuestionScreen} options={{ title: 'Modifier la question' }} />
          <RootStack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: 'Profil' }} />
        </RootStack.Navigator>
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Signup" component={SignupScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}
