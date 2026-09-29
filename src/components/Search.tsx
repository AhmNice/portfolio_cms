import { useState } from 'react';
import { useSearch } from '../context/searchContext';

interface SearchProps {
  onSearch?: (query: string, category?: string, status?: string) => void;
  categories?: string[];
  statuses?: string[];
  placeholder?: string;
  searchFields?: string[];
}

const Search = <T extends Record<string, any>>({
  onSearch,
  categories = [],
  statuses = [],
  placeholder = "Search...",
  searchFields = ['name', 'title', 'description'],
}: SearchProps) => {
  const {
    searchQuery,
    setSearchQuery,
    data,
    setSearchResults,
    isSearching,
    setIsSearching,
  } = useSearch<T>();

  const [category, setCategory] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);

    if (onSearch) {
      onSearch(query, category, status);
    } else {
      // Default search logic - filter by specified fields
      const filtered = data.filter((item) => {
        let matchesQuery = true;
        let matchesCategory = true;
        let matchesStatus = true;

        if (query) {
          matchesQuery = searchFields.some((field: any) => {
            const value = item[field];
            return value && value.toString().toLowerCase().includes(query.toLowerCase());
          });
        }

        if (category) {
          matchesCategory = item.category === category || item.type === category;
        }

        if (status) {
          matchesStatus = item.status === status;
        }

        return matchesQuery && matchesCategory && matchesStatus;
      });

      setSearchResults(filtered);
    }
    setIsSearching(false);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    handleSearch(searchQuery);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    handleSearch(searchQuery);
  };

  const handleClear = () => {
    setSearchQuery("");
    setCategory("");
    setStatus("");
    setSearchResults(data);
    setIsSearching(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center justify-center p-3 bg-surface-container/30 rounded-xl border border-outline-variant/10">
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full sm:flex-1 px-4 py-2.5 bg-surface-container/50 border border-outline-variant/20 rounded-lg text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 transition-colors"
      />

      {categories.length > 0 && (
        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 bg-surface-container/50 border border-outline-variant/20 rounded-lg text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      )}

      {statuses.length > 0 && (
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 bg-surface-container/50 border border-outline-variant/20 rounded-lg text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
        >
          <option value="">All Status</option>
          {statuses.map((stat) => (
            <option key={stat} value={stat}>
              {stat}
            </option>
          ))}
        </select>
      )}

      {(searchQuery || category || status) && (
        <button
          onClick={handleClear}
          className="px-4 py-2.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors font-medium"
        >
          Clear
        </button>
      )}

      {isSearching && (
        <span className="text-sm text-on-surface-variant/60 animate-pulse">
          Searching...
        </span>
      )}
    </div>
  );
};

export default Search;