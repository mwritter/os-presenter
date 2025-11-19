import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { useStorageInit } from "@/hooks/use-storage-init";
import PresenterLayout from "./presenter/layout";
import Presenter from "./presenter/index";
import EditView from "./presenter/edit/index";
import AudienceLayout from "./audience/layout";
import AudienceView from "./audience/index";
import "./styles/index.css";

console.log("Entry client loaded");

function StorageGuard({ children }: { children: React.ReactNode }) {
  const { isInitialized, isLoading, error } = useStorageInit();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-white text-lg">Initializing storage...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center max-w-md p-8 bg-red-900/20 border border-red-500 rounded-lg">
          <h2 className="text-red-500 text-xl font-bold mb-4">
            Storage Initialization Error
          </h2>
          <p className="text-white mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-white text-lg">Waiting for initialization...</p>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  console.log("App component rendering");

  return (
    <BrowserRouter>
      <Routes>
        {/* Audience route - no storage initialization required */}
        <Route path="/audience" element={<AudienceLayout />}>
          <Route index element={<AudienceView />} />
        </Route>

        {/* Presenter routes - require storage initialization */}
        <Route
          path="/"
          element={
            <StorageGuard>
              <PresenterLayout />
            </StorageGuard>
          }
        >
          <Route index element={<Presenter />} />
          <Route path="presenter" element={<Presenter />} />
          <Route path="presenter/edit" element={<EditView />} />
          <Route path="edit" element={<EditView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
