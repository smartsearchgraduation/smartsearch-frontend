
# 🚀 smartsearch-frontend

This is the React frontend for the SmartSearch project.


## 🌐 Live Demo

You can view the latest deployed version here:
**[https://smartsearchgraduation.github.io/smartsearch-frontend/](https://smartsearchgraduation.github.io/smartsearch-frontend/)**


## 🛠️ Built With

This project is built with modern web technologies, including:

* **[React](https://reactjs.org/):** A JavaScript library for building user interfaces.
* **[Vite](https://vitejs.dev/):** A next-generation frontend build tool for extremely fast development.
* **[Tailwind CSS](https://tailwindcss.com/):** A utility-first CSS framework for rapid UI development.
* **[TanStack Query](https://tanstack.com/query/latest):** A powerful library for data fetching, caching, and state management.



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

The project follows a standard Vite + React structure, organizing files by feature and type.

```
smartsearch-frontend/
├── public/
│   └── ... (static assets)
├── src/
│   ├── components/
│   │   ├── SearchBar.tsx
│   │   ├── ProductCard.tsx
│   │   └── ... (reusable UI components)
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── SearchPage.tsx
│   │   └── ... (main page views)
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .gitignore
├── index.html
├── package.json
└── README.md
```

## 🏗️ Architecture

-   **Components:** All reusable UI elements (like `SearchBar`, `ProductCard`) are located in `src/components`. These are designed to be simple and reusable across different pages.
    
-   **Pages:** Major application views (like `HomePage`, `SearchPage`) are in `src/pages`. These components are responsible for assembling various smaller components to create a full page.
    
-   **Data Fetching:** All communication with the backend API is handled by **TanStack Query**. This manages caching, refetching, and loading/error states, keeping the UI components clean.
