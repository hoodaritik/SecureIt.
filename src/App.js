import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import { EnhancedThemeProvider } from './context/EnhancedThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import AppRouter from './components/AppRouter';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EnhancedThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <div className="App min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500">
              <AppRouter />
              <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                className="font-medium"
                toastClassName={() =>
                  "relative flex p-1 min-h-10 rounded-md justify-between overflow-hidden cursor-pointer"
                }
                bodyClassName={() => "flex text-sm font-white font-med p-3"}
              />
            </div>
          </LanguageProvider>
        </AuthProvider>
      </EnhancedThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
