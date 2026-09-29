import MainLayout from "../layout/MainLayout";
import {
  ArrowLeft,
  Calendar,
  Edit,
  FolderX,
  Loader2,
  Tag,
  Trash2,
  Eye,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useProjectStore } from "../store/project.store";
import { normalizeMarkdown } from "../util/markdownhelper";
import { MarkdownViewer } from "../components/Markdown";
import { useEffect, useState } from "react";
import ProjectModal from "../components/modal/ProjectModal";
import ConfirmModal from "../components/modal/ConfirmModal";
import type { CreateProjectDTO } from "../interface/project.dto";

const ProjectDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const project = useProjectStore((state) =>
    state.getProjectBySlug(slug || ""),
  );
  const updateProject = useProjectStore((state) => state.updateProject);
  const deleteProject = useProjectStore((state) => state.deleteProject);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    useProjectStore
      .getState()
      .fetchProjects()
      .finally(() => setIsLoading(false));
  }, [slug]);

  const formatTitle = (value: string) =>
    value
      ?.split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ") || "";

  const handleEditSubmit = async (
    formData: CreateProjectDTO,
  ): Promise<{ success: boolean }> => {
    if (!project) return { success: false };

    setIsSubmitting(true);
    try {
      const res = await updateProject(project.id, formData);

      if (res.success) {
        setIsEditing(false);
        await useProjectStore.getState().fetchProjects();
      }

      return { success: res.success };
    } catch (error) {
      console.error("Failed to update project:", error);
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!project) return;

    setIsDeleting(true);
    try {
      await deleteProject(project.id);
      navigate("/projects");
    } catch (error) {
      console.error("Failed to delete project:", error);
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
          <p className="font-body text-body-sm">Loading project…</p>
        </div>
      </MainLayout>
    );
  }

  if (!project) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
          <FolderX className="w-10 h-10 text-on-surface-variant/40" />
          <div>
            <p className="font-heading text-lg font-semibold text-on-surface">
              Project not found
            </p>
            <p className="font-body text-body-sm text-on-surface-variant mt-1">
              It may have been deleted or the link is out of date.
            </p>
          </div>
          <Link
            to="/projects"
            className="font-body text-sm text-primary hover:underline mt-2"
          >
            Back to projects
          </Link>
        </div>
      </MainLayout>
    );
  }

  const content = normalizeMarkdown(project.content);

  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        {/* Breadcrumb with Edit/Delete */}
        <div className="shrink-0 border-b border-outline-variant/10 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-2 text-sm min-w-0">
              <Link
                to="/projects"
                className="font-mono text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Projects
              </Link>
              <span className="text-on-surface-variant/30 flex-shrink-0">
                /
              </span>
              <span className="font-mono text-primary truncate">
                {formatTitle(slug || "")}
              </span>
            </div>

            <div className="flex-shrink-0 flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary font-heading text-sm font-semibold transition-all duration-300 hover:bg-primary/20 hover:shadow-lg hover:shadow-primary/10 active:scale-95"
              >
                <Edit size={16} strokeWidth={2} />
                <span>Edit Project</span>
              </button>

              <button
                onClick={() => setConfirmDeleteOpen(true)}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 font-heading text-sm font-semibold transition-all duration-300 hover:bg-red-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Project Content */}
        <div className="flex-1 overflow-y-auto py-6">
          <h1 className="font-heading font-bold text-headline-xl text-on-surface mb-4">
            {project.name}
          </h1>

          {/* Project Metadata */}
          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>{new Date(project.createdAt).toLocaleDateString()}</span>
            </div>

            {project.techStack && project.techStack.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Tag size={14} />
                <div className="flex gap-2">
                  {project.techStack.map((tech, index) => (
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
            {project.status && (
              <div className="flex items-center gap-1.5">
                <Eye size={14} />
                <span className="capitalize">{project.status}</span>
              </div>
            )}
          </div>

          {/* Markdown Content */}
          <MarkdownViewer content={content} />
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <ProjectModal
          open={isEditing}
          isEditing={true}
          onClose={() => setIsEditing(false)}
          onSubmit={handleEditSubmit}
          isSubmitting={isSubmitting}
          initialData={{
            name: project.name,
            description: project.description || "",
            coverImage: project.coverImage,
            status: project.status,
            techStack: project.techStack,
            links: project.links,
            content: project.content,
            ownerId: project.ownerId,
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        open={confirmDeleteOpen}
        variant="danger"
        title={`Delete "${project.name}"?`}
        description="This action can't be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </MainLayout>
  );
};

export default ProjectDetails;
