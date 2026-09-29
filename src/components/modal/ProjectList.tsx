import { Check, FolderKanban, Loader2, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useProjectStore } from "../../store/project.store";
import type { ProjectDTO } from "../../interface/project.dto";


interface LinkProjectProps {
  open: boolean;
  onClose: () => void;
  /** Called with the chosen project's id when the user confirms. */
  onLink: (projectId: ProjectDTO["id"]) => void | Promise<void>;
  isSubmitting?: boolean;
}

const ProjectList = ({ open, onClose, onLink, isSubmitting }: LinkProjectProps) => {
  const projects = useProjectStore((s) => s.projects);
  const fetchProjects = useProjectStore((s) => s.fetchProjects);

  const [selectedId, setSelectedId] = useState<ProjectDTO["id"] | null>(null);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Reset state and load projects each time the modal opens.
  useEffect(() => {
    if (!open) return;

    setSelectedId(null);
    setQuery("");
    setHasError(false);

    if (projects.length > 0) return;

    let cancelled = false;
    setIsLoading(true);
    Promise.resolve(fetchProjects())
      .catch(() => !cancelled && setHasError(true))
      .finally(() => !cancelled && setIsLoading(false));

    return () => {
      cancelled = true;
    };
    // Only re-run when the modal opens, not whenever the list changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Escape to close, and lock page scroll behind the modal.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, isSubmitting, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? projects.filter((p) => p.name.toLowerCase().includes(q))
      : projects;
  }, [projects, query]);

  if (!open) return null;

  const handleConfirm = () => {
    if (selectedId !== null && !isSubmitting) onLink(selectedId);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        // Close only when the backdrop itself is clicked, not the modal.
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="link-project-name"
        className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-outline-variant/20 bg-surface-container-high shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
          <div>
            <h2
              id="link-project-name"
              className="font-heading text-headline-md font-bold text-on-surface"
            >
              Link article to project
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Choose the project this article belongs to.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="-mr-2 -mt-1 rounded-full p-2 text-on-surface-variant transition-colors hover:bg-on-surface/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pb-3">
          <div className="relative">
            <Search
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects"
              aria-label="Search projects"
              className="h-10 w-full rounded-full border border-outline-variant/40 bg-surface/60 pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Project list (this section scrolls, header and footer stay put) */}
        <div className="min-h-[12rem] flex-1 overflow-y-auto px-3">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center gap-2 text-sm text-on-surface-variant">
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              Loading projects…
            </div>
          ) : hasError ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-center text-sm text-on-surface-variant">
              <p>Couldn't load your projects.</p>
              <button
                type="button"
                onClick={() => {
                  setHasError(false);
                  setIsLoading(true);
                  Promise.resolve(fetchProjects())
                    .catch(() => setHasError(true))
                    .finally(() => setIsLoading(false));
                }}
                className="font-medium text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-48 items-center justify-center px-6 text-center text-sm text-on-surface-variant">
              {projects.length === 0
                ? "You don't have any projects yet."
                : `No projects match "${query}".`}
            </div>
          ) : (
            <ul role="radiogroup" aria-label="Projects" className="space-y-1 pb-2">
              {filtered.map((project) => {
                const isSelected = selectedId === project.id;
                return (
                  <li key={project.id}>
                    {/* Native radio (visually hidden) gives free arrow-key support */}
                    <label className="block cursor-pointer">
                      <input
                        type="radio"
                        name="project"
                        value={String(project.id)}
                        checked={isSelected}
                        onChange={() => setSelectedId(project.id)}
                        className="peer sr-only"
                      />
                      <div
                        className={`flex items-center gap-4 rounded-xl border p-3 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary/60 motion-reduce:transition-none ${
                          isSelected
                            ? "border-primary bg-primary/8"
                            : "border-transparent hover:bg-on-surface/6"
                        }`}
                      >
                        {project.coverImage ? (
                          <img
                            src={project.coverImage}
                            alt=""
                            loading="lazy"
                            className="h-14 w-20 shrink-0 rounded-lg bg-surface-container object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-surface-container text-on-surface-variant">
                            <FolderKanban size={22} aria-hidden="true" />
                          </div>
                        )}

                        <span className="min-w-0 flex-1 truncate font-medium text-on-surface">
                          {project.name}
                        </span>

                        <span
                          aria-hidden="true"
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                            isSelected
                              ? "border-primary bg-primary text-on-primary"
                              : "border-outline-variant"
                          }`}
                        >
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </span>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-outline-variant/20 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-on-surface/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedId === null || isSubmitting}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting && (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            )}
            {isSubmitting ? "Linking…" : "Link project"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectList;