import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { useStorageInit } from "@/hooks/use-storage-init";
import PresenterLayout from "./pages/presenter/layout";
import Presenter from "./pages/presenter/index";
import EditView from "./pages/presenter/edit/index";
import "./styles/index.css";
import AudienceLayout from "./pages/audience/layout";
import AudienceView from "./pages/audience";
import SettingsLayout from "./pages/settings/layout";
import Settings from "./pages/settings";
import TagGroupsPage from "./pages/settings/tag-groups";
import GeneralPage from "./pages/settings/general";
import UpdatesPage from "./pages/settings/updates";

console.log("Entry client loaded");

// Prevent backspace from navigating back (desktop app behavior)
// Allow backspace in editable elements (inputs, textareas, contenteditable)
document.addEventListener("keydown", (e) => {
  if (e.key === "Backspace") {
    const target = e.target as HTMLElement;
    const isEditable =
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable;

    if (!isEditable) {
      e.preventDefault();
    }
  }
});

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
        <Route path="/pages/audience" element={<AudienceLayout />}>
          <Route index element={<AudienceView />} />
        </Route>

        {/* Settings route - standalone window */}
        <Route
          path="/settings"
          element={
            <StorageGuard>
              <SettingsLayout />
            </StorageGuard>
          }
        >
          <Route index element={<Settings />} />
          <Route path="/settings/tag-groups" element={<TagGroupsPage />} />
          <Route path="/settings/general" element={<GeneralPage />} />
          <Route path="/settings/updates" element={<UpdatesPage />} />
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
