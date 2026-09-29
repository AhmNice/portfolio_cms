export const normalizeMarkdown = (content: string): string => {
  return content
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")

    .replace(/\\"/g, '"')

    .replace(/\\([\\`*_[\]{}()#+\-.!|>])/g, "$1");
};