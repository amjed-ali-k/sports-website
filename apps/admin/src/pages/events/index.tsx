import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@sports/ui";
import { Button } from "@sports/ui";
import { apiClient } from "@/lib/api";
import { format } from "date-fns/format";
import { Image } from "lucide-react";
import { Link } from "react-router-dom";

export default function EventsPage() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: () => apiClient.getEvents(),
  });

  if (isLoading) return <div>Loading...</div>;
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Events Management</h1>
        <Button asChild>
          <Link to="new">New</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Max items per participant</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events?.map((event) => (
            <TableRow key={event.id}>
              <TableCell>
                {event.name}
                {event.image && (
                  <Button asChild variant="ghost" size="icon">
                    <a href={event.image}>
                      <Image className="size-4" />
                    </a>
                  </Button>
                )}
              </TableCell>
              <TableCell>
                {event.startDate && event.endDate
                  ? `${format(new Date(event.startDate), "dd-MM-yyyy")} to ${format(
                      new Date(event.endDate),
                      "dd-MM-yyyy"
                    )}`
                  : "N/A"}
              </TableCell>
              <TableCell className="capitalize">
                {event.maxRegistrationPerParticipant}
              </TableCell>
              <TableCell className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                  <Link to={`view/${event.id}`}>View</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`edit/${event.id}`}>Edit</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
