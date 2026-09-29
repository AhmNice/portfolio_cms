import { create } from "zustand";

import type { CreateProjectDTO, ProjectDTO } from "../interface/project.dto";
import { handleRequest } from "../lib/request";
import api from "../lib/axios";

interface ProjectState {
  loading: boolean;
  projects: ProjectDTO[];
  error: string | null;
}

interface ResponseData<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

interface ProjectActions {
  fetchProjects: () => Promise<void>;
  createProject: (data: CreateProjectDTO) => Promise<void>;
  getProjectBySlug: (slug: string) => ProjectDTO | null;
  updateProject: (
    id: string,
    data: CreateProjectDTO,
  ) => Promise<ResponseData<ProjectDTO>>;
  deleteProject: (id: string) => Promise<void>;
}

const initialState: ProjectState = {
  loading: false,
  projects: [],
  error: null,
};

export const useProjectStore = create<ProjectState & ProjectActions>(
  (set, get) => ({
    ...initialState,

    fetchProjects: async () => {
      set({ loading: true, error: null });

      await handleRequest({
        request: () => api.get("/projects"),

        onSuccess: (data) => {
          set({
            projects: data.data as ProjectDTO[],
            loading: false,
            error: null,
          });
        },

        onError: (error) => {
          set({
            loading: false,
            error: error.message,
          });
        },

        showToast: false,
      });
    },

    createProject: async (data: CreateProjectDTO) => {
      set({ loading: true, error: null });

      await handleRequest({
        request: () =>
          api.post("/projects", data, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }),

        onSuccess: (data) => {
          set({
            projects: [...get().projects, data.data as ProjectDTO],
            loading: false,
            error: null,
          });
        },

        onError: (error) => {
          set({
            loading: false,
            error: error.message,
          });
        },

        showToast: false,
      });
    },

    getProjectBySlug: (slug: string) => {
      return get().projects.find((project) => project.slug === slug) ?? null;
    },

    updateProject: async (id: string, data: CreateProjectDTO) => {
      console.log("Updating project with ID:", id, "and data:", data);
      const response: ResponseData<ProjectDTO> = { success: false };
      await handleRequest({
        request: () =>
          api.patch(`/projects/${id}`, data, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }),
        onSuccess: (data) => {
          response.success = true;
          response.data = data.data as ProjectDTO;
          response.message = "Project updated successfully";
          set({
            projects: get().projects.map((project) =>
              project.id === id ? (data.data as ProjectDTO) : project,
            ),
            loading: false,
            error: null,
          });
        },
        onError: (error) => {
          response.success = false;
          response.message =
            error.response?.data?.message || "Failed to update project";
          response.data = undefined;
          set({
            loading: false,
            error: response.message,
          });
        },
      });
      return response;
    },
    deleteProject: async (id: string) => {
      set({ loading: true, error: null });
      await handleRequest({
        request: () => api.delete(`/projects/${id}`),
        onSuccess: () => {
          set({
            projects: get().projects.filter((project) => project.id !== id),
            loading: false,
            error: null,
          });
        },
        onError: (error) => {
          set({
            loading: false,
            error: error.message,
          });
        },
        showToast: false,
      });
    },
  }),
);
