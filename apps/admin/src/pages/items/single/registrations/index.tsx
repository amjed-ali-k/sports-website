import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Badge,
} from "@sports/ui";
import { apiClient } from "@/lib/api";
import { EmptyState } from "@/components/empty-state";
import { Plus, Users } from "lucide-react";

export function SingleItemRegistrationsPage() {
  const navigate = useNavigate();
  const { itemId } = useParams();

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["items"],
    queryFn: () => apiClient.getItems(),
  });

  const { data: registrations = [], isLoading: registrationsLoading } =
    useQuery({
      queryKey: ["registrations"],
      queryFn: () => apiClient.getRegistrations(),
    });

  const isLoading = itemsLoading || registrationsLoading;
  if (isLoading) return <div>Loading...</div>;
  const currentItem = items?.find(
    (item) => item.item.id === Number(itemId)
  )?.item;

  if (!currentItem) return <div>Item not found</div>;
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Registrations Management</h1>
        <Button onClick={() => navigate("new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Registration
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Participant</TableHead>
            <TableHead>Chest No</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Meta Info</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations
            ?.filter(
              ({ registration }) => registration.itemId === currentItem?.id
            )
            .map(({ registration, participant }) => (
              <TableRow key={registration.id}>
                <TableCell>{participant.fullName}</TableCell>
                <TableCell>{participant.chestNo}</TableCell>
                <TableCell>{participant.sectionName}</TableCell>
                <TableCell>{registration.metaInfo || "-"}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      registration.status === "participated"
                        ? "default"
                        : registration.status === "not_participated"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {registration.status.replace("_", " ")}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          {registrations?.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-96">
                <EmptyState
                  icon={Users}
                  title="No registrations found"
                  description="Get started by adding your first registration."
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
