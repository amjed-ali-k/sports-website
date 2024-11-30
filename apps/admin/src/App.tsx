import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@sports/ui";
import { Toaster } from "@sports/ui";
import Layout from "./components/layout";
import LoginPage from "./pages/login";
import DashboardPage from "./pages/dashboard";
import ParticipantsPage from "./pages/participants";
import ItemsPage from "./pages/items";
import RegistrationsPage from "./pages/registrations";
import ResultsPage from "./pages/results";
import SettingsPage from "./pages/settings";
import AdminsPage from "./pages/admins";
import SectionsPage from "./pages/sections"; // added import statement
import { AuthProvider, ProtectedRoute } from "./lib/auth";
import NewRegistrationPage from "./pages/new-registration";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="sports-admin-theme">
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<DashboardPage />} />
                <Route
                  path="/participants"
                  element={
                    <ProtectedRoute requiredRole="rep">
                      <ParticipantsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/items"
                  element={
                    <ProtectedRoute requiredRole="manager">
                      <ItemsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/registrations"
                  element={
                    <ProtectedRoute requiredRole="rep">
                      <RegistrationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/registrations/new"
                  element={
                    <ProtectedRoute requiredRole="rep">
                      <NewRegistrationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/results"
                  element={
                    <ProtectedRoute requiredRole="rep">
                      <ResultsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute requiredRole="controller">
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admins"
                  element={
                    <ProtectedRoute requiredRole="controller">
                      <AdminsPage />
                    </ProtectedRoute>
                  }
                />

                <Route path="/sections" element={<SectionsPage />} />
              </Route>
            </Routes>
          </AuthProvider>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
