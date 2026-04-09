# 🚀 smartsearch-frontend

A modern React frontend for the SmartSearch e-commerce search platform with admin capabilities.

## 🌐 Live Demo

View the deployed version: **[https://smartsearchgraduation.github.io/smartsearch-frontend/](https://smartsearchgraduation.github.io/smartsearch-frontend/)**

## ✨ Features

- **Advanced Search** - Text-based product search with spelling correction and relevance scoring
- **Image Search** - Upload images for product search with automatic WebP conversion (max 1080px)
- **Image-Only Search** - Search using images without requiring text queries
- **Query Retention** - Search bar retains corrected text for easy refinement
- **"Search Instead For"** - Option to search with original uncorrected text
- **Similarity Scores** - Product cards display similarity scores for better observability
- **Admin Panel** - Product management, statistics dashboard, and configuration options for retrieval models and fusion strategies
- **Performance Analytics** - Search timing and performance metrics
- **Animated Loading** - Smooth loading indicators for better UX
- **Accessibility** - ARIA labels and keyboard navigation support
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Development Mocking** - MSW for API mocking during development

## 🛠️ Built With

- **[React](https://reactjs.org/)** - UI framework
- **[Vite](https://vitejs.dev/)** - Build tool and dev server
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling framework
- **[TanStack Query](https://tanstack.com/query/latest)** - Data fetching and caching
- **[React Router](https://reactrouter.com/)** - Client-side routing
- **[MSW](https://mswjs.io/)** - API mocking for development
- **[Vitest](https://vitest.dev/)** - Testing framework with jsdom environment
- **[Testing Library](https://testing-library.com/)** - React component testing utilities

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

This will run the app in development mode with MSW API mocking. Open [http://localhost:5173](http://localhost:5173) (or the port specified in your terminal) to view it in your browser.

**Connect to Live Server:**

To connect to the live backend API instead of using mocked data:

```sh
npm run dev:live
```

This sets `VITE_USE_LIVE_API=true` and bypasses MSW mocking to connect directly to the backend.

### Running Tests

The project uses Vitest for unit and integration testing with jsdom environment and Testing Library for React components.

```sh
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

Test files should be placed alongside components or in the `src/test` directory with the `.test.ts` or `.test.tsx` extension.

## 📁 Project Structure & Architecture

```bash
smartsearch-frontend/
├── public/           # Static assets
├── docs/             # Build output for GitHub Pages deployment (replaces dist/)
├── src/
│   ├── components/   # Reusable UI elements (SearchBar.tsx, ProductCard.tsx, ui/, ...)
│   ├── pages/        # Major application views (HomePage.tsx, AdminPage.tsx, admin/, ...)
│   ├── lib/          # API layer and utilities (api.ts, utils.ts, ...)
│   ├── mocks/        # MSW handlers for API mocking
│   ├── test/         # Test setup and configuration files
│   ├── App.tsx       # Root component
│   └── main.tsx      # Entry point
├── package.json
└── README.md
```

**Architecture:**

- **Components** - Reusable UI elements in `src/components`, with custom UI components in `ui/` subdirectory
- **Pages** - Major application views in `src/pages`, with admin sub-pages in `admin/` subdirectory
- **API Layer** - All backend communication handled through `src/lib/api.ts` with TanStack Query for caching
- **Routing** - React Router with HashRouter, including protected admin routes
- **Mocking** - MSW provides API mocking during development for faster iteration
- **Testing** - Vitest with jsdom environment and Testing Library for component testing
- **State Management** - TanStack Query handles server state, React state for UI state
