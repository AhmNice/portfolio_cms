import React, { createContext, useContext, useState, useEffect } from "react";

interface SearchContextType<T> {
  searchResults: T[];
  data: T[];
  setData: (data: T[]) => void;
  setSearchResults: (results: T[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
}

const SearchContext = createContext<SearchContextType<any> | undefined>(
  undefined,
);

export const useSearch = <T,>() => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context as SearchContextType<T>;
};

export const SearchProvider = <T,>({
  children,
  initialData = [],
}: {
  children: React.ReactNode;
  initialData?: T[];
}) => {
  const [data, setData] = useState<T[]>(initialData);
  const [searchResults, setSearchResults] = useState<T[]>(initialData);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Sync state when initialData changes (e.g., after API fetch)
  useEffect(() => {
    setData(initialData);
    if (!searchQuery) {
      setSearchResults(initialData);
    }
  }, [initialData]);

  const value: SearchContextType<T> = {
    searchResults,
    setSearchResults,
    data,
    setData,
    searchQuery,
    setSearchQuery,
    isSearching,
    setIsSearching,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};