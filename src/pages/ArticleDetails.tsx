import MainLayout from "../layout/MainLayout";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Edit,
  FolderX,
  Loader2,
  Tag,
  Trash2,
  Eye,
  Link2,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useArticleStore } from "../store/article.store";
import { normalizeMarkdown } from "../util/markdownhelper";
import { MarkdownViewer } from "../components/Markdown";
import { useEffect, useState } from "react";
import ArticleModal from "../components/modal/ArticleModal";
import ConfirmModal from "../components/modal/ConfirmModal";
import type { ArticleDTO, CreateArticleDTO } from "../interface/article.dto";
import ProjectList from "../components/modal/ProjectList";

// Single source of truth for turning a saved article into form/update data.
// Used to prefill the edit modal and to send updates (e.g. linking a project).
const toFormData = (article: ArticleDTO) => ({
  title: article.title,
  excerpt: article.excerpt || "",
  coverImage: article.coverImage,
  status: article.status,
  techStack: article.techStack,
  article: article.content,
  authorId: article.authorId,
  slug: article.slug,
  featured: article.featured,
  category: article.category || "",
  projectId: article.projectId || "",
});

const ArticleDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [linkProjectOpen, setLinkProjectOpen] = useState(false);
  const [isLinking, setIsLinking] = useState(false);

  const [article, setArticle] = useState<ArticleDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const getArticleBySlug = useArticleStore((state) => state.getArticleBySlug);
  const updateArticle = useArticleStore((state) => state.updateArticle);
  const deleteArticle = useArticleStore((state) => state.deleteArticle);

  const fetchArticle = async () => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getArticleBySlug(slug);
      if (result.success && result.data) {
        setArticle(result.data);
      } else {
        setArticle(null);
        setError(result.message || "Failed to fetch article.");
      }
    } catch (err) {
      setArticle(null);
      setError(err instanceof Error ? err.message : "Failed to fetch article.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const formatTitle = (value: string) =>
    value
      ?.split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ") || "";

  const handleEditSubmit = async (
    formData: CreateArticleDTO,
  ): Promise<{ success: boolean }> => {
    if (!article) return { success: false };

    setIsSubmitting(true);
    try {
      const res = await updateArticle(article.id, formData);

      if (res.success) {
        setIsEditing(false);
        // Refresh both the shared list and this page's own copy so the
        // edited title/content/status show immediately instead of stale data.
        await Promise.all([
          useArticleStore.getState().fetchArticles(),
          fetchArticle(),
        ]);
      }

      return { success: res.success };
    } catch (error) {
      console.error("Failed to update article:", error);
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkProject = async (projectId: string) => {
    if (!article) return;

    setIsLinking(true);
    try {
      await updateArticle(article.id, { ...toFormData(article), projectId });
      setLinkProjectOpen(false);
      // Same refresh as editing so the "Connect to Project" button
      // disappears and the shared list reflects the new link.
      await Promise.all([
        useArticleStore.getState().fetchArticles(),
        fetchArticle(),
      ]);
    } catch (error) {
      // Keep the modal open so the user can retry.
      console.error("Failed to link article to project:", error);
    } finally {
      setIsLinking(false);
    }
  };

  const handleDelete = async () => {
    if (!article) return;

    setIsDeleting(true);
    try {
      await deleteArticle(article.id);
      navigate("/articles");
    } catch (error) {
      console.error("Failed to delete article:", error);
    } finally {
      setIsDeleting(false);
      setConfirmDeleteOpen(false);
    }
  };

  // Still fetching - avoid flashing a "not found" state before data arrives.
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full gap-3 text-on-surface-variant">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="font-body text-body-sm">Loading article…</p>
        </div>
      </MainLayout>
    );
  }

  // A failed request (network/server error) is distinct from a genuine
  // 404 - show a retry path instead of implying the article doesn't exist.
  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
          <AlertCircle className="w-10 h-10 text-red-400/60" />
          <div>
            <p className="font-heading text-lg font-semibold text-on-surface">
              Couldn't load this article
            </p>
            <p className="font-body text-body-sm text-on-surface-variant mt-1">
              {error}
            </p>
          </div>
          <button
            onClick={fetchArticle}
            className="font-body text-sm text-primary hover:underline mt-2"
          >
            Try again
          </button>
        </div>
      </MainLayout>
    );
  }

  if (!article) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
          <FolderX className="w-10 h-10 text-on-surface-variant/40" />
          <div>
            <p className="font-heading text-lg font-semibold text-on-surface">
              Article not found
            </p>
            <p className="font-body text-body-sm text-on-surface-variant mt-1">
              It may have been deleted or the link is out of date.
            </p>
          </div>
          <Link
            to="/articles"
            className="font-body text-sm text-primary hover:underline mt-2"
          >
            Back to articles
          </Link>
        </div>
      </MainLayout>
    );
  }

  const content = normalizeMarkdown(article.content);

  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        {/* Breadcrumb with Edit/Delete */}
        <div className="shrink-0 border-b border-outline-variant/10 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-2 text-sm min-w-0">
              <Link
                to="/articles"
                className="font-mono text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Articles
              </Link>
              <span className="text-on-surface-variant/30 flex-shrink-0">
                /
              </span>
              <span className="font-mono text-primary truncate">
                {formatTitle(slug || "")}
              </span>
            </div>

            <div className="flex-shrink-0 flex items-center gap-2">
              {!article.projectId && (
                <button
                  onClick={() => setLinkProjectOpen(true)}
                  className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary font-heading text-sm font-semibold transition-all duration-300 hover:bg-primary/20 hover:shadow-lg hover:shadow-primary/10 active:scale-95"
                >
                  <Link2 size={16} strokeWidth={2} />
                  <span>Connect to Project</span>
                </button>
              )}
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center cursor-pointer gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary font-heading text-sm font-semibold transition-all duration-300 hover:bg-primary/20 hover:shadow-lg hover:shadow-primary/10 active:scale-95"
              >
                <Edit size={16} strokeWidth={2} />
                <span>Edit Article</span>
              </button>

              <button
                onClick={() => setConfirmDeleteOpen(true)}
                disabled={isDeleting}
                className="inline-flex items-center cursor-pointer gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 font-heading text-sm font-semibold transition-all duration-300 hover:bg-red-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} strokeWidth={2} />
                )}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="flex-1 overflow-y-auto py-6">
          <h1 className="font-heading font-bold text-headline-xl text-on-surface mb-4">
            {article.title}
          </h1>

          {/* Article Metadata */}
          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>{new Date(article.createdAt).toLocaleDateString()}</span>
            </div>

            {article.techStack && article.techStack.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Tag size={14} />
                <div className="flex gap-2">
                  {article.techStack.map((tech, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 rounded-full bg-surface-container/40 text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {article.status && (
              <div className="flex items-center gap-1.5">
                <Eye size={14} />
                <span className="capitalize">{article.status}</span>
              </div>
            )}
          </div>

          {/* Markdown Content */}
          <MarkdownViewer content={content} />
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <ArticleModal
          open={isEditing}
          isEditing={true}
          onClose={() => setIsEditing(false)}
          onSubmit={handleEditSubmit}
          isSubmitting={isSubmitting}
          initialData={toFormData(article)}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        open={confirmDeleteOpen}
        variant="danger"
        title={`Delete "${article.title}"?`}
        description="This action can't be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />

      {/* Link to Project */}
      <ProjectList
        open={linkProjectOpen}
        onClose={() => setLinkProjectOpen(false)}
        onLink={handleLinkProject}
        isSubmitting={isLinking}
      />
    </MainLayout>
  );
};

export default ArticleDetails;
