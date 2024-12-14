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
} from "@sports/ui";
import { apiClient } from "@/lib/api";
import { EmptyState } from "@/components/empty-state";
import { Plus, Users } from "lucide-react";

export function SingleGroupItemRegistrationsPage() {
  const navigate = useNavigate();
  const { itemId } = useParams();

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["group-items"],
    queryFn: () => apiClient.getGroupItems(),
  });

  const { data: registrations = [], isLoading: registrationsLoading } =
    useQuery({
      queryKey: ["group-registrations"],
      queryFn: () => apiClient.getGroupRegistration(Number(itemId)),
    });

  const { data: sections = [] } = useQuery({
    queryKey: ["sections"],
    queryFn: () => apiClient.getSections(),
  });

  const isLoading = itemsLoading || registrationsLoading;
  if (isLoading) return <div>Loading...</div>;
  const currentItem = items?.find((item) => item.id === Number(itemId));

  if (!currentItem) return <div>Item not found</div>;

  const regs = "error" in registrations ? [] : registrations;

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
            <TableHead>Name</TableHead>
            <TableHead>Participant</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Meta Info</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {regs.map(({ registration, participants }) => {
            const users = JSON.parse(participants) as {
              id: number;
              name: string;
              chestNo: string;
              sectionId: string;
              batch: string;
            }[];
            const section = sections.find(
              (section) => section.id === registration.sectionId
            );
            const user = users[0];
            return (
              <TableRow key={registration.id}>
                <TableCell>{registration.name || 'N/A'}</TableCell>
                <TableCell>
                  {user.name} and {users.length - 1} others
                </TableCell>
                <TableCell>{section?.name ?? '-'}</TableCell>
                <TableCell>{user.batch}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            );
          })}
          {regs?.length === 0 && (
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
