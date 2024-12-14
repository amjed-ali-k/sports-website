import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Progress } from "@sports/ui";
import { apiClient } from "@/lib/api";
import { Boxes, Calendar, Package, Users } from "lucide-react";
import { DashboardEventsSections } from "./events";
import { addMonths, isPast } from "date-fns";

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: () => apiClient.getStats(),
  });

  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: () => apiClient.getEvents(),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Participants
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.participants.total?.total}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.participants.total?.male} male,{" "}
                {stats.participants.total?.female} female
              </p>
              {stats.participants.total && (
                <Progress
                  value={
                    (stats.participants.total?.male /
                      stats.participants.total?.total) *
                    100
                  }
                  className="mt-2"
                />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.eventsCount?.total}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.eventsCount?.completed} completed,{" "}
                {stats.eventsCount?.upcoming} upcoming
              </p>
              {stats.eventsCount && (
                <Progress
                  value={
                    (stats.eventsCount?.completed / stats.eventsCount?.total) *
                    100
                  }
                  className="mt-2"
                />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.itemsCount?.total}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.itemsCount?.scheduled} scheduled,{" "}
                {stats.itemsCount?.ongoing} ongoing,{" "}
                {stats.itemsCount?.finished} finished
              </p>
              {stats.itemsCount && (
                <Progress
                  value={
                    (stats.itemsCount.finished / stats.itemsCount.total) * 100
                  }
                  className="mt-2"
                />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Group Items</CardTitle>
              <Boxes className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.groupItemsCount?.total}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.groupItemsCount?.scheduled} scheduled,{" "}
                {stats.groupItemsCount?.ongoing} ongoing,{" "}
                {stats.groupItemsCount?.finished} finished
              </p>
              {stats.groupItemsCount && (
                <Progress
                  value={
                    (stats.groupItemsCount?.finished /
                      stats.groupItemsCount?.total) *
                    100
                  }
                  className="mt-2"
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}
      {events &&
        events.map((event) => {
          if (isPast(addMonths(new Date(event.endDate), 1))) return null;
          return (
            <DashboardEventsSections
              key={event.id}
              eventId={event.id.toString()}
              name={event.name}
            />
          );
        })}
    </div>
  );
}
