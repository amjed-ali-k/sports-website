import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@sports/ui";
import { Toaster } from "@sports/ui";
import { HomePage } from "./pages/home";
import { Layout } from "./components/layout";
import { EventPage } from "./pages/event";
import { ItemsPage } from "./pages/items";
import { SingleItemPage } from "./pages/items/single";
import { ParticipantsPage } from "./pages/participants";
import { EventLayout } from "./components/eventLayout";
import { GroupItemPage } from "./pages/items/group";

const queryClient = new QueryClient();

function App() {
  return (
    <div className="font-body">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="sports-web-theme">
          <Router>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path=":eventId" element={<EventLayout />}>
                  <Route index element={<EventPage />} />
                  <Route path="items">
                    <Route index element={<ItemsPage />} />
                    <Route path=":itemId">
                      <Route path="individual" element={<SingleItemPage />} />
                      <Route path="group" element={<GroupItemPage />} />
                    </Route>
                  </Route>
                  <Route path="participants" element={<ParticipantsPage />} />
                </Route>
              </Route>
            </Routes>
          </Router>
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
