import React, { useState } from 'react';
import { parseNaturalLanguage, isLLMConfigured } from '../utils/nlpParser';

/**
 * NLPInput Component
 * Handles natural language query parsing and conversion to molecule identifiers
 * Provides feedback on parsing results
 */
const NLPInput = ({ onParsed, isLoading }) => {
  const [query, setQuery] = useState('');
  const [parseResult, setParseResult] = useState(null);
  const [parseLoading, setParseLoading] = useState(false);
  const [error, setError] = useState(null);

  const hasLLM = isLLMConfigured();

  if (!hasLLM) {
    return null;
  }

  const handleParse = async () => {
    if (!query.trim()) return;

    setParseLoading(true);
    setError(null);
    setParseResult(null);

    try {
      const result = await parseNaturalLanguage(query);

      if (result.success) {
        setParseResult(result);
        onParsed(result);
        setQuery('');
      } else {
        setError(result.error || 'Failed to parse query');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setParseLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !parseLoading && !isLoading) {
      handleParse();
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">🤖 Natural Language Query</h3>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="e.g., 'Show me caffeine molecule' or 'Draw the structure of aspirin'"
          disabled={parseLoading || isLoading}
          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
        />
        <button
          onClick={handleParse}
          disabled={parseLoading || isLoading || !query.trim()}
          className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {parseLoading ? (
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
              Parsing...
            </span>
          ) : (
            'Parse'
          )}
        </button>
      </div>

      {/* Parse Result */}
      {parseResult && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-4">
          <p className="text-sm text-green-700 font-semibold mb-2">✓ Parsed Successfully</p>
          <div className="space-y-2 text-sm text-gray-700">
            {parseResult.moleculeName && (
              <p>
                <span className="font-semibold">Molecule:</span> {parseResult.moleculeName}
              </p>
            )}
            {parseResult.formula && (
              <p>
                <span className="font-semibold">Formula:</span> {parseResult.formula}
              </p>
            )}
            {parseResult.smiles && (
              <p>
                <span className="font-semibold">SMILES:</span> <code className="bg-white px-2 py-1 rounded">{parseResult.smiles}</code>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
          <p className="text-sm text-red-700 font-semibold">✗ Error</p>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
        <p className="font-semibold mb-1">💡 Tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Describe molecules in natural language (e.g., "water", "caffeine", "aspirin")</li>
          <li>AI will automatically convert your query to a searchable format</li>
          <li>The parsed result will be used to fetch molecular data</li>
        </ul>
      </div>
    </div>
  );
};

export default NLPInput;
