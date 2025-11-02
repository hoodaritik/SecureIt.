import { getAppName } from '../config/app';

/**
 * Updates the document title dynamically
 * @param {string} pageTitle - Optional page-specific title
 */
export const setDocumentTitle = (pageTitle = '') => {
  const appName = getAppName();
  if (pageTitle) {
    document.title = `${pageTitle} - ${appName}`;
  } else {
    document.title = `${appName} - Password Manager`;
  }
};

