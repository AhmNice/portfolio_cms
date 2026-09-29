// src/interface/message.dto.ts
export type MessageStatus = "UNREAD" | "READ" | "REPLIED" | "ARCHIVED";

export interface MessageDTO {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: Date;
}