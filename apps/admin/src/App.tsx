import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@sports/ui";
import { Toaster } from "@sports/ui";
import Layout from "./components/layout";
import LoginPage from "./pages/login";
import DashboardPage from "./pages/dashboard";
import ParticipantsPage from "./pages/participants";
import ItemsPage from "./pages/items/index";
import RegistrationsPage from "./pages/registrations";
import ResultsPage from "./pages/results";
import SettingsPage from "./pages/settings";
import AdminsPage from "./pages/admins";
import SectionsPage from "./pages/sections"; // added import statement
import ProfilePage from "./pages/profile";
import GroupItemsPage from "./pages/group-items";
import GroupRegistrationsPage from "./pages/group-registrations";
import { AuthProvider, ProtectedRoute } from "./lib/auth";
import NewRegistrationPage from "./pages/new-registration";
import EventsPage from "./pages/events";
import { ItemsSinglePage } from "./pages/items/single";
import { SingleItemRegistrationsPage } from "./pages/items/single/registrations";
import { NewItemRegistrationPage } from "./pages/items/single/registrations/new";

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
                <Route path="/items" element={<ManagerOnly />}>
                  <Route element={<ItemsPage />} index />
                  <Route path=":itemId">
                    <Route element={<ItemsSinglePage />} index />
                    <Route
                      path="registrations"
                      element={<SingleItemRegistrationsPage />}
                    />
                    <Route
                      path="registrations/new"
                      element={<NewItemRegistrationPage />}
                    />
                  </Route>
                </Route>
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
                <Route
                  path="/events"
                  element={
                    <ProtectedRoute requiredRole="controller">
                      <EventsPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/sections" element={<SectionsPage />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/group-items" element={<GroupItemsPage />} />
                <Route
                  path="/group-registrations"
                  element={<GroupRegistrationsPage />}
                />
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

const ManagerOnly = () => {
  return (
    <ProtectedRoute requiredRole="manager">
      <Outlet />
    </ProtectedRoute>
  );
};
