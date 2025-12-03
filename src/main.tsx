import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
        },
    },
});

async function enableMocking() {
    if (!import.meta.env.DEV) {
        return;
    }

    const { worker } = await import("./mocks/browser");

    // `worker.start()` returns a Promise that resolves
    // once the Service Worker is up and ready to intercept requests.
    return worker.start({
        serviceWorker: {
            url: import.meta.env.BASE_URL + "mockServiceWorker.js",
        },
    });
}

enableMocking().then(() => {
    ReactDOM.createRoot(document.getElementById("root")!).render(
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <HashRouter>
                    <App />
                </HashRouter>
            </QueryClientProvider>
        </React.StrictMode>,
    );
});
