import { useEffect } from "react";
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  FolderKanban,
  Inbox,
  MessageCircle,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import { useArticleStore } from "../store/article.store";
import { useAuthStore } from "../store/auth.store";
import { useMessageStore } from "../store/message.store";
import { useProjectStore } from "../store/project.store";

const formatDate = (date: Date | string | null) => {
  if (!date) return "No date";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const projects = useProjectStore((state) => state.projects);
  const projectsLoading = useProjectStore((state) => state.loading);
  const fetchProjects = useProjectStore((state) => state.fetchProjects);
  const articles = useArticleStore((state) => state.articles);
  const articlesLoading = useArticleStore((state) => state.loading);
  const fetchArticles = useArticleStore((state) => state.fetchArticles);
  const messages = useMessageStore((state) => state.messages);
  const messagesLoading = useMessageStore((state) => state.loading);
  const fetchMessages = useMessageStore((state) => state.getAllMessages);

  useEffect(() => {
    void Promise.all([fetchProjects(), fetchArticles(), fetchMessages()]);
  }, [fetchArticles, fetchMessages, fetchProjects]);

  const publishedArticles = articles.filter(
    (article) => article.status === "PUBLISHED",
  );
  const publishedProjects = projects.filter(
    (project) => project.status === "PUBLISHED",
  );
  const unreadMessages = messages.filter(
    (message) => message.status === "UNREAD",
  );
  const recentMessages = [...messages]
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime(),
    )
    .slice(0, 4);
  const isLoading = projectsLoading || articlesLoading || messagesLoading;
  const firstName = user?.name?.split(" ")[0] || "there";

  const stats = [
    {
      label: "Published projects",
      value: publishedProjects.length,
      detail: `${projects.length} total in portfolio`,
      icon: FolderKanban,
      tone: "text-primary bg-primary/10",
      path: "/projects",
    },
    {
      label: "Published articles",
      value: publishedArticles.length,
      detail: `${articles.length} total in library`,
      icon: BookOpen,
      tone: "text-tertiary bg-tertiary/10",
      path: "/articles",
    },
    {
      label: "Unread messages",
      value: unreadMessages.length,
      detail: `${messages.length} conversations received`,
      icon: Inbox,
      tone: "text-secondary bg-secondary/10",
      path: "/messages",
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6 pb-8">
        <section className="relative overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-low px-5 py-6 sm:px-8 sm:py-8">
          <div className="pointer-events-none absolute -right-8 -top-16 h-48 w-48 rounded-full border-[24px] border-primary/10" />
          <div className="pointer-events-none absolute bottom-0 right-28 h-20 w-20 rounded-full bg-primary/10 blur-2xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                <Sparkles size={13} />
                Editorial overview
              </div>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
                Good to see you, {firstName}.
              </h2>
              <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-on-surface-variant sm:text-base">
                Keep your portfolio moving. Here is the latest pulse across your
                work, writing, and inbox.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/articles")}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-heading text-sm font-semibold text-on-primary transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20"
            >
              <Plus size={16} strokeWidth={2.5} />
              Write an article
            </button>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {stats.map(
            ({ label, value, detail, icon: Icon, tone, path }, index) => (
              <button
                key={label}
                type="button"
                onClick={() => navigate(path)}
                className="group flex min-h-32 flex-col justify-between rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-on-surface/5"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}
                  >
                    <Icon size={18} />
                  </span>
                  <ArrowUpRight
                    size={16}
                    className="text-on-surface-variant/40 transition group-hover:text-primary"
                  />
                </div>
                <div className="mt-5">
                  <p className="font-heading text-3xl font-bold text-on-surface">
                    {isLoading ? "-" : value}
                  </p>
                  <p className="mt-0.5 font-body text-sm font-medium text-on-surface">
                    {label}
                  </p>
                  <p className="mt-1 font-body text-xs text-on-surface-variant">
                    {detail}
                  </p>
                </div>
              </button>
            ),
          )}
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                  <TrendingUp size={13} />
                  Publishing pulse
                </p>
                <h3 className="mt-2 font-heading text-xl font-bold text-on-surface">
                  Your portfolio at a glance
                </h3>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary">
                Live data
              </span>
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <div className="rounded-lg bg-surface-container-low p-4">
                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <span>Projects published</span>
                  <CheckCircle2 size={15} className="text-primary" />
                </div>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <p className="font-heading text-3xl font-bold text-on-surface">
                    {publishedProjects.length}
                  </p>
                  <p className="font-mono text-xs text-on-surface-variant">
                    of {projects.length}
                  </p>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-outline-variant/20">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${projects.length ? (publishedProjects.length / projects.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div className="rounded-lg bg-surface-container-low p-4">
                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <span>Articles published</span>
                  <FileText size={15} className="text-tertiary" />
                </div>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <p className="font-heading text-3xl font-bold text-on-surface">
                    {publishedArticles.length}
                  </p>
                  <p className="font-mono text-xs text-on-surface-variant">
                    of {articles.length}
                  </p>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-outline-variant/20">
                  <div
                    className="h-full rounded-full bg-tertiary transition-all"
                    style={{
                      width: `${articles.length ? (publishedArticles.length / articles.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate("/projects")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/30 px-3 py-2 font-body text-xs font-medium text-on-surface-variant transition hover:border-primary/40 hover:text-primary"
              >
                Manage projects <ChevronRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => navigate("/articles")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/30 px-3 py-2 font-body text-xs font-medium text-on-surface-variant transition hover:border-primary/40 hover:text-primary"
              >
                Open article library <ChevronRight size={14} />
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-secondary">
                  <MessageCircle size={13} />
                  Inbox
                </p>
                <h3 className="mt-2 font-heading text-xl font-bold text-on-surface">
                  Recent messages
                </h3>
              </div>
              <button
                type="button"
                onClick={() => navigate("/messages")}
                className="font-body text-xs font-semibold text-primary hover:underline"
              >
                View all
              </button>
            </div>

            <div className="mt-5 divide-y divide-outline-variant/15">
              {recentMessages.length > 0 ? (
                recentMessages.map((message) => (
                  <button
                    key={message.id}
                    type="button"
                    onClick={() => navigate(`/messages/${message.id}`)}
                    className="group flex w-full items-center gap-3 py-3 text-left first:pt-0 last:pb-0"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-heading text-xs font-bold ${message.status === "UNREAD" ? "bg-primary/15 text-primary" : "bg-surface-container text-on-surface-variant"}`}
                    >
                      {message.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-3">
                        <span className="truncate font-body text-sm font-medium text-on-surface group-hover:text-primary">
                          {message.name}
                        </span>
                        <span className="shrink-0 font-mono text-[10px] text-on-surface-variant/60">
                          {formatDate(message.createdAt)}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate font-body text-xs text-on-surface-variant">
                        {message.subject}
                      </span>
                    </span>
                  </button>
                ))
              ) : (
                <div className="flex min-h-36 flex-col items-center justify-center text-center">
                  <Clock3 size={22} className="text-on-surface-variant/40" />
                  <p className="mt-3 font-body text-sm font-medium text-on-surface">
                    Your inbox is quiet
                  </p>
                  <p className="mt-1 font-body text-xs text-on-surface-variant">
                    New portfolio enquiries will appear here.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
