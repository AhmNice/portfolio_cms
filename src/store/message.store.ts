import { create } from "zustand";
import type { MessageDTO, MessageStatus } from "../interface/messages.dto";
import { handleRequest } from "../lib/request";
import api from "../lib/axios";

interface MessageStoreActions {
  getAllMessages: () => Promise<void>;
  getMessageById: (id: string) => Promise<MessageDTO | null>;
  updateMessageStatus: (
    id: string,
    status: MessageStatus,
  ) => Promise<MessageDTO | null>;
  deleteMessage: (id: string) => Promise<void>;
}
interface MessageStoreState {
  messages: MessageDTO[];
  loading: boolean;
  error: string | null;
}

const initialState: MessageStoreState = {
  messages: [],
  loading: false,
  error: null,
};

export const useMessageStore = create<MessageStoreState & MessageStoreActions>(
  (set, get) => ({
    ...initialState,
    getAllMessages: async () => {
      set({ loading: true, error: null });
      await handleRequest({
        request: async () => api.get("/messages"),
        onSuccess: (data) => {
          set({ messages: data.data as MessageDTO[], loading: false });
        },
        onError: (error) => {
          set({ loading: false, error: error?.response?.data?.message });
        },
        showToast: false,
      });
    },
    getMessageById: async (id: string) => {
      set({ loading: true, error: null });
      let message: MessageDTO | null = null;
      const currentMessage = get().messages.find((msg) => msg.id === id);
      if (currentMessage) {
        set({ loading: false });
        return currentMessage;
      }
      await handleRequest({
        request: async () => api.get(`/messages/${id}`),
        onSuccess: (data) => {
          message = data.data as MessageDTO;
          set({ loading: false });
        },
        onError: (error) => {
          set({ loading: false, error: error?.response?.data?.message });
        },
        showToast: false,
      });
      return message;
    },
    updateMessageStatus: async (id: string, status: MessageStatus) => {
      set({ loading: true, error: null });
      let updatedMessage: MessageDTO | null = null;
      await handleRequest({
        request: async () => api.put(`/messages/${id}`, { status }),
        onSuccess: (data) => {
          updatedMessage = data.data as MessageDTO;
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === id ? updatedMessage! : msg,
            ),
            loading: false,
          }));
        },
        onError: (error) => {
          set({ loading: false, error: error?.response?.data?.message });
        },
        showToast: false,
      });
      return updatedMessage;
    },
    deleteMessage: async (id: string) => {
      set({ loading: true, error: null });

      await handleRequest({
        request: async () => api.delete(`/messages/${id}`),
        onSuccess: () => {
          set((state) => ({
            messages: state.messages.filter((msg) => msg.id !== id),
            loading: false,
          }));
        },
        onError: (error) => {
          set({
            loading: false,
            error: error?.response?.data?.message ?? "Failed to delete message",
          });
        },
        showToast: false,
      });
    },
  }),
);
