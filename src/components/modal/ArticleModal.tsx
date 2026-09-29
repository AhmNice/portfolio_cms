import React, { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  X,
  Image,
  Loader2,
  Plus,
  Calendar,
  Tag,
  FileArchive,
  Sparkles,
  FileText,
} from "lucide-react";
import type { CreateArticleDTO } from "../../interface/article.dto";
import { toast } from "react-hot-toast";
import { useUploadStore } from "../../store/upload.store";
import type { CloudinaryUploadOptions } from "../../interface/cloudinary.interface";

interface AddArticleModalProps {
  open: boolean;
  onClose: () => void;
  initialData: CreateArticleDTO | null;
  onSubmit: (data: CreateArticleDTO) => Promise<{ success: boolean }>;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

const AddArticleModal = ({
  open,
  initialData,
  onClose,
  onSubmit,
  isSubmitting = false,
  isEditing = false,
}: AddArticleModalProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [techTags, setTechTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [zipFileName, setZipFileName] = useState<string>("");
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
  } = useForm<CreateArticleDTO>({
    defaultValues: {
      authorId: userId,
      status: "DRAFT",
      featured: false,
      techStack: [],
      article: "",
      excerpt: "",
    },
  });

  const coverImage = watch("coverImage");
  const title = watch("title");
  const status = watch("status");

  useEffect(() => {
    if (isEditing && initialData) {
      reset({
        ...initialData,
        article: null,
        authorId: userId,
      });

      if (initialData.coverImage) {
        setPreviewUrl(initialData.coverImage);
        setUploadedImageUrl(initialData.coverImage);
      }

      if (initialData.techStack) {
        setTechTags([...initialData.techStack]);
      }

      setZipFile(null);
      setZipFileName("");
    }
  }, [isEditing, initialData, reset, userId]);

  // Auto-generate slug from title.
  // When editing, keep the original slug unless the title was actually changed,
  // so an untouched article doesn't get a "changed" slug.
  useEffect(() => {
    if (!title) return;

    if (isEditing && !dirtyFields.title) {
      if (initialData?.slug) {
        setValue("slug", initialData.slug, { shouldDirty: true });
      }
      return;
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setValue("slug", slug, { shouldDirty: true });
  }, [title, setValue, isEditing, dirtyFields.title, initialData]);

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
      folder: "blog_cms",
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
        setUploadedImageUrl(res.url);
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
    setZipFileName(file.name);
    setValue("article", file.name);
    toast.success(`File "${file.name}" loaded successfully`);
  };

  const handleRemoveZip = () => {
    setZipFile(null);
    setZipFileName("");
    setValue("article", isEditing ? null : "");
    if (zipInputRef.current) {
      zipInputRef.current.value = "";
    }
  };

  const handleAddTag = () => {
    if (!currentTag.trim()) return;
    if (techTags.includes(currentTag.trim())) {
      toast.error("Tag already exists");
      return;
    }
    const newTags = [...techTags, currentTag.trim()];
    setTechTags(newTags);
    setValue("techStack", newTags, { shouldDirty: true });
    setCurrentTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = techTags.filter((tag) => tag !== tagToRemove);
    setTechTags(newTags);
    setValue("techStack", newTags, { shouldDirty: true });
  };

  const handleClose = () => {
    reset();
    setPreviewUrl(null);
    setUploadedImageUrl(null);
    setTechTags([]);
    setCurrentTag("");
    setZipFile(null);
    setZipFileName("");
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

  const formatTechStack = (stack: string | undefined): string[] => {
    if (!stack) return [];
    return stack
      .split(",")
      .map((tech) => tech.trim())
      .filter((tech) => tech.length > 0);
  };

  const handleFormSubmit = async (data: CreateArticleDTO) => {
    // Everything, normalised. Used as-is when creating.
    const submitData: CreateArticleDTO = {
      ...data,
      coverImage: uploadedImageUrl || data.coverImage,
      techStack:
        typeof data.techStack === "string"
          ? formatTechStack(data.techStack as string)
          : data.techStack || [],
      article: zipFile ? zipFileName : data.article,
      excerpt: data.excerpt || data.title?.slice(0, 150) + "...",
      authorId: userId,
    };

    if (!submitData.coverImage || submitData.coverImage.startsWith("data:")) {
      toast.error("Please wait for image upload to complete");
      return;
    }

    // A ZIP is only mandatory when creating; when editing it's optional
    if (!isEditing && !zipFile) {
      toast.error("Please upload a ZIP file for the article content");
      return;
    }

    let payload: Partial<CreateArticleDTO>;

    if (isEditing) {
      // Only the fields the user actually changed
      const dirtyKeys = Object.keys(dirtyFields).filter(
        (key) => !["authorId", "article", "techStack"].includes(key),
      );

      payload = Object.fromEntries(
        dirtyKeys.map((key) => [key, submitData[key as keyof CreateArticleDTO]]),
      ) as Partial<CreateArticleDTO>;

      // Tags live in state, so compare them against the original list directly
      const originalStack = initialData?.techStack ?? [];
      const stackChanged =
        techTags.length !== originalStack.length ||
        techTags.some((tag, i) => tag !== originalStack[i]);
      if (stackChanged) payload.techStack = submitData.techStack;

      // The ZIP lives in state too
      if (zipFile) payload.article = zipFileName;

      if (Object.keys(payload).length === 0) {
        toast("No changes to save");
        return;
      }
    } else {
      payload = submitData;
    }

    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (key === "techStack" && Array.isArray(value)) {
        value.forEach((tag) => formData.append("techStack[]", tag));
      } else if (key === "article" && zipFile) {
        formData.append("article", zipFile);
      } else {
        formData.append(key, String(value));
      }
    });

    const res = await onSubmit(formData as unknown as CreateArticleDTO);
    if (res.success) {
      reset();
      setPreviewUrl(null);
      setUploadedImageUrl(null);
      setTechTags([]);
      setCurrentTag("");
      setZipFile(null);
      setZipFileName("");
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
        aria-labelledby="article-modal-title"
        className="bg-surface-container-high rounded-xl border border-outline-variant/10 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            id="article-modal-title"
            className="font-heading text-headline-md font-bold text-on-surface"
          >
            {isEditing ? "Edit Article" : "Create New Article"}
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

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">
              Title *
            </label>
            <input
              type="text"
              placeholder="My Awesome Article"
              className={`w-full bg-surface-container/50 border rounded-lg py-2.5 px-4 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 transition-colors ${
                errors.title
                  ? "border-red-500/50 focus:border-red-500/50"
                  : "border-outline-variant/20"
              }`}
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-400">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">
              Slug (auto-generated)
            </label>
            <input
              type="text"
              placeholder="my-awesome-article"
              className="w-full bg-surface-container/30 border border-outline-variant/20 rounded-lg py-2.5 px-4 text-on-surface/70 placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 transition-colors cursor-not-allowed"
              {...register("slug")}
              disabled
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">
              Cover Image *
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={uploadCoverImage}
              accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
              className="hidden"
            />

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
                    Uploading...
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

          {/* Category */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">
              Category
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
              <input
                type="text"
                placeholder="Technology, Programming, Design..."
                className="w-full bg-surface-container/50 border border-outline-variant/20 rounded-lg py-2.5 pl-10 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 transition-colors"
                {...register("category")}
              />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">
              Excerpt (optional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-on-surface-variant/40" />
              <textarea
                rows={2}
                placeholder="A brief summary of your article..."
                className="w-full bg-surface-container/50 border border-outline-variant/20 rounded-lg py-2.5 pl-10 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                {...register("excerpt")}
              />
            </div>
            <p className="mt-1 text-[10px] text-on-surface-variant/40">
              If left empty, an excerpt will be auto-generated from the title
            </p>
          </div>

          {/* Tech Stack */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">
              Tech Stack
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="React, TypeScript..."
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 bg-surface-container/50 border border-outline-variant/20 rounded-lg py-2.5 px-4 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 transition-colors"
              />
              <button
                type="button"
                onClick={handleAddTag}
                aria-label="Add tag"
                className="px-4 py-2.5 cursor-pointer bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            {techTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {techTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      aria-label={`Remove ${tag}`}
                      className="hover:text-red-500 cursor-pointer transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Content - ZIP File Upload */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">
              Content (ZIP File) {isEditing ? "" : "*"}{" "}
              {isEditing && (
                <span className="text-xs text-on-surface-variant/40">
                  (optional - upload to replace)
                </span>
              )}
            </label>

            <input
              type="file"
              ref={zipInputRef}
              onChange={handleZipUpload}
              accept=".zip,application/zip"
              className="hidden"
            />

            <div
              onClick={() => zipInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all hover:border-primary/50 ${
                zipFile
                  ? "border-primary/30 bg-primary/5"
                  : "border-outline-variant/20 bg-surface-container/30"
              } ${errors.article ? "border-red-500/50" : ""}`}
            >
              {zipFile ? (
                <div className="relative">
                  <div className="flex items-center justify-center gap-4 py-2">
                    <FileArchive className="w-10 h-10 text-primary" />
                    <div className="text-left">
                      <p className="font-body text-sm font-medium text-on-surface">
                        {zipFileName}
                      </p>
                      <p className="font-mono text-[10px] text-on-surface-variant/60">
                        {(zipFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveZip();
                      }}
                      aria-label="Remove ZIP file"
                      className="p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer text-red-500 transition-colors"
                    >
                      <X size={18} />
                    </button>
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

            <input
              type="hidden"
              {...register("article", {
                required: isEditing ? false : "Content file is required",
              })}
            />

            {errors.article && (
              <p className="mt-1 text-xs text-red-400">
                {errors.article.message}
              </p>
            )}
          </div>

          {/* Status & Featured */}
          <div className="grid grid-cols-2 gap-4">
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

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">
                Featured
              </label>
              <div className="flex items-center gap-3 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    {...register("featured")}
                  />
                  <div className="w-11 h-6 bg-surface-container/50 border border-outline-variant/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:border-white"></div>
                </label>
                <span className="text-sm text-on-surface-variant">
                  Mark as featured
                </span>
              </div>
            </div>
          </div>

          {/* Project ID (optional) */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">
              Project ID (optional)
            </label>
            <input
              type="text"
              placeholder="Link to related project..."
              className="w-full bg-surface-container/50 border border-outline-variant/20 rounded-lg py-2.5 px-4 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 transition-colors"
              {...register("projectId")}
            />
          </div>

          {/* Published At (optional) - only show when status is PUBLISHED */}
          {status === "PUBLISHED" && (
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">
                Published Date (optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
                <input
                  type="datetime-local"
                  className="w-full bg-surface-container/50 border border-outline-variant/20 rounded-lg py-2.5 pl-10 pr-4 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                  {...register("publishedAt")}
                />
              </div>
            </div>
          )}

          {/* Hidden fields */}
          <input type="hidden" {...register("authorId")} />
          <input type="hidden" {...register("techStack")} />

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-outline-variant/10">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 cursor-pointer rounded-lg border border-outline text-on-surface font-heading text-sm transition-all hover:border-primary hover:text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="flex-1 py-2.5 cursor-pointer rounded-lg bg-primary text-on-primary font-heading text-sm transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEditing ? <>Updating...</> : <> Creating...</>}
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  {isEditing ? <>Update Article</> : <> Create Article</>}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddArticleModal;