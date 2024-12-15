import { Outlet } from "react-router-dom"
import { Spotlight } from "./ui/spot-light"

export const Layout = () => {

    return <div className="min-h-screen w-full">
         <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
        <Outlet />
    </div>
}