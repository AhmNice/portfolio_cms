export type Status = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type LinkType = "SOURCE_CODE" | "LIVE_DEMO" | "DOCUMENTATION" | "OTHER";

import type { ArticleDTO } from "./article.dto.js";
import type { UserDTO } from "./user.dto.js";

// Link Interfaces
export interface ProjectLinkDTO {
  id?: string;
  type: LinkType;
  url: string;
}

export interface CreateProjectLinkInput {
  type: LinkType;
  url: string;
}

// DTOs for Project
export interface CreateProjectDTO {
  name: string;
  description?: string;
  coverImage: string;
  content: File | null | string;
  status?: Status;
  techStack: string[];
  links?: CreateProjectLinkInput[];
  ownerId?: string;
}

export interface UpdateProjectDTO {
  id: string;
  name?: string;
  description?: string;
  coverImage?: string;
  status?: Status;
  techStack?: string[];
  links?: CreateProjectLinkInput[];
}

export interface ProjectDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  content: string;
  coverImage: string;
  status: Status;
  techStack: string[];
  links: ProjectLinkDTO[];
  ownerId: string;
  createdAt: string; // ISO date string from API
  updatedAt: string; // ISO date string from API
}

// Extended DTOs with relations
export interface ArticleWithRelationsDTO extends ArticleDTO {
  author: UserDTO;
  project?: ProjectDTO | null;
}

export interface ProjectWithRelationsDTO extends ProjectDTO {
  owner: UserDTO;
  articles?: ArticleDTO[];
}

export interface UserWithRelationsDTO extends UserDTO {
  articles?: ArticleDTO[];
  projects?: ProjectDTO[];
}