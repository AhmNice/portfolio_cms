// src/pages/Messages.tsx
import { useState, useEffect } from "react";
import MainLayout from "../layout/MainLayout";
import {
  Mail,
  MailOpen,
  Archive,
  Reply,
  Search,
  Trash2,
  Loader2,
  Inbox,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { MessageDTO, MessageStatus } from "../interface/messages.dto";
import { toast } from "react-hot-toast";
import { useMessageStore } from "../store/message.store.ts";

const Messages = () => {
  const navigate = useNavigate();
  const messages = useMessageStore((s) => s.messages);
  const loading = useMessageStore((s) => s.loading);
  const error = useMessageStore((s) => s.error);
  const fetchMessages = useMessageStore((s) => s.getAllMessages);
  const deleteMessage = useMessageStore((s) => s.deleteMessage);

  const [filteredMessages, setFilteredMessages] = useState<MessageDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MessageStatus | "ALL">("ALL");

  // Fetch messages on mount
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Filter messages
  useEffect(() => {
    let filtered = [...messages];

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((msg) => msg.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (msg) =>
          msg.name.toLowerCase().includes(query) ||
          msg.email.toLowerCase().includes(query) ||
          msg.subject.toLowerCase().includes(query) ||
          msg.message.toLowerCase().includes(query)
      );
    }

    setFilteredMessages(filtered);
  }, [searchQuery, statusFilter, messages]);

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getStatusStyle = (status: MessageStatus) => {
    switch (status) {
      case "UNREAD":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "READ":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      case "REPLIED":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "ARCHIVED":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case "UNREAD":
        return <Mail size={14} />;
      case "READ":
        return <MailOpen size={14} />;
      case "REPLIED":
        return <Reply size={14} />;
      case "ARCHIVED":
        return <Archive size={14} />;
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteMessage(id);
      toast.success("Message deleted");
    } catch {
      toast.error("Failed to delete message");
    }
  };

  const statusCounts = {
    ALL: messages.length,
    UNREAD: messages.filter((m) => m.status === "UNREAD").length,
    READ: messages.filter((m) => m.status === "READ").length,
    REPLIED: messages.filter((m) => m.status === "REPLIED").length,
    ARCHIVED: messages.filter((m) => m.status === "ARCHIVED").length,
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="shrink-0 border-b border-outline-variant/10 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="space-y-1.5">
              <h2 className="font-heading text-2xl lg:text-3xl font-bold text-on-surface">
                Messages
              </h2>
              <p className="font-body text-sm text-on-surface-variant max-w-2xl leading-relaxed">
                Manage your inbox, respond to inquiries, and keep track of all
                communications.
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="shrink-0 py-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container/50 border border-outline-variant/20 rounded-lg py-2.5 pl-10 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 transition-colors text-sm"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as MessageStatus | "ALL")
                }
                className="bg-surface-container/50 border border-outline-variant/20 rounded-lg py-2.5 pl-10 pr-8 text-on-surface focus:outline-none focus:border-primary/50 transition-colors text-sm appearance-none cursor-pointer min-w-[180px]"
              >
                <option value="ALL">All Messages ({statusCounts.ALL})</option>
                <option value="UNREAD">Unread ({statusCounts.UNREAD})</option>
                <option value="READ">Read ({statusCounts.READ})</option>
                <option value="REPLIED">Replied ({statusCounts.REPLIED})</option>
                <option value="ARCHIVED">
                  Archived ({statusCounts.ARCHIVED})
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto pb-4">
          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-on-surface-variant">
                  Loading messages...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
              <p className="text-sm text-red-400 mb-4">{error}</p>
              <button
                onClick={() => fetchMessages()}
                className="px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          ) : filteredMessages.length > 0 ? (
            <div className="space-y-2">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => navigate(`/messages/${message.id}`)}
                  className={`group cursor-pointer flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 hover:border-primary/30 hover:bg-surface-container/40 ${
                    message.status === "UNREAD"
                      ? "bg-surface-container/50 border-outline-variant/20"
                      : "bg-surface-container/20 border-outline-variant/10"
                  }`}
                >
                  {/* Avatar */}
                  <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="font-heading font-semibold text-sm text-primary">
                      {message.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3
                          className={`font-body text-sm truncate ${
                            message.status === "UNREAD"
                              ? "font-semibold text-on-surface"
                              : "font-medium text-on-surface/80"
                          }`}
                        >
                          {message.name}
                        </h3>
                        <span className="text-xs text-on-surface-variant/50 truncate hidden sm:inline">
                          {message.email}
                        </span>
                      </div>
                      <span className="shrink-0 text-xs font-mono text-on-surface-variant/50">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>

                    <p
                      className={`text-sm mb-1 truncate ${
                        message.status === "UNREAD"
                          ? "font-medium text-on-surface"
                          : "text-on-surface/70"
                      }`}
                    >
                      {message.subject}
                    </p>

                    <p className="text-xs text-on-surface-variant/60 line-clamp-1">
                      {message.message}
                    </p>
                  </div>

                  {/* Status & Actions */}
                  <div className="shrink-0 flex items-center gap-2">
                    <span
                      className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest border ${getStatusStyle(
                        message.status
                      )}`}
                    >
                      {getStatusIcon(message.status)}
                      {message.status}
                    </span>
                    <button
                      onClick={(e) => handleDelete(message.id, e)}
                      className="p-1.5 rounded-lg text-on-surface-variant/40 hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Delete message"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
              <div className="p-5 rounded-2xl bg-surface-container/40 border border-outline-variant/10 mb-4">
                <Inbox className="w-12 h-12 text-on-surface-variant/30" />
              </div>
              <h3 className="font-heading text-xl font-bold text-on-surface mb-2">
                No Messages Found
              </h3>
              <p className="text-sm text-on-surface-variant max-w-sm">
                {searchQuery || statusFilter !== "ALL"
                  ? "Try adjusting your filters or search query."
                  : "You don't have any messages yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;