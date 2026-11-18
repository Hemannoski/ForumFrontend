import { request } from './client';
import type {
  Answer,
  AuthResponse,
  Paged,
  Profile,
  Question,
  QuestionInput,
  RegisterInput,
  User,
  AppNotification,
  LikeState,
} from '../types';

export function register(input: RegisterInput): Promise<AuthResponse> {
  return request<AuthResponse>('POST', '/auth/register', { body: input });
}

export function login(pseudo: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('POST', '/auth/login', { body: { pseudo, password } });
}

export function logout(): Promise<void> {
  return request<void>('POST', '/auth/logout');
}

export async function me(): Promise<User> {
  const res = await request<{ user: User }>('GET', '/me');
  return res.user;
}

export function listQuestions(params: { search?: string; page?: number }): Promise<Paged<Question>> {
  return request<Paged<Question>>('GET', '/questions', {
    query: { search: params.search, page: params.page ?? 1, limit: 10 },
  });
}

export async function getQuestion(id: number): Promise<Question> {
  const res = await request<{ question: Question }>('GET', `/questions/${id}`);
  return res.question;
}

export async function createQuestion(input: QuestionInput): Promise<Question> {
  const res = await request<{ question: Question }>('POST', '/questions', { body: input });
  return res.question;
}

export async function updateQuestion(id: number, input: QuestionInput): Promise<Question> {
  const res = await request<{ question: Question }>('PUT', `/questions/${id}`, { body: input });
  return res.question;
}

export function deleteQuestion(id: number): Promise<void> {
  return request<void>('DELETE', `/questions/${id}`);
}

export async function listAnswers(questionId: number): Promise<Answer[]> {
  const res = await request<{ items: Answer[] }>('GET', `/questions/${questionId}/answers`);
  return res.items;
}

export async function postAnswer(questionId: number, content: string): Promise<Answer> {
  const res = await request<{ answer: Answer }>('POST', `/questions/${questionId}/answers`, {
    body: { content },
  });
  return res.answer;
}

export function deleteAnswer(id: number): Promise<void> {
  return request<void>('DELETE', `/answers/${id}`);
}

export async function getProfile(userId: number): Promise<Profile> {
  const res = await request<{ user: Profile }>('GET', `/users/${userId}`);
  return res.user;
}

export function listUserQuestions(userId: number, page: number): Promise<Paged<Question>> {
  return request<Paged<Question>>('GET', `/users/${userId}/questions`, { query: { page, limit: 10 } });
}


// ---------- J'aime ----------
export function likeQuestion(id: number): Promise<LikeState> {
  return request<LikeState>('POST', `/questions/${id}/like`);
}

export function unlikeQuestion(id: number): Promise<LikeState> {
  return request<LikeState>('DELETE', `/questions/${id}/like`);
}

// ---------- Notifications ----------
export function listNotifications(page: number): Promise<Paged<AppNotification>> {
  return request<Paged<AppNotification>>('GET', '/notifications', { query: { page, limit: 20 } });
}

export async function getUnreadCount(): Promise<number> {
  const res = await request<{ count: number }>('GET', '/notifications/unread-count');
  return res.count;
}

export function markNotificationRead(id: number): Promise<void> {
  return request<void>('POST', `/notifications/${id}/read`);
}

export function markAllNotificationsRead(): Promise<void> {
  return request<void>('POST', '/notifications/read-all');
}