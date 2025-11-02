import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { setDocumentTitle } from '../utils/documentTitle';

/**
 * Component to handle dynamic document title updates based on current route
 */
const DocumentTitleHandler = () => {
  const location = useLocation();

  useEffect(() => {
    // Set page title based on current route
    const pathToTitle = {
      '/dashboard': 'Dashboard',
      '/passwords': 'Passwords',
      '/settings': 'Settings',
      '/login': 'Login',
      '/register': 'Register'
    };

    const pageTitle = pathToTitle[location.pathname] || '';
    setDocumentTitle(pageTitle);
  }, [location.pathname]);

  return null;
};

export default DocumentTitleHandler;

