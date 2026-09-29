import Search from "../components/Search";
import { SearchProvider, useSearch } from "../context/searchContext";
import MainLayout from "../layout/MainLayout";
import { Plus, Calendar, Eye, Edit, Trash2 } from "lucide-react";
import { useArticleStore } from "../store/article.store";
import { useEffect, useState } from "react";
import type { ArticleDTO, CreateArticleDTO } from "../interface/article.dto";
import AddArticleModal from "../components/modal/ArticleModal";
import { useNavigate } from "react-router-dom";

const ArticleContent = ({ loading }: { loading: boolean }) => {
  const { data, searchResults, setData, setSearchResults } =
    useSearch<ArticleDTO>();
  const category = data.map((article) => article.category).filter(Boolean);
  const status = data.map((article) => article.status).filter(Boolean);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isSubmitting = useArticleStore((state) => state.loading);
  const createArticle = useArticleStore((state) => state.createArticle);
  const navigate = useNavigate();

  const handleCreateArticle = async (
    newArticle: CreateArticleDTO,
  ): Promise<{ success: boolean }> => {
    const res = await createArticle(newArticle);
    if (res.success) {
      setIsModalOpen(false);
    }
    return res;
  };
  // Update data when articles change
  useEffect(() => {
    if (data.length > 0) {
      setSearchResults(data);
    }
  }, [data, setSearchResults]);

  const formatDate = (date: string | Date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        <div className="shrink-0 border-b border-outline-variant/10 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-2xl lg:text-3xl font-bold text-on-surface">
                  Blog Content Management
                </h2>
              </div>
              <p className="font-body text-sm text-on-surface-variant max-w-2xl leading-relaxed">
                Manage your technical publications, draft new articles, and
                oversee the content lifecycle.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="shrink-0 cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-heading text-sm font-semibold transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:scale-95"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Create New Post</span>
            </button>
          </div>
        </div>

        <div className="py-4">
          <Search<any>
            categories={category.filter((c) => c !== undefined) as string[]}
            statuses={status.filter((s) => s !== undefined) as string[]}
            placeholder="Search articles..."
            searchFields={["title", "description", "tags"]}
          />
        </div>

        {/* Table Display */}
        <div className="flex-1 overflow-y-auto py-4">
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-sm text-on-surface-variant">
                  Loading articles...
                </p>
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-outline-variant/10">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant/10 bg-surface-container/30">
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-on-surface-variant/60">
                      Title
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-on-surface-variant/60">
                      Category
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-on-surface-variant/60">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-on-surface-variant/60">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        Created At
                      </div>
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-mono uppercase tracking-widest text-on-surface-variant/60">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((article, index) => (
                    <tr
                      key={article.id || index}
                      className="border-b border-outline-variant/5 hover:bg-surface-container/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-body text-sm font-medium text-on-surface">
                            {article.title}
                          </p>
                          <p className="font-body text-xs text-on-surface-variant/60 mt-0.5 line-clamp-1">
                            {article.excerpt}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {article.category && (
                          <span className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-full">
                            {article.category}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {article.status && (
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full ${
                              article.status === "PUBLISHED"
                                ? "bg-green-500/10 text-green-500"
                                : article.status === "DRAFT"
                                  ? "bg-yellow-500/10 text-yellow-500"
                                  : "bg-gray-500/10 text-gray-500"
                            }`}
                          >
                            {article.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-on-surface-variant/70">
                          <Calendar size={14} />
                          {formatDate(article.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                            aria-label="View article"
                            onClick={() => navigate(`/articles/${article.slug}`)}
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-50 text-on-surface-variant">
              <p className="text-lg font-medium">No articles found</p>
              <p className="text-sm mt-1">
                Create your first article to get started
              </p>
            </div>
          )}
        </div>
        <AddArticleModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateArticle}
          isSubmitting={isSubmitting}
        />
      </div>
    </MainLayout>
  );
};

const Article = () => {
  const articles = useArticleStore((state) => state.articles);
  const fetchArticles = useArticleStore((state) => state.fetchArticles);
  const loading = useArticleStore((state) => state.loading);
  const error = useArticleStore((state) => state.error);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return (
    <SearchProvider<any> initialData={articles}>
      <ArticleContent loading={loading} />
    </SearchProvider>
  );
};

export default Article;
