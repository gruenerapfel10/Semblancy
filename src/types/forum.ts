// src/types/forum.ts
export interface Forum {
  id: string;
  name: string;
  description: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: string;
  forumId: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  category: string;
  isSticky: boolean;
  isLocked: boolean;
  isRemoved?: boolean;
  views: number;
  likes: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Reply {
  id: string;
  topicId: string;
  content: string;
  author: string;
  authorId: string;
  likes: number;
  isRemoved?: boolean;
  parentReplyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Flag {
  id: string;
  contentId: string;
  contentType: "topic" | "reply";
  reporterId: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface UserForumStats {
  userId: string;
  username: string;
  topicsCreated: number;
  repliesCreated: number;
  likesReceived: number;
  lastActive: string;
}
