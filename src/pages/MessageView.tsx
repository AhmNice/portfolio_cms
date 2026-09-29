// src/pages/MessageView.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import {
  ArrowLeft,
  Mail,
  MailOpen,
  Reply,
  Archive,
  Trash2,
  Loader2,
  Copy,
  Check,
  Calendar,
  User,
  AtSign,
} from "lucide-react";
import type { MessageDTO, MessageStatus } from "../interface/messages.dto";
import { toast } from "react-hot-toast";
import { useMessageStore } from "../store/message.store.ts";

const MessageView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const getMessageById = useMessageStore((s) => s.getMessageById);
  const updateMessageStatus = useMessageStore((s) => s.updateMessageStatus);
  const deleteMessage = useMessageStore((s) => s.deleteMessage);
  const loading = useMessageStore((s) => s.loading);
  const error = useMessageStore((s) => s.error);

  const [message, setMessage] = useState<MessageDTO | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchMessage = async () => {
      if (!id) return;

      try {
        const found = await getMessageById(id);
        if (found) {
          setMessage(found);
          // Mark as read when opened
          if (found.status === "UNREAD") {
            await updateMessageStatus(id, "READ");
            setMessage({ ...found, status: "READ" });
          }
        }
      } catch (err) {
        console.error("Failed to fetch message:", err);
      }
    };

    fetchMessage();
  }, [id, getMessageById, updateMessageStatus]);

  const formatFullDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleCopyEmail = () => {
    if (!message) return;
    navigator.clipboard.writeText(message.email).then(() => {
      setCopied(true);
      toast.success("Email copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleStatusChange = async (status: MessageStatus) => {
    if (!message) return;
    try {
      await updateMessageStatus(message.id, status);
      setMessage({ ...message, status });
      toast.success(`Marked as ${status.toLowerCase()}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!message) return;
    try {
      await deleteMessage(message.id);
      toast.success("Message deleted");
      navigate("/messages");
    } catch {
      toast.error("Failed to delete message");
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

  // Loading State
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-on-surface-variant">
              Loading message...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error State
  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <h2 className="font-heading text-2xl font-bold text-on-surface mb-2">
            Something Went Wrong
          </h2>
          <p className="text-sm text-on-surface-variant mb-6">{error}</p>
          <Link
            to="/messages"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-heading text-sm font-semibold transition-all hover:bg-primary/90"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Messages
          </Link>
        </div>
      </MainLayout>
    );
  }

  // Not Found State
  if (!message) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <h2 className="font-heading text-2xl font-bold text-on-surface mb-2">
            Message Not Found
          </h2>
          <p className="text-sm text-on-surface-variant mb-6">
            The message you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/messages"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-heading text-sm font-semibold transition-all hover:bg-primary/90"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Messages
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        {/* Header with breadcrumb */}
        <div className="shrink-0 border-b border-outline-variant/10 pb-4">
          <div className="flex items-center gap-2 text-sm mb-3">
            <Link
              to="/messages"
              className="font-mono text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              messages
            </Link>
            <span className="text-on-surface-variant/30">/</span>
            <span className="font-mono text-primary truncate max-w-[200px]">
              {message.subject}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="space-y-1.5 min-w-0">
              <h1 className="font-heading text-xl lg:text-2xl font-bold text-on-surface">
                {message.subject}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {formatFullDate(message.createdAt)}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest border ${getStatusStyle(
                    message.status,
                  )}`}
                >
                  {message.status}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleStatusChange("REPLIED")}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-on-primary font-heading text-xs font-semibold transition-all hover:bg-primary/90"
              >
                <Reply size={14} />
                Reply
              </button>
              <button
                onClick={() => handleStatusChange("ARCHIVED")}
                className="p-2 rounded-lg border border-outline-variant/20 text-on-surface-variant hover:text-primary hover:border-primary/30 transition-colors"
                aria-label="Archive"
              >
                <Archive size={16} />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg border border-outline-variant/20 text-on-surface-variant hover:text-red-500 hover:border-red-500/30 transition-colors"
                aria-label="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="flex-1 overflow-y-auto py-6">
          <div className="max-w-3xl">
            {/* Sender Info Card */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-container/30 border border-outline-variant/10 mb-6">
              <div className="shrink-0 w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="font-heading font-semibold text-lg text-primary">
                  {message.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <User size={14} className="text-on-surface-variant/60" />
                  <p className="font-body text-sm font-semibold text-on-surface">
                    {message.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <AtSign size={14} className="text-on-surface-variant/60" />
                  <p className="font-mono text-xs text-on-surface-variant">
                    {message.email}
                  </p>
                  <button
                    onClick={handleCopyEmail}
                    className="p-1 rounded hover:bg-surface-container/60 text-on-surface-variant/40 hover:text-primary transition-colors"
                    aria-label="Copy email"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Message Body */}
            <div className="p-6 rounded-xl bg-surface-container/30 border border-outline-variant/10">
              <p className="font-body text-sm text-on-surface/90 leading-relaxed whitespace-pre-wrap">
                {message.message}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusChange("READ")}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-outline-variant/20 text-on-surface-variant hover:text-primary hover:border-primary/30 transition-colors text-xs font-medium"
              >
                <MailOpen size={14} />
                Mark as Read
              </button>
              <button
                onClick={() => handleStatusChange("UNREAD")}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-outline-variant/20 text-on-surface-variant hover:text-primary hover:border-primary/30 transition-colors text-xs font-medium"
              >
                <Mail size={14} />
                Mark as Unread
              </button>
              <a
                href={`mailto:${message.email}?subject=Re: ${message.subject}`}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-outline-variant/20 text-on-surface-variant hover:text-primary hover:border-primary/30 transition-colors text-xs font-medium"
              >
                <Reply size={14} />
                Reply via Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MessageView;
