import { Link, Outlet } from "react-router-dom";
import { apiClient } from "@/lib/api";
import { Button, Card, CardContent } from "@sports/ui";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getEventIcon } from "..";
import { ChevronRight } from "lucide-react";

export const GroupItemLayout = () => {
  const params = useParams();
  const { data: items, isLoading } = useQuery({
    queryKey: ["group-items"],
    queryFn: () => apiClient.getGroupItems(),
  });

  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: () => apiClient.getEvents(),
  });

  if (isLoading) return <div>Loading...</div>;

  const currentItem = items?.find((item) => item.id === Number(params.itemId));

  if (!currentItem) return <div>Item not found</div>;
  const ItemIcon = getEventIcon(currentItem.iconName);
  return (
    <div>
      <Card className="overflow-hidden">
        <CardContent className="p-6 flex lg:flex-row flex-col justify-between">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link to="/group-items">Group Items</Link>
            </Button>
            <ChevronRight className="size-4 mx-1" />
            <div className="flex items-center  justify-between">
            <Button variant="ghost" asChild>
              <Link
                to={`/group-items/${currentItem.id}`}
                className="flex items-center space-x-3"
              >
                <ItemIcon className="size-6" />
                <h3 className="font-semibold text-lg">{currentItem.name}</h3>
              </Link>
              </Button>
            </div>
          </div>
          <div className=" text-sm flex gap-x-4 lg:mt-6">
            <div className="flex gap-x-3">
              <span className="text-muted-foreground">Event:</span>
              <span className="font-medium">
                {events?.find((c: any) => c.id === currentItem.eventId)?.name}
              </span>
            </div>

            <div className="flex gap-x-3">
              <span className="text-muted-foreground">Gender:</span>
              <span className="font-medium capitalize">
                {currentItem.gender}
              </span>
            </div>

            <div className="flex gap-x-3">
              <span className="text-muted-foreground">Points:</span>
              <span className="font-medium">
                {currentItem.pointsFirst}/{currentItem.pointsSecond}/
                {currentItem.pointsThird}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Outlet />
    </div>
  );
};
