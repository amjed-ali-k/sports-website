import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@sports/ui";
import { Button } from "@sports/ui";
import { apiClient } from "@/lib/api";
import { ItemFormValues, NewItemFormDialog } from "./new";
import { Popcorn } from "lucide-react";
import { Link } from "react-router-dom";
import { iconsList } from "@/components/icon";
import { ProtectedView } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { group } from "radash";

// Helper function to get the appropriate icon for each event
export function getEventIcon(iconName?: string | null) {
  if (iconName) {
    return iconsList.find((icon) => icon.name === iconName)?.icon || Popcorn;
  }
  return Popcorn;
}

export default function GroupItemsPage() {
  const [editingItem, setEditingItem] = useState<ItemFormValues | null>(null);

  const { data: items, isLoading } = useQuery({
    queryKey: ["group-items"],
    queryFn: () => apiClient.getGroupItems(),
  });

  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: () => apiClient.getEvents(),
  });

  if (isLoading) return <div>Loading...</div>;

  const eventsAndItems = group(items || [], (item) => item.eventId);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Group Items Management</h1>
      </div>
      <ProtectedView requiredRole="controller">
        <NewItemFormDialog
          editingItem={editingItem}
          setEditingItem={setEditingItem}
        />
      </ProtectedView>
      <div className="">
        {Object.entries(eventsAndItems).map(([eventId, items]) => {
          const event = events?.find((event) => event.id === Number(eventId));
          return (
            <div key={eventId}>
              <h2 className="text-xl font-semibold mb-4 border-t pt-4 mt-4">{event?.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                {items?.map((item) => {
                  const ItemIcon = getEventIcon(item?.iconName);

                  return (
                    <Link key={item.id} to={`/group-items/${item.id}`}>
                      <Card
                        className={cn("overflow-hidden", {
                          "bg-pink-50 border border-pink-600":
                            item.gender === "female",
                          "bg-blue-50 border border-blue-600":
                            item.gender === "male",
                        })}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <ItemIcon className="size-6" />
                              <h3 className="font-semibold text-lg">
                                {item.name}
                              </h3>
                            </div>
                            <ProtectedView requiredRole="controller">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingItem(item)}
                              >
                                Edit
                              </Button>
                            </ProtectedView>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Event:
                              </span>
                              <span className="font-medium">
                                {
                                  events?.find(
                                    (c: any) => c.id === item.eventId
                                  )?.name
                                }
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Gender:
                              </span>
                              <span className="font-medium capitalize">
                                {item.gender}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Participants:
                              </span>
                              <span className="font-medium capitalize">
                                {item.minParticipants} - {item.maxParticipants}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Points:
                              </span>
                              <span className="font-medium">
                                {item.pointsFirst}/{item.pointsSecond}/
                                {item.pointsThird}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
