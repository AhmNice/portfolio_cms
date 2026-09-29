import { create } from "zustand";
import type { ArticleDTO, CreateArticleDTO } from "../interface/article.dto";
import { handleRequest } from "../lib/request";
import api from "../lib/axios";

interface ArticleState {
  loading: boolean;
  articles: ArticleDTO[];
  selectedArticle: ArticleDTO | null;
  error: string | null;
}

interface ResponseData<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

interface ArticleActions {
  fetchArticles: () => Promise<void>;
  getArticleBySlug: (slug: string) => Promise<ResponseData<ArticleDTO>>;
  createArticle: (
    data: CreateArticleDTO | FormData,
  ) => Promise<ResponseData<ArticleDTO>>;
  updateArticle: (
    articleId: string,
    data: Partial<CreateArticleDTO> | FormData,
  ) => Promise<ResponseData<ArticleDTO>>;
  deleteArticle: (articleId: string) => Promise<ResponseData>;
  clearSelectedArticle: () => void;
  reset: () => void;
}

const initialState: ArticleState = {
  loading: false,
  articles: [],
  selectedArticle: null,
  error: null,
};

export const useArticleStore = create<ArticleState & ArticleActions>(
  (set, get) => ({
    ...initialState,

    fetchArticles: async () => {
      set({ loading: true, error: null });

      await handleRequest({
        request: () => api.get("/articles"),
        onSuccess: (response) => {
          const articlesList = Array.isArray(response)
            ? response
            : response?.data || [];

          set({ articles: articlesList as ArticleDTO[], loading: false });
        },
        onError: (error) => {
          set({
            error:
              error.response?.data?.message ||
              error.message ||
              "Failed to fetch articles",
            loading: false,
          });
        },
        showToast: false,
      });
    },

    getArticleBySlug: async (slug: string) => {
      set({ loading: true, error: null });
      const response: ResponseData<ArticleDTO> = { success: false };

      const existingArticle = get().articles.find(
        (article) => article.slug === slug,
      );

      if (existingArticle) {
        set({ selectedArticle: existingArticle, loading: false });
        return {
          success: true,
          data: existingArticle,
        };
      }

      await handleRequest({
        request: () => api.get(`/articles/slug/${slug}`),
        onSuccess: (res) => {
          const articleData = (res.data || res) as ArticleDTO;
          response.success = true;
          response.data = articleData;

          set({ selectedArticle: articleData, loading: false });
        },
        onError: (error) => {
          response.success = false;
          response.message =
            error.response?.data?.message || "Failed to fetch article details";
          response.data = undefined;

          set({
            error: response.message,
            loading: false,
          });
        },
        showToast: false,
      });

      return response;
    },

    createArticle: async (data) => {
      set({ loading: true, error: null });
      const responsePayload: ResponseData<ArticleDTO> = { success: false };

      await handleRequest({
        request: () => api.post("/articles", data),
        onSuccess: async (res) => {
          responsePayload.success = true;
          responsePayload.data = (res.data || res) as ArticleDTO;
          await get().fetchArticles();
        },
        onError: (error) => {
          responsePayload.success = false;
          responsePayload.message =
            error.response?.data?.message || "Failed to create article";
          set({ error: responsePayload.message, loading: false });
        },
        showToast: true,
      });

      return responsePayload;
    },

    updateArticle: async (articleId, data) => {
      set({ loading: true, error: null });
      const responsePayload: ResponseData<ArticleDTO> = { success: false };

      await handleRequest({
        request: () => api.patch(`/articles/${articleId}`, data),
        onSuccess: (res) => {
          const updatedArticle = (res.data || res) as ArticleDTO;
          responsePayload.success = true;
          responsePayload.data = updatedArticle;

          set((state) => ({
            articles: state.articles.map((item) =>
              item.id === articleId ? { ...item, ...updatedArticle } : item,
            ),
            selectedArticle:
              state.selectedArticle?.id === articleId
                ? { ...state.selectedArticle, ...updatedArticle }
                : state.selectedArticle,
            loading: false,
          }));
        },
        onError: (error) => {
          responsePayload.success = false;
          responsePayload.message =
            error.response?.data?.message || "Failed to update article";
          set({ error: responsePayload.message, loading: false });
        },
        showToast: true,
      });

      return responsePayload;
    },

    deleteArticle: async (articleId: string) => {
      set({ loading: true, error: null });
      const responsePayload: ResponseData = { success: false };

      await handleRequest({
        request: () => api.delete(`/articles/${articleId}`),
        onSuccess: () => {
          responsePayload.success = true;

          set((state) => ({
            articles: state.articles.filter((item) => item.id !== articleId),
            selectedArticle:
              state.selectedArticle?.id === articleId
                ? null
                : state.selectedArticle,
            loading: false,
          }));
        },
        onError: (error) => {
          responsePayload.success = false;
          responsePayload.message =
            error.response?.data?.message || "Failed to delete article";
          set({ error: responsePayload.message, loading: false });
        },
        showToast: true,
      });

      return responsePayload;
    },

    clearSelectedArticle: () => set({ selectedArticle: null }),

    reset: () => set({ ...initialState }),
  }),
);
