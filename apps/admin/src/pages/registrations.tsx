import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
} from "@sports/ui";
import { apiClient } from "@/lib/api";
import { EmptyState } from "@/components/empty-state";
import { Plus, Users } from "lucide-react";

export default function RegistrationsPage() {
  const navigate = useNavigate();

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["items"],
    queryFn: () =>
      apiClient.getItems().then((res) => {
        setSelectedItem(res[0]?.item);
        return res;
      }),
  });
  const [selectedItem, setSelectedItem] = useState(items[0]?.item);

  const { data: registrations = [], isLoading: registrationsLoading } =
    useQuery({
      queryKey: ["registrations"],
      queryFn: () => apiClient.getRegistrations(),
    });

  const isLoading = itemsLoading || registrationsLoading;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Registrations Management</h1>
        <Button onClick={() => navigate("/registrations/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Registration
        </Button>
      </div>

      <div className="mb-6">
        <Select
          onValueChange={(value) => {
            const item = items.find(({ item }) => item.id === parseInt(value));
            setSelectedItem(item?.item as any);
          }}
          value={selectedItem ? selectedItem.id.toString() : ""}
        >
          <SelectTrigger className="max-w-96">
            <SelectValue placeholder="Select an item to view registrations" />
          </SelectTrigger>
          <SelectContent>
            {items?.map(({ item }) => (
              <SelectItem key={item.id} value={item.id.toString()}>
                {item.name}{" "}
                <Badge variant="outline" className="capitalize mx-2 text-xs">
                  {item.gender}
                </Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedItem && (
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
                ({ registration }) => registration.itemId === selectedItem?.id
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
      )}
    </div>
  );
}
