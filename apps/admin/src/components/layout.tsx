import { Link, Outlet } from "react-router-dom";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@sports/ui";
import { useAuth } from "../lib/auth";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trophy,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

const roleConfig = {
  rep: {
    color: "bg-blue-100 text-blue-800",
    icon: Shield,
  },
  manager: {
    color: "bg-green-100 text-green-800",
    icon: ShieldCheck,
  },
  controller: {
    color: "bg-purple-100 text-purple-800",
    icon: UserCog,
  },
  super_admin: {
    color: "bg-red-100 text-red-800",
    icon: ShieldAlert,
  },
} as const;

export default function Layout() {
  const { admin, logout } = useAuth();
  const roleSettings = admin ? roleConfig[admin.role] : roleConfig.rep;
  const RoleIcon = roleSettings.icon;

  return (
    <div className="min-h-screen bg-background font-body">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Sports Admin</span>
          </Link>
          <NavigationMenuComp />
          <div className="flex ml-auto items-center space-x-4">
            <div
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full ${roleSettings.color}`}
            >
              <RoleIcon className="h-3.5 w-3.5" />
              <span className="text-xs font-medium capitalize">
                {admin?.role.replace("_", " ")}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar>
                  <AvatarImage src={admin?.avatar || ""} alt={admin?.name} />
                  <AvatarFallback>
                    {admin?.name.charAt(0)}
                    {admin?.name.charAt(1)}
                  </AvatarFallback>
                </Avatar>
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
                    <div
                      className={`inline-flex w-fit items-center space-x-1.5 px-2 py-0.5 mt-1 rounded-full ${roleSettings.color}`}
                    >
                      <RoleIcon className="h-3 w-3" />
                      <span className="text-xs font-medium capitalize">
                        {admin?.role.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
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
        </div>
      </header>
      <main className="container py-6">
        <Outlet />
      </main>
    </div>
  );
}

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Dashboard",
    href: "/",
    description: "An overview of the results, participants and registrations.",
  },
  {
    title: "Individual Registrations",
    href: "/registrations",
    description: "Register participants to specific event items.",
  },
  {
    title: "Group Registrations",
    href: "/group-registrations",
    description: "Register teams to group event items.",
  },
  {
    title: "Items",
    href: "/items",
    description: "Manage individual event items and their details.",
  },
  {
    title: "Group Items",
    href: "/group-items",
    description: "Manage group event items and their specifications.",
  },
  {
    title: "Results",
    href: "/results",
    description: "View and update event results and rankings.",
  },
];

export function NavigationMenuComp() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Main</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/"
                  >
                    <Trophy className="h-6 w-6" />
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Sports Admin
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Beautifully designed components that you can copy and
                      paste into your apps. Accessible. Customizable. Open
                      Source.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/participants" title="Participants">
                Event participants can be managed here.
              </ListItem>
              <ListItem href="/sections" title="Sections">
                Departments/Sections can be created and manged here.
              </ListItem>
              <ListItem href="/admins" title="Admins">
                Manage admins here.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Events</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link to="/settings">Settings</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
          to={props.href || "#"}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
