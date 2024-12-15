import { Button } from "@sports/ui";
import { Home } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

export const EventLayout = () => {
  return (
    <div>
      <div className="border-b w-full py-2 px-4 flex items-center">
        <Button variant={"ghost"}>
            <Link to={"/"}>
          <Home />
            </Link>
        </Button>
        <div></div>
        <div className="ml-auto font-bold">Sports Fest 2024</div>
      </div>
      <Outlet />
    </div>
  );
};
