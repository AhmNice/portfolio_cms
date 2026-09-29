import "./App.css";
import "./theme.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Root from "./layout/Root";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Projects from "./pages/Projects";
import { Toaster } from "react-hot-toast";
import ProjectDetails from "./pages/ProjectDetails";
import Article from "./pages/Article";
import ProtectedRoute from "./hooks/Protected";
import GuestRoute from "./hooks/Guest";
import RecoverPassword from "./pages/RecoverPassword";
import ChangePassword from "./pages/ChangePassword";
import RootIndex from "./pages/Index";
import ArticleDetails from "./pages/ArticleDetails";
import Messages from "./pages/Messages";
import MessageView from "./pages/MessageView";
import Settings from "./pages/Settings";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Root />}>
      <Route index element={<RootIndex />} />
      <Route
        path="auth/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="auth/recover-password"
        element={
          <GuestRoute>
            <RecoverPassword />
          </GuestRoute>
        }
      />
      <Route
        path="auth/reset-password"
        element={
          <GuestRoute>
            <ChangePassword />
          </GuestRoute>
        }
      />
      <Route
        path="dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="projects"
        element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        }
      />
      <Route
        path="messages"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />
      <Route
        path="messages/:id"
        element={
          <ProtectedRoute>
            <MessageView />
          </ProtectedRoute>
        }
      />
      <Route
        path="articles"
        element={
          <ProtectedRoute>
            <Article />
          </ProtectedRoute>
        }
      />
      <Route
        path="projects/:slug"
        element={
          <ProtectedRoute>
            <ProjectDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="articles/:slug"
        element={
          <ProtectedRoute>
            <ArticleDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Route>,
  ),
);

function App() {
  return (
    <>
      <Toaster
        position="bottom-left"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: "var(--color-surface-container-high)",
            color: "var(--color-on-surface)",
            border: "1px solid var(--color-outline-variant)",
            borderRadius: "0.75rem",
            padding: "12px 16px",
            fontSize: "0.875rem",
            fontFamily: "var(--font-body)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          },
          success: {
            style: {
              border: "1px solid var(--color-primary)",
            },
            iconTheme: {
              primary: "var(--color-primary)",
              secondary: "var(--color-surface-container-high)",
            },
          },
          error: {
            style: {
              border: "1px solid var(--color-red-500)",
            },
            iconTheme: {
              primary: "var(--color-red-500)",
              secondary: "var(--color-surface-container-high)",
            },
          },
        }}
      />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
