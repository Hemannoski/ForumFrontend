export interface User {
  id: number;
  pseudo: string;
  lastname: string;
  firstname: string;
}

export interface Profile extends User {
  questions_count: number;
  answers_count: number;
  likes_received: number;
}

export interface LikeState { liked: boolean; likes_count: number; }

export interface AppNotification {
  id: number; type: 'answer' | 'like'; 
  question_id: number; question_title: string;
  actor_id: number; 
  actor_pseudo: string; is_read: boolean; 
  date: string;
}

export interface Question {
  id: number;
  title: string;
  description: string;
  content: string;
  date: string;
  author_id: number;
  author_pseudo: string;
  answers_count: number;
  likes_count: number;
  liked_by_me: boolean;
}

export interface Answer {
  id: number;
  question_id: number;
  author_id: number;
  author_pseudo: string;
  content: string;
  date: string;
}

export interface Paged<T> {
  items: T[];
  page: number;
  has_more: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface QuestionInput {
  title: string;
  description: string;
  content: string;
}

export interface RegisterInput {
  pseudo: string;
  lastname: string;
  firstname: string;
  password: string;
}
