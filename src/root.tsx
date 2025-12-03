import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { useStorageInit } from "@/hooks/use-storage-init";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html className="dark" lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  const { isInitialized, isLoading, error } = useStorageInit();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-shade-3">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-white text-lg">Initializing storage...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-shade-3">
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
      <div className="flex items-center justify-center h-screen w-screen bg-shade-3">
        <p className="text-white text-lg">Waiting for initialization...</p>
      </div>
    );
  }

  return <Outlet />;
}
