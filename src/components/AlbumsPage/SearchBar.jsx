/* eslint-disable no-unused-vars */
// components/AlbumsPage/components/SearchBar.js
import React, { useState, useEffect, useRef } from "react";
import { Search, X, Filter, ChevronDown } from "lucide-react";

const SearchBar = ({ onSearch, initialValue = "" }) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    searchInTitles: true,
    searchInDescriptions: true,
    searchInKeywords: true,
    searchInDates: false,
  });
  const filterRef = useRef(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounce search input
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm, filters);
      }
    }, 300);

    return () => {
      clearTimeout(debounceTimeout);
    };
  }, [searchTerm, filters, onSearch]);

  const handleClearSearch = () => {
    setSearchTerm("");
    if (onSearch) {
      onSearch("", filters);
    }
  };

  const toggleFilter = (filterName) => {
    setFilters({
      ...filters,
      [filterName]: !filters[filterName],
    });
  };

  return (
    <div className="w-full mb-4 sm:mb-6 relative">
      <div
        className={`relative transition-all duration-300 ${
          isFocused ? "transform scale-[1.01]" : ""
        }`}
      >
        {/* Background shadow on focus */}
        <div
          className={`absolute -inset-1 bg-[#7D5BC6]/10 rounded-xl blur-sm transition-opacity duration-300 ${
            isFocused ? "opacity-100" : "opacity-0"
          }`}
        ></div>

        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
            <Search
              size={18}
              className={`transition-colors duration-300 ${
                isFocused ? "text-[#7D5BC6]" : "text-gray-400"
              }`}
            />
          </div>

          <input
            type="text"
            placeholder="Search albums by name, keywords, or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-full bg-white text-gray-700 pl-10 sm:pl-12 pr-20 sm:pr-28 py-3 sm:py-4 rounded-xl border transition-all duration-300 focus:outline-none shadow-lg text-sm sm:text-base ${
              isFocused
                ? "border-[#7D5BC6] ring-2 ring-[#7D5BC6]/20 shadow-xl"
                : "border-gray-300 hover:border-gray-400"
            }`}
          />

          {/* Filter button */}
          <div
            className="absolute right-12 sm:right-16 inset-y-0 flex items-center"
            ref={filterRef}
          >
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 sm:p-2 rounded-full transition-colors duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center ${
                showFilters || Object.values(filters).some((v) => !v)
                  ? "bg-[#EDE4FF] text-[#7D5BC6]"
                  : "bg-transparent text-gray-400 hover:text-gray-600"
              }`}
              aria-label="Search filters"
            >
              <Filter size={16} sm:size={18} />
            </button>

            {/* Filter dropdown */}
            {showFilters && (
              <div className="absolute right-0 top-12 sm:top-14 z-50 w-56 sm:w-64 py-2 rounded-xl bg-white border border-gray-200 shadow-2xl animate-fadeIn">
                <div className="p-3">
                  <h4 className="text-black font-medium mb-2 border-b border-gray-200 pb-2 text-sm sm:text-base">
                    Search Filters
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between text-xs sm:text-sm text-gray-600 cursor-pointer hover:bg-[#EDE4FF] p-2 rounded-lg transition-colors">
                      <span>Search in album names</span>
                      <div
                        className={`relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          filters.searchInTitles
                            ? "bg-[#7D5BC6]"
                            : "bg-gray-300"
                        }`}
                        onClick={() => toggleFilter("searchInTitles")}
                      >
                        <span
                          className={`pointer-events-none relative inline-block h-3 w-3 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                            filters.searchInTitles
                              ? "translate-x-4"
                              : "translate-x-0"
                          }`}
                        >
                          {filters.searchInTitles && (
                            <span className="absolute inset-0 flex h-full w-full items-center justify-center text-[#7D5BC6] scale-75">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                className="w-3 h-3"
                              >
                                <path
                                  d="M5 13L9 17L19 7"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                          )}
                        </span>
                      </div>
                    </label>
                    <label className="flex items-center justify-between text-xs sm:text-sm text-gray-600 cursor-pointer hover:bg-[#EDE4FF] p-2 rounded-lg transition-colors">
                      <span>Search in descriptions</span>
                      <div
                        className={`relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          filters.searchInDescriptions
                            ? "bg-[#7D5BC6]"
                            : "bg-gray-300"
                        }`}
                        onClick={() => toggleFilter("searchInDescriptions")}
                      >
                        <span
                          className={`pointer-events-none relative inline-block h-3 w-3 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                            filters.searchInDescriptions
                              ? "translate-x-4"
                              : "translate-x-0"
                          }`}
                        >
                          {filters.searchInDescriptions && (
                            <span className="absolute inset-0 flex h-full w-full items-center justify-center text-[#7D5BC6] scale-75 ">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                className="w-3 h-3"
                              >
                                <path
                                  d="M5 13L9 17L19 7"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                          )}
                        </span>
                      </div>
                    </label>
                    <label className="flex items-center justify-between text-xs sm:text-sm text-gray-600 cursor-pointer hover:bg-[#EDE4FF] p-2 rounded-lg transition-colors">
                      <span>Search in keywords</span>
                      <div
                        className={`relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          filters.searchInKeywords
                            ? "bg-[#7D5BC6]"
                            : "bg-gray-300"
                        }`}
                        onClick={() => toggleFilter("searchInKeywords")}
                      >
                        <span
                          className={`pointer-events-none relative inline-block h-3 w-3 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                            filters.searchInKeywords
                              ? "translate-x-4"
                              : "translate-x-0"
                          }`}
                        >
                          {filters.searchInKeywords && (
                            <span className="absolute inset-0 flex h-full w-full items-center justify-center text-[#7D5BC6] scale-75">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                className="w-3 h-3"
                              >
                                <path
                                  d="M5 13L9 17L19 7"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                          )}
                        </span>
                      </div>
                    </label>
                    <label className="flex items-center justify-between text-xs sm:text-sm text-gray-600 cursor-pointer hover:bg-[#EDE4FF] p-2 rounded-lg transition-colors">
                      <span>Search in dates</span>
                      <div
                        className={`relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          filters.searchInDates ? "bg-[#7D5BC6]" : "bg-gray-300"
                        }`}
                        onClick={() => toggleFilter("searchInDates")}
                      >
                        <span
                          className={`pointer-events-none relative inline-block h-3 w-3 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                            filters.searchInDates
                              ? "translate-x-4"
                              : "translate-x-0"
                          }`}
                        >
                          {filters.searchInDates && (
                            <span className="absolute inset-0 flex h-full w-full items-center justify-center text-[#7D5BC6] scale-75">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                className="w-3 h-3"
                              >
                                <path
                                  d="M5 13L9 17L19 7"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                          )}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Clear button */}
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 sm:right-4 inset-y-0 flex items-center p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors min-h-[44px] min-w-[44px] justify-center"
              aria-label="Clear search"
            >
              <X size={16} sm:size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Search filters chips/tags (visible when filters are applied) */}
      {Object.entries(filters).some(([key, value]) => !value) && (
        <div className="flex items-center flex-wrap mt-5 gap-2">
          <span className="text-xs text-gray-500">Searching in:</span>
          {filters.searchInTitles && (
            <span className="text-xs bg-[#7D5BC6] text-white px-2 py-1 rounded-full shadow-sm">
              Album names
            </span>
          )}
          {filters.searchInDescriptions && (
            <span className="text-xs bg-[#7D5BC6] text-white px-2 py-1 rounded-full shadow-sm">
              Descriptions
            </span>
          )}
          {filters.searchInKeywords && (
            <span className="text-xs bg-[#7D5BC6] text-white px-2 py-1 rounded-full shadow-sm">
              Keywords
            </span>
          )}
          {filters.searchInDates && (
            <span className="text-xs bg-[#7D5BC6] text-white px-2 py-1 rounded-full shadow-sm">
              Dates
            </span>
          )}
          {!filters.searchInTitles &&
            !filters.searchInDescriptions &&
            !filters.searchInKeywords &&
            !filters.searchInDates && (
              <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full shadow-sm">
                No filters selected
              </span>
            )}
        </div>
      )}

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SearchBar;
