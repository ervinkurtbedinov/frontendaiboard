import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppLayout, AuthLayout } from "@/layouts";
import {
  AIAssistantPage,
  AITaskGeneratorPage,
  BillingPage,
  BoardDetailsPage,
  BoardsListPage,
  DashboardPage,
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
  SettingsPage,
  TelegramInboxPage,
} from "@/pages";
import { ProtectedRoute, PublicOnlyRoute } from "@/routes/route-guards";

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
          { path: "/forgot-password", element: <ForgotPasswordPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/boards", element: <BoardsListPage /> },
          { path: "/boards/:id", element: <BoardDetailsPage /> },
          { path: "/ai-generator", element: <AITaskGeneratorPage /> },
          { path: "/ai-chat", element: <AIAssistantPage /> },
          { path: "/telegram", element: <TelegramInboxPage /> },
          { path: "/billing", element: <BillingPage /> },
          { path: "/settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
]);
