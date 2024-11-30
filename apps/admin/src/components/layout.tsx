import { Link, Outlet } from "react-router-dom";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@sports/ui";
import { useAuth } from "../lib/auth";

export default function Layout() {
  const { admin, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background font-body">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Sports Admin</span>
          </Link>
          <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
            <Link
              to="/participants"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Participants
            </Link>
            {admin?.role !== "rep" && (
              <Link
                to="/items"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Items
              </Link>
            )}
            <Link
              to="/registrations"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Registrations
            </Link>
            <Link
              to="/results"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Results
            </Link>
            {admin?.role === "controller" && (
              <>
                <Link
                  to="/settings"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Settings
                </Link>
                <Link
                  to="/admins"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Admins
                </Link>
              </>
            )}
          </nav>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <span className="sr-only">Open user menu</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  {admin?.name[0]}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {admin?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {admin?.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {admin?.role}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => logout()}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="container py-6">
        <Outlet />
      </main>
    </div>
  );
}
