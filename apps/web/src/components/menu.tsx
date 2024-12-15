import { Link } from "react-router-dom"

export const LinkMenu = () => {
    return       <div className="flex items-center border-b">
    <Link to="/event" className="px-6 hover:bg-primary-foreground cursor-pointer duration-200 border-r py-4 text-sm">
      Overall
    </Link>
    <Link to="/event/items" className="px-6 hover:bg-primary-foreground cursor-pointer duration-200 border-r py-4 text-sm">
      Programs
    </Link>
    <Link to="/event/participants" className="px-6 hover:bg-primary-foreground cursor-pointer duration-200 border-r py-4 text-sm">
      Participants
    </Link>
  </div>
}