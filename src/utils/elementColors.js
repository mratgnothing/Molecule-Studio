/**
 * CPK (Corey-Pauling-Koltun) Color Scheme for Elements
 * Standard color scheme used in molecular visualization
 * Includes atomic radius data for proper 3D representation
 */

export const ELEMENT_CONFIG = {
  H: { color: 0xFFFFFF, radius: 1.20, name: 'Hydrogen', atomicNumber: 1, mass: 1.008 },
  C: { color: 0x000000, radius: 1.70, name: 'Carbon', atomicNumber: 6, mass: 12.011 },
  N: { color: 0x3050F8, radius: 1.55, name: 'Nitrogen', atomicNumber: 7, mass: 14.007 },
  O: { color: 0xFF0D0D, radius: 1.52, name: 'Oxygen', atomicNumber: 8, mass: 15.999 },
  F: { color: 0x90E050, radius: 1.47, name: 'Fluorine', atomicNumber: 9, mass: 18.998 },
  P: { color: 0xFF7F00, radius: 1.80, name: 'Phosphorus', atomicNumber: 15, mass: 30.974 },
  S: { color: 0xFFFF30, radius: 1.80, name: 'Sulfur', atomicNumber: 16, mass: 32.06 },
  Cl: { color: 0x1FF01F, radius: 1.75, name: 'Chlorine', atomicNumber: 17, mass: 35.45 },
  Br: { color: 0xA62929, radius: 1.85, name: 'Bromine', atomicNumber: 35, mass: 79.904 },
  I: { color: 0x940094, radius: 1.98, name: 'Iodine', atomicNumber: 53, mass: 126.90 },
  Na: { color: 0xAB5CF2, radius: 2.27, name: 'Sodium', atomicNumber: 11, mass: 22.990 },
  K: { color: 0xC88033, radius: 2.75, name: 'Potassium', atomicNumber: 19, mass: 39.098 },
  Ca: { color: 0x3DFF00, radius: 2.31, name: 'Calcium', atomicNumber: 20, mass: 40.078 },
  Fe: { color: 0xFF6600, radius: 1.32, name: 'Iron', atomicNumber: 26, mass: 55.845 },
  Mg: { color: 0x55C000, radius: 1.73, name: 'Magnesium', atomicNumber: 12, mass: 24.305 },
  Zn: { color: 0x12C7D1, radius: 1.39, name: 'Zinc', atomicNumber: 30, mass: 65.38 },
  Cu: { color: 0xC88033, radius: 1.32, name: 'Copper', atomicNumber: 29, mass: 63.546 },
};

/**
 * Get element configuration by symbol
 * @param {string} symbol - Element symbol (e.g., 'C', 'H', 'O')
 * @returns {Object} Element configuration with color, radius, and metadata
 */
export const getElementConfig = (symbol) => {
  return ELEMENT_CONFIG[symbol] || {
    color: 0xCCCCCC,
    radius: 1.70,
    name: symbol,
    atomicNumber: 0,
    mass: 0,
  };
};

/**
 * Get color for element
 * @param {string} symbol - Element symbol
 * @returns {number} Hex color value
 */
export const getElementColor = (symbol) => {
  return getElementConfig(symbol).color;
};

/**
 * Get van der Waals radius for element (in Angstroms)
 * @param {string} symbol - Element symbol
 * @returns {number} Radius in Angstroms
 */
export const getElementRadius = (symbol) => {
  return getElementConfig(symbol).radius;
};

/**
 * Get element name
 * @param {string} symbol - Element symbol
 * @returns {string} Element full name
 */
export const getElementName = (symbol) => {
  return getElementConfig(symbol).name;
};

/**
 * Get atomic number
 * @param {string} symbol - Element symbol
 * @returns {number} Atomic number
 */
export const getAtomicNumber = (symbol) => {
  return getElementConfig(symbol).atomicNumber;
};

/**
 * Get relative atomic mass
 * @param {string} symbol - Element symbol
 * @returns {number} Relative atomic mass
 */
export const getAtomicMass = (symbol) => {
  return getElementConfig(symbol).mass;
};

/**
 * Scale radius for 3D visualization
 * @param {string} symbol - Element symbol
 * @param {number} scale - Scaling factor (default: 0.3)
 * @returns {number} Scaled radius
 */
export const getScaledRadius = (symbol, scale = 0.3) => {
  return getElementRadius(symbol) * scale;
};
