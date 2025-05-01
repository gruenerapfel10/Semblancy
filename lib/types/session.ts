export interface BaseSession {
  user: {
    id: string;
    email?: string;
    name?: string;
  };
} 