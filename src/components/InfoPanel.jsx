import React, { useState } from 'react';

/**
 * InfoPanel Component
 * Displays molecular information and selected atom details
 * Shows: molecular formula, atom count, bond count, and atom properties
 */
const InfoPanel = ({ moleculeData, selectedAtom, onAtomDeselect }) => {
  const [expandedSection, setExpandedSection] = useState('molecule');

  if (!moleculeData) {
    return (
      <div className="w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <p className="text-lg font-semibold">No molecule loaded</p>
          <p className="text-sm mt-2">Search for a molecule to display information</p>
        </div>
      </div>
    );
  }

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      {/* Molecule Information Section */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection('molecule')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-800">Molecular Information</h3>
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform ${
              expandedSection === 'molecule' ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>

        {expandedSection === 'molecule' && (
          <div className="px-6 py-4 bg-gray-50 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="bg-white p-3 rounded-lg">
              <p className="text-xs text-gray-600 font-semibold uppercase">Molecular Formula</p>
              <p className="text-lg font-bold text-blue-600 mt-1 break-words">
                {moleculeData.molecularFormula || 'N/A'}
              </p>
            </div>

            <div className="bg-white p-3 rounded-lg">
              <p className="text-xs text-gray-600 font-semibold uppercase">Total Atoms</p>
              <p className="text-lg font-bold text-green-600 mt-1">{moleculeData.totalAtoms || 0}</p>
            </div>

            <div className="bg-white p-3 rounded-lg">
              <p className="text-xs text-gray-600 font-semibold uppercase">Total Bonds</p>
              <p className="text-lg font-bold text-orange-600 mt-1">{moleculeData.totalBonds || 0}</p>
            </div>

            <div className="bg-white p-3 rounded-lg">
              <p className="text-xs text-gray-600 font-semibold uppercase">Molecular Weight</p>
              <p className="text-lg font-bold text-purple-600 mt-1">
                {moleculeData.molecularWeight ? `${moleculeData.molecularWeight.toFixed(2)} g/mol` : 'N/A'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Selected Atom Information Section */}
      {selectedAtom && (
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('atom')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-800">Selected Atom Details</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAtomDeselect();
              }}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Deselect atom"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </button>

          {expandedSection === 'atom' && (
            <div className="px-6 py-4 bg-blue-50 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-gray-600 font-semibold uppercase">Element Symbol</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{selectedAtom.element}</p>
              </div>

              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-gray-600 font-semibold uppercase">Atomic Number</p>
                <p className="text-lg font-bold text-green-600 mt-1">{selectedAtom.atomicNumber || 'N/A'}</p>
              </div>

              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-gray-600 font-semibold uppercase">Atomic Mass</p>
                <p className="text-lg font-bold text-orange-600 mt-1">
                  {selectedAtom.mass ? selectedAtom.mass.toFixed(3) : 'N/A'}
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-gray-600 font-semibold uppercase">Atom ID</p>
                <p className="text-lg font-bold text-purple-600 mt-1">{selectedAtom.id}</p>
              </div>

              {selectedAtom.charge !== 0 && selectedAtom.charge !== undefined && (
                <div className="bg-white p-3 rounded-lg col-span-2 md:col-span-4">
                  <p className="text-xs text-gray-600 font-semibold uppercase">Charge</p>
                  <p className="text-lg font-bold text-red-600 mt-1">
                    {selectedAtom.charge > 0 ? '+' : ''}{selectedAtom.charge}
                  </p>
                </div>
              )}

              {selectedAtom.x !== undefined && selectedAtom.y !== undefined && selectedAtom.z !== undefined && (
                <div className="bg-white p-3 rounded-lg col-span-2 md:col-span-4">
                  <p className="text-xs text-gray-600 font-semibold uppercase">Coordinates (Å)</p>
                  <p className="text-sm font-mono text-gray-700 mt-1">
                    X: {selectedAtom.x.toFixed(3)}, Y: {selectedAtom.y.toFixed(3)}, Z: {selectedAtom.z.toFixed(3)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SMILES Information */}
      {moleculeData.smiles && (
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('smiles')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-800">SMILES String</h3>
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform ${
                expandedSection === 'smiles' ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>

          {expandedSection === 'smiles' && (
            <div className="px-6 py-4 bg-gray-50">
              <p className="text-sm font-mono bg-white p-3 rounded-lg break-all text-gray-700">
                {moleculeData.smiles}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InfoPanel;
