/**
 * PubChem API Integration
 * Fetches molecular structure data from PubChem REST API
 * Supports: chemical names, molecular formulas, and SMILES strings
 */

import axios from 'axios';

const PUBCHEM_BASE = import.meta.env.VITE_PUBCHEM_API_BASE || 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';

/**
 * Search for compound by name, formula, or SMILES
 * @param {string} query - Chemical name, formula, or SMILES string
 * @param {string} searchType - 'name', 'formula', or 'smiles'
 * @returns {Promise<Object>} Compound data with CID
 */
export const searchCompound = async (query, searchType = 'name') => {
  try {
    const url = `${PUBCHEM_BASE}/compound/${searchType}/${encodeURIComponent(query)}/JSON`;
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.data?.PC_Compounds?.length > 0) {
      return response.data.PC_Compounds[0];
    }
    throw new Error(`No compound found for: ${query}`);
  } catch (error) {
    throw new Error(`Failed to search compound: ${error.message}`);
  }
};

/**
 * Get compound 3D structure data
 * @param {number|string} cid - Compound ID
 * @returns {Promise<Object>} 3D structure data with atoms and bonds
 */
export const getCompound3DStructure = async (cid) => {
  try {
    const url = `${PUBCHEM_BASE}/compound/cid/${cid}/JSON?properties=IsomericSMILES,MolecularFormula,MolecularWeight`;
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.data?.PC_Compounds?.length > 0) {
      return response.data.PC_Compounds[0];
    }
    throw new Error(`Failed to fetch 3D structure for CID: ${cid}`);
  } catch (error) {
    throw new Error(`Failed to get 3D structure: ${error.message}`);
  }
};

/**
 * Parse compound data to extract atoms and bonds
 * @param {Object} compoundData - Raw compound data from PubChem
 * @returns {Object} Parsed structure with atoms, bonds, and metadata
 */
export const parseCompoundStructure = (compoundData) => {
  try {
    const atoms = [];
    const bonds = [];
    let totalAtoms = 0;
    let totalBonds = 0;

    // Extract atom information
    if (compoundData.atoms) {
      const atomData = compoundData.atoms;
      
      // Parse atom elements
      if (atomData.aid && atomData.element) {
        for (let i = 0; i < atomData.aid.length; i++) {
          atoms.push({
            id: atomData.aid[i],
            element: atomData.element[i],
            x: atomData.coords?.[0]?.x?.[i] || 0,
            y: atomData.coords?.[0]?.y?.[i] || 0,
            z: atomData.coords?.[0]?.z?.[i] || 0,
            charge: atomData.charge?.[i] || 0,
          });
        }
        totalAtoms = atoms.length;
      }
    }

    // Extract bond information
    if (compoundData.bonds) {
      const bondData = compoundData.bonds;
      
      if (bondData.aid1 && bondData.aid2) {
        for (let i = 0; i < bondData.aid1.length; i++) {
          bonds.push({
            from: bondData.aid1[i],
            to: bondData.aid2[i],
            type: bondData.type?.[i] || 1, // 1=single, 2=double, 3=triple
            stereo: bondData.stereo?.[i] || 0,
          });
        }
        totalBonds = bonds.length;
      }
    }

    // Extract metadata
    const props = compoundData.props || [];
    let molecularFormula = '';
    let molecularWeight = 0;
    let smiles = '';

    for (const prop of props) {
      if (prop.urn?.label === 'Molecular Formula') {
        molecularFormula = prop.value?.sval || '';
      }
      if (prop.urn?.label === 'Molecular Weight') {
        molecularWeight = prop.value?.fval || 0;
      }
      if (prop.urn?.label === 'SMILES') {
        smiles = prop.value?.sval || '';
      }
    }

    return {
      atoms,
      bonds,
      totalAtoms,
      totalBonds,
      molecularFormula,
      molecularWeight,
      smiles,
      cid: compoundData.id?.id?.cid,
    };
  } catch (error) {
    throw new Error(`Failed to parse compound structure: ${error.message}`);
  }
};

/**
 * Fetch and parse complete molecule data
 * @param {string} query - Chemical name, formula, or SMILES
 * @param {string} searchType - 'name', 'formula', or 'smiles'
 * @returns {Promise<Object>} Complete parsed molecule data
 */
export const fetchMoleculeData = async (query, searchType = 'name') => {
  try {
    // Search for compound
    const searchResult = await searchCompound(query, searchType);
    const cid = searchResult.id?.id?.cid;

    if (!cid) {
      throw new Error('Could not find compound CID');
    }

    // Get 3D structure
    const structureData = await getCompound3DStructure(cid);

    // Parse structure
    const parsedData = parseCompoundStructure(structureData);

    return {
      success: true,
      data: parsedData,
      cid,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Validate SMILES string format
 * @param {string} smiles - SMILES string
 * @returns {boolean} True if valid SMILES format
 */
export const isValidSMILES = (smiles) => {
  // Basic SMILES validation
  const smilesRegex = /^[A-Za-z0-9\[\]()=@#\-+\\\/]+$/;
  return smilesRegex.test(smiles);
};

/**
 * Detect input type (name, formula, or SMILES)
 * @param {string} input - User input
 * @returns {string} Detected type: 'name', 'formula', or 'smiles'
 */
export const detectInputType = (input) => {
  // Check if it looks like SMILES (contains special characters)
  if (/[=@#\[\]()\\\/+\-]/.test(input)) {
    return 'smiles';
  }

  // Check if it looks like a formula (contains numbers and specific pattern)
  if (/^[A-Z][a-z]?(\d+[A-Z][a-z]?)*\d*$/.test(input)) {
    return 'formula';
  }

  // Default to name search
  return 'name';
};

/**
 * Smart search - automatically detect input type and search
 * @param {string} query - User input
 * @returns {Promise<Object>} Molecule data
 */
export const smartSearch = async (query) => {
  const searchType = detectInputType(query);
  return fetchMoleculeData(query, searchType);
};
