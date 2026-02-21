/**
 * Form helper utilities
 * Extracted from FormView.tsx for reusability
 */

/**
 * Gets the API base URL from the HTML base tag
 * @returns API URL string
 */
export const getApiUrl = (): string => {
  const baseName = document.querySelector('base')?.getAttribute('href') ?? '/';
  return `${baseName}server`;
};
