import React, { useRef, useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  X,
  Image,
  Loader2,
  Plus,
  Trash2,
  FileArchive,
  AlertCircle,
} from "lucide-react";
import type { CreateProjectDTO } from "../../interface/project.dto";
import { toast } from "react-hot-toast";
import { useUploadStore } from "../../store/upload.store";
import type { CloudinaryUploadOptions } from "../../interface/cloudinary.interface";

interface ProjectModalProps {
  open: boolean;
  isEditing: boolean;
  initialData?: CreateProjectDTO;
  onClose: () => void;
  onSubmit: (data: CreateProjectDTO) => Promise<{ success: boolean }>;
  isSubmitting?: boolean;
}

const ProjectModal = ({
  initialData,
  open,
  onClose,
  onSubmit,
  isEditing = false,
  isSubmitting = false,
}: ProjectModalProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const getSignature = useUploadStore((state) => state.getSignature);
  const uploadImage = useUploadStore((state) => state.upload);

  const userId = "00000000-0000-0000-0000-000000000001";

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    reset,
    setValue,
    watch,
    control,
  } = useForm<CreateProjectDTO>({
    defaultValues: {
      ownerId: userId,
      status: "DRAFT",
      techStack: [],
      links: [{ type: "SOURCE_CODE", url: "" }],
      content: null,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "links",
  });

  const coverImage = watch("coverImage");

  // Populate form with initial data when editing
  useEffect(() => {
    if (isEditing && initialData) {
      reset({
        ...initialData,
        ownerId: userId,
        content: null,
        techStack: Array.isArray(initialData.techStack)
          ? (initialData.techStack.join(", ") as unknown as string[])
          : initialData.techStack,
      });

      if (initialData.coverImage) {
        setPreviewUrl(initialData.coverImage);
        setUploadedImageUrl(initialData.coverImage);
      }
      setZipFile(null);
    }
  }, [isEditing, initialData, reset, userId]);
  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      reset({
        ownerId: userId,
        status: "DRAFT",
        techStack: [],
        links: [{ type: "SOURCE_CODE", url: "" }],
        content: null,
      });
      setPreviewUrl(null);
      setUploadedImageUrl(null);
      setZipFile(null);
    }
  }, [open, reset, userId]);

  const uploadCoverImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      e.target.value = "";
      return;
    }

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPEG, PNG, GIF, WEBP, or SVG)");
      e.target.value = "";
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreviewUrl(dataUrl);
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsDataURL(file);

    // Get upload signature
    const signatureData = {
      folder: "portfolio_cms",
      resourceType: "image",
    } as CloudinaryUploadOptions;

    setIsUploading(true);

    try {
      const signature = await getSignature(signatureData);

      if (!signature) {
        toast.error("Failed to get upload signature");
        setIsUploading(false);
        return;
      }

      const res = await uploadImage(file, signature);

      if (res.success) {
        // Store the Cloudinary URL
        setUploadedImageUrl(res.url);
        // Update form with the Cloudinary URL
        setValue("coverImage", res.url, { shouldDirty: true });
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Failed to upload image");
        setPreviewUrl(null);
        setUploadedImageUrl(null);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
      setPreviewUrl(null);
      setUploadedImageUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleZipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "application/zip",
      "application/x-zip-compressed",
      "application/x-zip",
    ];
    if (!validTypes.includes(file.type) && !file.name.endsWith(".zip")) {
      toast.error("Please upload a valid .zip file");
      e.target.value = "";
      return;
    }

    // Validate file size (50MB max for zip)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size must be less than 50MB");
      e.target.value = "";
      return;
    }

    setZipFile(file);
    setValue("content", file.name);
  };

  const handleClose = () => {
    reset({
      ownerId: userId,
      status: "DRAFT",
      techStack: [],
      links: [{ type: "SOURCE_CODE", url: "" }],
      content: null,
    });
    setPreviewUrl(null);
    setUploadedImageUrl(null);
    setZipFile(null);
    onClose();
  };

  // Close on Escape. The latest handleClose lives in a ref so the listener
  // isn't re-subscribed on every render.
  const closeRef = useRef(handleClose);
  closeRef.current = handleClose;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        closeRef.current();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, isSubmitting]);

  // Format tech stack from comma-separated string to array
  const formatTechStack = (stack: string | undefined): string[] => {
    if (!stack) return [];
    return stack
      .split(",")
      .map((tech) => tech.trim())
      .filter((tech) => tech.length > 0);
  };

  const handleFormSubmit = async (data: CreateProjectDTO) => {
    const filteredLinks =
      data.links?.filter((link) => link.url && link.url.trim().length > 0) ??
      [];

    // Everything, normalised. Used as-is when creating.
    const fullData: CreateProjectDTO = {
      name: data.name,
      description: data.description,
      coverImage: uploadedImageUrl || data.coverImage,
      status: data.status || "DRAFT",
      techStack:
        typeof data.techStack === "string"
          ? formatTechStack(data.techStack as string)
          : data.techStack || [],
      links: filteredLinks,
      content: zipFile ?? null,
      ownerId: userId,
    };

    if (!fullData.coverImage || fullData.coverImage.startsWith("data:")) {
      toast.error("Please wait for image upload to complete");
      return;
    }

    let payload: Partial<CreateProjectDTO>;

    if (isEditing) {
      // Only the fields the user actually changed
      payload = Object.fromEntries(
        Object.keys(dirtyFields)
          .filter((key) => key !== "ownerId" && key !== "content")
          .map((key) => [key, fullData[key as keyof CreateProjectDTO]]),
      ) as Partial<CreateProjectDTO>;

      // The ZIP lives in state, not in the form, so check it separately
      if (zipFile) payload.content = zipFile;

      if (Object.keys(payload).length === 0) {
        toast("No changes to save");
        return;
      }
    } else {
      payload = {
        ...fullData,
        links: filteredLinks.length ? filteredLinks : undefined,
      };
    }

    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (key === "techStack" && Array.isArray(value)) {
        value.forEach((tech) => formData.append("techStack[]", String(tech)));
      } else if (key === "links" && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (key === "content" && value instanceof File) {
        formData.append(key, value);
      } else if (key !== "content") {
        formData.append(key, String(value));
      }
    });

    // Only clear the form on success. On failure, everything the user typed —
    // including which fields are "dirty" — is left in place so the modal stays
    // open, the diff-based payload above still works, and nothing is lost
    // unless the user explicitly closes the modal.
    const res = await onSubmit(formData as unknown as CreateProjectDTO);

    if (res.success) {
      reset({
        ownerId: userId,
        status: "DRAFT",
        techStack: [],
        links: [{ type: "SOURCE_CODE", url: "" }],
        content: null,
      });
      setPreviewUrl(null);
      setUploadedImageUrl(null);
      setZipFile(null);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        // Only close when the press starts on the backdrop itself, so selecting
        // text inside the modal and releasing outside doesn't dismiss it.
        if (e.target === e.currentTarget && !isSubmitting) handleClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        className="bg-surface-container-high rounded-xl border border-outline-variant/10 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            id="project-modal-title"
            className="font-heading text-headline-md font-bold text-on-surface"
          >
            {isEditing ? "Edit Project" : "Add New Project"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-surface-container/60 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} className="text-on-surface-variant" />
          </button>
        </div>

        {isEditing && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-start gap-3 shadow-sm">
            <div className="flex-shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm text-amber-800 dark:text-amber-200">
                Editing Existing Project
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5 leading-relaxed">
                Changes will overwrite the current data. Please upload a new zip
                file if you want to update the project files.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Project Name */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">
              Project Name
            </label>
            <input
              type="text"
              placeholder="My Awesome Project"
              className={`w-full bg-surface-container/50 border rounded-lg py-2.5 px-4 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 transition-colors ${
                errors.name
                  ? "border-red-500/50 focus:border-red-500/50"
                  : "border-outline-variant/20"
              }`}
              {...register("name", { required: "Project name is required" })}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief description of your project..."
              className="w-full bg-surface-container/50 border border-outline-variant/20 rounded-lg py-2.5 px-4 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 transition-colors resize-none"
              {...register("description")}
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">
              Cover Image
            </label>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={uploadCoverImage}
              accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
              className="hidden"
            />

            {/* Upload area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all hover:border-primary/50 ${
                previewUrl || coverImage
                  ? "border-primary/30 bg-primary/5"
                  : "border-outline-variant/20 bg-surface-container/30"
              } ${errors.coverImage ? "border-red-500/50" : ""}`}
            >
              {isUploading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <span className="ml-2 font-body text-sm text-on-surface-variant">
                    Uploading to Cloudinary...
                  </span>
                </div>
              ) : previewUrl || coverImage ? (
                <div className="relative">
                  <img
                    src={previewUrl || coverImage}
                    alt="Cover preview"
                    className="max-h-48 w-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                    <span className="text-white font-body text-sm">
                      Change image
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  <Image className="w-10 h-10 text-on-surface-variant/40 mx-auto mb-2" />
                  <p className="font-body text-sm text-on-surface-variant">
                    Click to upload cover image
                  </p>
                  <p className="font-mono text-[8px] uppercase tracking-widest text-on-surface-variant/30 mt-1">
                    JPEG, PNG, GIF, WEBP, SVG • Max 2MB
                  </p>
                </div>
              )}
            </div>

            {/* Hidden input for react-hook-form */}
            <input
              type="hidden"
              {...register("coverImage", {
                required: "Cover image is required",
              })}
            />

            {errors.coverImage && (
              <p className="mt-1 text-xs text-red-400">
                {errors.coverImage.message}
              </p>
            )}
          </div>

          {/* ZIP File Attachment */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">
              Project Files (ZIP){" "}
              {isEditing && (
                <span className="text-xs text-on-surface-variant/40">
                  (optional - upload to update)
                </span>
              )}
            </label>

            {/* Hidden file input for ZIP */}
            <input
              type="file"
              ref={zipInputRef}
              onChange={handleZipUpload}
              accept=".zip,application/zip"
              className="hidden"
            />

            {/* Upload area for ZIP */}
            <div
              onClick={() => zipInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all hover:border-primary/50 ${
                zipFile
                  ? "border-primary/30 bg-primary/5"
                  : "border-outline-variant/20 bg-surface-container/30"
              }`}
            >
              {zipFile ? (
                <div className="relative">
                  <div className="flex items-center justify-center gap-3 py-2">
                    <FileArchive className="w-8 h-8 text-primary" />
                    <div className="text-left">
                      <p className="font-body text-sm text-on-surface">
                        {zipFile.name}
                      </p>
                      <p className="font-mono text-[10px] text-on-surface-variant/60">
                        {(zipFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                    <span className="text-white font-body text-sm">
                      Change file
                    </span>
                  </div>
                </div>
              ) : isEditing ? (
                <div className="py-4">
                  <FileArchive className="w-10 h-10 text-on-surface-variant/20 mx-auto mb-2" />
                  <p className="font-body text-sm text-on-surface-variant/60">
                    No new file selected
                  </p>
                  <p className="font-body text-xs text-on-surface-variant/40 mt-1">
                    Click to upload a new ZIP file (optional)
                  </p>
                </div>
              ) : (
                <div className="py-4">
                  <FileArchive className="w-10 h-10 text-on-surface-variant/40 mx-auto mb-2" />
                  <p className="font-body text-sm text-on-surface-variant">
                    Click to upload ZIP file
                  </p>
                  <p className="font-mono text-[8px] uppercase tracking-widest text-on-surface-variant/30 mt-1">
                    ZIP • Max 50MB
                  </p>
                </div>
              )}
            </div>

            {/* Hidden input for react-hook-form */}
            <input type="hidden" {...register("content")} />
          </div>

          {/* Status */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">
              Status
            </label>
            <select
              className="w-full bg-surface-container/50 border border-outline-variant/20 rounded-lg py-2.5 px-4 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
              {...register("status")}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {/* Tech Stack */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">
              Tech Stack (comma separated)
            </label>
            <input
              type="text"
              placeholder="React, TypeScript, Node.js"
              className="w-full bg-surface-container/50 border border-outline-variant/20 rounded-lg py-2.5 px-4 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 transition-colors"
              {...register("techStack")}
            />
          </div>

          {/* Links */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60">
                Links
              </label>
              <button
                type="button"
                onClick={() => append({ type: "SOURCE_CODE", url: "" })}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <Plus size={14} />
                Add Link
              </button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 mb-2">
                <select
                  className="w-1/3 bg-surface-container/50 border border-outline-variant/20 rounded-lg py-2 px-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  {...register(`links.${index}.type`)}
                >
                  <option value="SOURCE_CODE">Source Code</option>
                  <option value="LIVE_DEMO">Live Demo</option>
                  <option value="DOCUMENTATION">Documentation</option>
                  <option value="OTHER">Other</option>
                </select>
                <input
                  type="url"
                  placeholder="https://..."
                  className="flex-1 bg-surface-container/50 border border-outline-variant/20 rounded-lg py-2 px-3 text-on-surface placeholder:text-on-surface-variant/40 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  {...register(`links.${index}.url`)}
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label="Remove link"
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  disabled={fields.length <= 1}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {errors.links && (
              <p className="mt-1 text-xs text-red-400">
                {errors.links.message}
              </p>
            )}
          </div>

          {/* Owner ID - Hidden field */}
          <input type="hidden" {...register("ownerId")} />

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-outline-variant/10">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-lg border border-outline text-on-surface font-heading text-sm transition-all hover:border-primary hover:text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading || !userId}
              className="flex-1 py-2.5 rounded-lg bg-primary text-on-primary font-heading text-sm transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                  ? "Update Project"
                  : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;