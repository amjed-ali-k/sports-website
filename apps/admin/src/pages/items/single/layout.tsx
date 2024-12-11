import { Outlet } from "react-router-dom"
import { apiClient } from "@/lib/api";
import { Card, CardContent } from "@sports/ui";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getEventIcon } from "..";

export const ItemLayout = () => {
    const params = useParams();
    const { data: items, isLoading } = useQuery({
      queryKey: ["items"],
      queryFn: () => apiClient.getItems(),
    });
  
    const { data: events } = useQuery({
      queryKey: ["events"],
      queryFn: () => apiClient.getEvents(),
    });
  
    if (isLoading) return <div>Loading...</div>;
  
    const currentItem = items?.find(
      (item) => item.item.id === Number(params.itemId)
    )?.item;
  
    if (!currentItem) return <div>Item not found</div>;
    const ItemIcon = getEventIcon(currentItem.iconName);
    return <div>
           <Card className="overflow-hidden">
        <CardContent className="p-6 flex justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ItemIcon className="size-6" />
              <h3 className="font-semibold text-lg">{currentItem.name}</h3>
            </div>
          </div>
          <div className=" text-sm flex gap-x-4">
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
}