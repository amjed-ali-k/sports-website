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
import SettingsPage from "./pages/settings";
import AdminsPage from "./pages/admins";
import SectionsPage from "./pages/sections/index"; // added import statement
import ProfilePage from "./pages/profile";
import { AuthProvider, ProtectedRoute } from "./lib/auth";
import EventsPage from "./pages/events";
import { ItemsSinglePage } from "./pages/items/single";
import { SingleItemRegistrationsPage } from "./pages/items/single/registrations";
import { NewItemRegistrationPage } from "./pages/items/single/registrations/new";
import { ItemLayout } from "./pages/items/single/layout";
import { ItemResultsPage } from "./pages/items/single/results";
import { ItemReportsPage } from "./pages/items/single/reports";
import { RegistrationReportPage } from "./pages/items/single/reports/registration-pdf";
import { ResultReportPage } from "./pages/items/single/reports/result-pdf";
import GroupItemsPage from "./pages/group-items/index";
import { GroupItemLayout } from "./pages/group-items/single/layout";
import { GroupItemsSinglePage } from "./pages/group-items/single";
import { SingleGroupItemRegistrationsPage } from "./pages/group-items/single/registrations";
import { NewGroupItemRegistrationPage } from "./pages/group-items/single/registrations/new";
import { GroupItemResultsPage } from "./pages/group-items/single/results";
import { GroupItemReportsPage } from "./pages/group-items/single/reports";
import { GroupRegistrationReportPage } from "./pages/group-items/single/reports/registration-pdf";
import { GroupResultReportPage } from "./pages/group-items/single/reports/result-pdf";
import { ItemEditPage } from "./pages/items/single/edit";
import { GroupItemEditPage } from "./pages/group-items/single/edit";
import { NewSectionPage } from "./pages/sections/new";

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
                  <Route path=":itemId" element={<ItemLayout />}>
                    <Route element={<ItemsSinglePage />} index />
                    <Route element={<ItemEditPage />} path="edit" />

                    <Route
                      path="registrations"
                      element={<SingleItemRegistrationsPage />}
                    />
                    <Route
                      path="registrations/new"
                      element={<NewItemRegistrationPage />}
                    />
                    <Route path="results" element={<ItemResultsPage />} />
                    <Route path="reports">
                      <Route index element={<ItemReportsPage />} />
                      <Route
                        path="registration"
                        element={<RegistrationReportPage />}
                      />
                      <Route path="results" element={<ResultReportPage />} />
                    </Route>
                  </Route>
                </Route>
                <Route path="/group-items" element={<ManagerOnly />}>
                  <Route element={<GroupItemsPage />} index />
                  <Route path=":itemId" element={<GroupItemLayout />}>
                    <Route element={<GroupItemsSinglePage />} index />
                    <Route element={<GroupItemEditPage />} path="edit" />
                    <Route
                      path="registrations"
                      element={<SingleGroupItemRegistrationsPage />}
                    />
                    <Route
                      path="registrations/new"
                      element={<NewGroupItemRegistrationPage />}
                    />
                    <Route path="results" element={<GroupItemResultsPage />} />
                    <Route path="reports">
                      <Route index element={<GroupItemReportsPage />} />
                      <Route
                        path="registration"
                        element={<GroupRegistrationReportPage />}
                      />
                      <Route
                        path="results"
                        element={<GroupResultReportPage />}
                      />
                    </Route>
                  </Route>
                </Route>

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
                <Route path="/sections">
                  <Route index element={<SectionsPage />} />
                  <Route path="new" element={<NewSectionPage />} />
                </Route>
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
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
