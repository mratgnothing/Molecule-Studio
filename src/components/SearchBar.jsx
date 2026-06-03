import React, { useState } from 'react';
import { isLLMConfigured } from '../utils/nlpParser';

/**
 * SearchBar Component
 * Provides input field for molecule search with support for:
 * - Chemical names (e.g., Amoxicillin)
 * - Molecular formulas (e.g., C16H19N3O5S)
 * - SMILES strings
 * - Natural language queries (if LLM configured)
 */
const SearchBar = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [inputMode, setInputMode] = useState('standard'); // 'standard' or 'nlp'
  const hasLLM = isLLMConfigured();

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query, inputMode);
      setQuery('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSearch();
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col gap-4">
        {/* Input Mode Toggle */}
        {hasLLM && (
          <div className="flex gap-2">
            <button
              onClick={() => setInputMode('standard')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                inputMode === 'standard'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Standard Input
            </button>
            <button
              onClick={() => setInputMode('nlp')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                inputMode === 'nlp'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Natural Language
            </button>
          </div>
        )}

        {/* Input Field */}
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              inputMode === 'nlp'
                ? 'e.g., "Show me water molecule" or "Draw ethanol structure"'
                : 'e.g., Amoxicillin, C16H19N3O5S, or CC(C)CC1=CC=C(C=C1)C(C)C'
            }
            disabled={isLoading}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading...
              </span>
            ) : (
              'Visualize'
            )}
          </button>
        </div>

        {/* Help Text */}
        <div className="text-sm text-gray-600">
          {inputMode === 'nlp' ? (
            <p>💡 Describe the molecule in natural language. AI will convert it to a searchable format.</p>
          ) : (
            <p>💡 Supported formats: Chemical name, Molecular formula, or SMILES string</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
