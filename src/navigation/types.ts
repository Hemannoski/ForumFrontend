export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
  QuestionDetail: { id: number };
  EditQuestion: { id: number };
  UserProfile: { userId: number };
};

export type TabParamList = {
  Questions: undefined;
  Publish: undefined;
  MyQuestions: undefined;
  Profile: undefined;
  Notifications: undefined;
};
