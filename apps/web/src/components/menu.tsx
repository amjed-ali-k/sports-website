import { useEvent } from "@/hooks/use-event"
import { cn } from "@/lib/utils"
import { Link, useLocation } from "react-router-dom"

export const LinkMenu = () => {
  const {pathname} = useLocation()
  const event = useEvent()
    return       <div className="flex items-center border-b">
    <Link to={`/${event?.id}`} className={cn("px-6 hover:bg-primary-foreground cursor-pointer duration-200 border-r py-4 text-sm", pathname === `/${event?.id}` && "bg-primary-foreground")}>
      Overall
    </Link>
    <Link to={`/${event?.id}/items`} className={cn("px-6 hover:bg-primary-foreground cursor-pointer duration-200 border-r py-4 text-sm", pathname === `/${event?.id}/items` && "bg-primary-foreground")}>
      Programs
    </Link>
    <Link to={`/${event?.id}/participants`} className={cn("px-6 hover:bg-primary-foreground cursor-pointer duration-200 border-r py-4 text-sm", pathname === `/${event?.id}/participants` && "bg-primary-foreground")}>
      Participants
    </Link>
  </div>
}