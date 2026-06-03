import React, { useState, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import MoleculeViewer from './components/MoleculeViewer';
import InfoPanel from './components/InfoPanel';
import NLPInput from './components/NLPInput';
import { smartSearch } from './utils/pubchemApi';
import { parseNaturalLanguage } from './utils/nlpParser';
import './App.css';

/**
 * Molecule Studio - AI-driven 3D Chemical Molecular Visualization Tool
 * Main application component
 */
function App() {
  const [moleculeData, setMoleculeData] = useState(null);
  const [selectedAtom, setSelectedAtom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handle molecule search
   * @param {string} query - Search query (name, formula, or SMILES)
   * @param {string} inputMode - 'standard' or 'nlp'
   */
  const handleSearch = useCallback(async (query, inputMode = 'standard') => {
    setIsLoading(true);
    setError(null);
    setSelectedAtom(null);

    try {
      let searchQuery = query;

      // If NLP mode, parse natural language first
      if (inputMode === 'nlp') {
        const parseResult = await parseNaturalLanguage(query);
        if (!parseResult.success) {
          throw new Error(parseResult.error || 'Failed to parse natural language query');
        }
        // Use molecule name or SMILES from parsed result
        searchQuery = parseResult.moleculeName || parseResult.smiles || query;
      }

      // Search for molecule
      const result = await smartSearch(searchQuery);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch molecule data');
      }

      setMoleculeData(result.data);
    } catch (err) {
      setError(err.message);
      setMoleculeData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handle NLP parsing result
   * @param {Object} parsedResult - Parsed molecule data
   */
  const handleNLPParsed = useCallback((parsedResult) => {
    // Use the parsed molecule name to search
    const searchQuery = parsedResult.moleculeName || parsedResult.smiles;
    if (searchQuery) {
      handleSearch(searchQuery, 'standard');
    }
  }, [handleSearch]);

  /**
   * Handle atom selection
   * @param {Object} atomData - Selected atom data
   */
  const handleAtomSelect = useCallback((atomData) => {
    setSelectedAtom(atomData);
  }, []);

  /**
   * Handle atom deselection
   */
  const handleAtomDeselect = useCallback(() => {
    setSelectedAtom(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🧬</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Molecule Studio</h1>
              <p className="text-gray-600 text-sm">AI-driven 3D Chemical Molecular Visualization & Modeling</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          <NLPInput onParsed={handleNLPParsed} isLoading={isLoading} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <p className="text-red-700 font-semibold">Error</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Main Layout: 3D Viewer + Info Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3D Molecule Viewer */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-96 lg:h-[600px]">
                {moleculeData ? (
                  <MoleculeViewer
                    moleculeData={moleculeData}
                    onAtomSelect={handleAtomSelect}
                    onAtomDeselect={handleAtomDeselect}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🔍</div>
                      <p className="text-gray-600 font-semibold">Search for a molecule to visualize</p>
                      <p className="text-gray-500 text-sm mt-2">
                        Try: Amoxicillin, Caffeine, H2O, or use natural language
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Information Panel */}
          <div className="lg:col-span-1">
            <InfoPanel
              moleculeData={moleculeData}
              selectedAtom={selectedAtom}
              onAtomDeselect={handleAtomDeselect}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📖 How to Use</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Standard Search</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Enter a chemical name (e.g., Amoxicillin, Caffeine)</li>
                <li>Enter a molecular formula (e.g., C16H19N3O5S, H2O)</li>
                <li>Enter a SMILES string for advanced users</li>
                <li>Click "Visualize" to generate 3D model</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Natural Language (AI)</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Describe molecules naturally (e.g., "water molecule")</li>
                <li>AI converts your query to searchable format</li>
                <li>Supports multiple languages and descriptions</li>
                <li>Requires SiliconFlow API key configuration</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-2">Interaction Controls</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li><strong>Left Mouse Drag:</strong> Rotate molecule</li>
              <li><strong>Right Mouse Drag:</strong> Pan view</li>
              <li><strong>Mouse Wheel:</strong> Zoom in/out</li>
              <li><strong>Click Atom:</strong> View element details</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-600 text-sm">
          <p>Molecule Studio © 2026 | Powered by React, Three.js, and PubChem API</p>
          <p className="mt-2">
            Data source:{' '}
            <a href="https://pubchem.ncbi.nlm.nih.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              PubChem Database
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
