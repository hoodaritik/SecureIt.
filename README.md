# SecureIt. Frontend

A modern, secure password manager frontend built with React.js, featuring a beautiful and responsive design.

## ✨ Features

- 🎨 **Modern UI/UX**: Beautiful gradient designs with smooth animations
- 📱 **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- 🌙 **Dark/Light Mode**: Seamless theme switching with system preference detection
- 🔐 **Secure Authentication**: JWT-based authentication with secure password storage
- ⚡ **Fast Performance**: Optimized with React Query for efficient data fetching
- 🎯 **Intuitive Navigation**: Clean sidebar navigation with active state indicators
- 💫 **Smooth Animations**: Framer Motion animations for enhanced user experience

## 🚀 Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Environment Configuration:**
Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5003
REACT_APP_ENCRYPTION_KEY=your-32-character-encryption-key-here
REACT_APP_APP_NAME=SecureIt
```

3. **Start development server:**
```bash
npm start
```

4. **Access the application:**
The application will run on `http://localhost:3000`

## 📋 Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Removes the single build dependency (one-way operation)

## 🛠 Tech Stack

- **React.js 19** - Modern React with hooks and functional components
- **TailwindCSS** - Utility-first CSS framework with custom components
- **Framer Motion** - Smooth animations and transitions
- **React Query** - Powerful data fetching and caching
- **React Hook Form** - Performant form handling
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API requests
- **CryptoJS** - Client-side encryption utilities
- **React Toastify** - Beautiful notifications
- **React Icons** - Comprehensive icon library

## 🎨 Design System

### Color Palette
- **Primary**: Blue to Purple gradients (#3B82F6 to #8B5CF6)
- **Success**: Green gradients (#10B981 to #059669)
- **Warning**: Yellow to Orange gradients (#F59E0B to #EA580C)
- **Error**: Red to Pink gradients (#EF4444 to #EC4899)

### Components
- **shadcn/ui** - High-quality, accessible UI components
- **Custom Components** - Tailored components with consistent styling
- **Responsive Layout** - Mobile-first responsive design

### Animations
- **Page Transitions** - Smooth fade and slide animations
- **Hover Effects** - Interactive hover states with scale and shadow effects
- **Loading States** - Beautiful loading animations
- **Micro-interactions** - Delightful small animations throughout

## 📱 Responsive Design

- **Mobile (< 640px)**: Optimized mobile experience with collapsible sidebar
- **Tablet (640px - 1024px)**: Balanced layout for tablet devices
- **Desktop (> 1024px)**: Full desktop experience with sidebar navigation

## 🌟 Key Improvements

1. **Enhanced Visual Hierarchy** - Clear information architecture with proper spacing
2. **Improved Accessibility** - ARIA labels, keyboard navigation, and screen reader support
3. **Performance Optimized** - Lazy loading, code splitting, and optimized animations
4. **Better UX** - Loading states, error handling, and intuitive interactions
5. **Modern Design Language** - Glass morphism, gradients, and subtle shadows