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
