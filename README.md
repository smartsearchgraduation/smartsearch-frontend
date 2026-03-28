
# 🚀 smartsearch-frontend

A modern React frontend for the SmartSearch e-commerce search platform with admin capabilities.

## 🌐 Live Demo

View the deployed version: **[https://smartsearchgraduation.github.io/smartsearch-frontend/](https://smartsearchgraduation.github.io/smartsearch-frontend/)**

## ✨ Features

- **Advanced Search** - Text-based product search with spelling correction and relevance scoring
- **Admin Panel** - Product management, statistics, and analytics dashboard
- **Image Search UI** - Interface prepared for image uploads (backend integration pending)
- **Performance Analytics** - Search timing and performance metrics
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Development Mocking** - MSW for API mocking during development

## 🛠️ Built With

- **[React](https://reactjs.org/)** - UI framework
- **[Vite](https://vitejs.dev/)** - Build tool and dev server
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling framework
- **[TanStack Query](https://tanstack.com/query/latest)** - Data fetching and caching
- **[React Router](https://reactrouter.com/)** - Client-side routing
- **[MSW](https://mswjs.io/)** - API mocking for development



## 🔧 Admin Access

For development, you can access the admin panel by running this in your browser console:
```javascript
localStorage.setItem("smartsearch_admin_access", true);
```


## 🏁 Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

You will need [Node.js](https://nodejs.org/) (version 18 or higher is recommended) and npm installed on your machine.

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/smartsearchgraduation/smartsearch-frontend.git
    ```
2.  **Navigate to the project directory**
    ```sh
    cd smartsearch-frontend
    ```
3.  **Install dependencies**
    ```sh
    npm install
    ```

### Running the Development Server

Once the dependencies are installed, you can start the local development server:

```sh
npm run dev
```
This will run the app in development mode. Open [http://localhost:5173](https://www.google.com/search?q=http://localhost:5173) (or the port specified in your terminal) to view it in your browser. The page will reload automatically as you make edits.


## 📁 Project Structure

```
smartsearch-frontend/
├── public/
│   └── ... (static assets)
├── src/
│   ├── components/
│   │   ├── SearchBar.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── ui/ (custom UI components)
│   │   └── ... (reusable components)
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── SearchPage.tsx
│   │   ├── ProductPage.tsx
│   │   ├── AdminPage.tsx
│   │   └── admin/ (admin sub-pages)
│   ├── lib/
│   │   ├── api.ts (API layer)
│   │   └── utils.ts
│   ├── mocks/ (MSW handlers)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .gitignore
├── package.json
└── README.md
```

## 🏗️ Architecture

- **Components:** Reusable UI elements in `src/components`, including custom UI components in `ui/` subdirectory
- **Pages:** Major application views in `src/pages`, with admin sub-pages in `admin/` subdirectory  
- **API Layer:** All backend communication handled through `src/lib/api.ts` with TanStack Query for caching
- **Routing:** React Router with HashRouter, including protected admin routes
- **Mocking:** MSW provides API mocking during development for faster iteration
- **State Management:** TanStack Query handles server state, React state for UI state
