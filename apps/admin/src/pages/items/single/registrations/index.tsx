import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  ToggleGroup,
  ToggleGroupItem,
  useToast,
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
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations
            ?.filter(
              ({ registration }) => registration.itemId === currentItem?.id
            )
            .map((data) => <Row key={data.registration.id} {...data} />)}
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

const Row = ({
  registration,
  participant,
}: {
  registration: {
    id: number;
    createdAt: string | null;
    updatedAt: string | null;
    status: "registered" | "participated" | "not_participated";
    itemId: number;
    participantId: number;
    metaInfo: string | null;
  };
  participant: {
    id: number;
    fullName: string;
    chestNo: string | null;
    sectionId: number;
    sectionName: string;
  };
  item: {
    id: number;
    name: string;
  };
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (values: { id: number; status: any }) => {
      await apiClient.updateRegistration(values.id, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (status: string) => {
    mutation.mutate({ id: registration.id, status });
  };

  return (
    <TableRow key={registration.id}>
      <TableCell>{participant.fullName}</TableCell>
      <TableCell>{participant.chestNo}</TableCell>
      <TableCell>{participant.sectionName}</TableCell>
      <TableCell>{registration.metaInfo || "-"}</TableCell>
      <TableCell>
        <Badge
        className="capitalize duration-200 transition-all"
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
      <TableCell>
        <ToggleGroup
        disabled={mutation.isPending}
          onValueChange={handleStatusChange}
          value={registration.status}
          size="sm"
          variant="default"
          type="single"
          className="text-xs gap-0"
        >
          <ToggleGroupItem
            value="registered"
            className="text-xs  data-[state=on]:font-bold"
          >
            Registered
          </ToggleGroupItem>
          <ToggleGroupItem
            value="not_participated"
            className="text-xs data-[state=on]:font-bold data-[state=on]:text-rose-700 data-[state=on]:bg-rose-100"
          >
            Not Participated
          </ToggleGroupItem>
          <ToggleGroupItem
            value="participated"
            className="text-xs data-[state=on]:font-bold data-[state=on]:text-green-700 data-[state=on]:bg-green-100"
          >
            Participated
          </ToggleGroupItem>
        </ToggleGroup>
      </TableCell>
    </TableRow>
  );
};
