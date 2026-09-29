import { useEffect, useState } from "react";
import MainLayout from "../layout/MainLayout";
import { Plus, Folder, Loader2 } from "lucide-react";
import { useProjectStore } from "../store/project.store";
import FeaturedCard from "../components/card/Featured_card";
import ProjectModal from "../components/modal/ProjectModal";
import type { CreateProjectDTO } from "../interface/project.dto";

const Projects = () => {
  const projects = useProjectStore((state) => state.projects);
  const loading = useProjectStore((state) => state.loading);
  const fetchProjects = useProjectStore((state) => state.fetchProjects);
  const createProject = useProjectStore((state) => state.createProject);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (
    data: CreateProjectDTO,
  ): Promise<{ success: boolean }> => {
    setIsSubmitting(true);
    try {
      const res = await createProject(data);

      if (res.success) {
        await fetchProjects();
        setIsModalOpen(false);
      }

      return { success: res.success };
    } catch (error) {
      console.error("Failed to create project:", error);
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* Header Section - Fixed */}
        <div className="shrink-0 border-b border-outline-variant/10 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-2xl lg:text-3xl font-bold text-on-surface">
                  Portfolio Matrix
                </h2>
              </div>
              <p className="font-body text-sm text-on-surface-variant max-w-2xl leading-relaxed">
                Curate your public presence. Manage featured projects, update
                technical assets, and monitor engagement metrics across your
                active deployments.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-heading text-sm font-semibold transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:scale-95"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Content Section - Scrollable */}
        <div className="flex-1 overflow-y-auto py-4 -mx-4 px-4">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
                <Loader2 className="relative w-8 h-8 text-primary animate-spin" />
              </div>
              <span className="mt-3 font-body text-xs text-on-surface-variant font-medium">
                Loading projects...
              </span>
            </div>
          )}

          {/* Projects Grid */}
          {!loading && projects.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <FeaturedCard project={project} />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && projects.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 rounded-full bg-primary/5 blur-2xl" />
                <div className="relative p-4 rounded-2xl bg-surface-container/40 border border-outline-variant/10">
                  <Folder
                    size={40}
                    className="text-on-surface-variant/30"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
              <h3 className="font-heading text-xl font-bold text-on-surface mb-1.5">
                No Projects Yet
              </h3>
              <p className="font-body text-sm text-on-surface-variant max-w-sm leading-relaxed">
                Get started by creating your first project. Click the "New
                Project" button above to showcase your work.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary/10 text-primary font-heading text-sm font-semibold transition-all hover:bg-primary/20"
              >
                <Plus size={14} />
                Create First Project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Project Modal */}
      <ProjectModal
        isEditing={false}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
        isSubmitting={isSubmitting}
      />
    </MainLayout>
  );
};

export default Projects;
