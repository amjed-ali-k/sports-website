import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Plus, Trash, Users } from "lucide-react";
import { SectionName } from "@/components/section-name";
import { useRegistrations } from "@/hooks/use-registrations";
import { ProtectedView, useRole } from "@/lib/auth";
import { useItem } from "../layout";

export function SingleItemRegistrationsPage() {
  const navigate = useNavigate();
  const { registrations, isLoading } = useRegistrations();
  const { currentItem } = useItem();
  const isAdmin = useRole("controller");
  const isManager = useRole("manager");

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-6">
      <div className="flex lg:flex-row flex-col justify-between items-center mb-6">
        <h1 className="mb-2 lg:text-2xl font-bold">Registrations Management</h1>
        {(currentItem?.canRegister || isAdmin) && (
          <Button onClick={() => navigate("new")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Registration
          </Button>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Participant</TableHead>
            <TableHead>Chest No</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Status</TableHead>
            {isManager && <TableHead>Action</TableHead>}
            {isManager && <TableHead>-</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations?.map((data) => (
            <Row key={data.registration.id} {...data} />
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

type RowProps = {
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
  };
};

const updatorFun = (d: RowProps[], res: RowProps["registration"]) => {
  if (!d) return d;
  const newData = d.map((row) => {
    if (row.registration.id !== res.id) return row;
    return {
      ...row,
      registration: res,
    };
  });
  return newData;
};

const Row = ({ registration, participant }: RowProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { itemId } = useParams();

  const mutation = useMutation({
    mutationFn: async (values: { id: number; status: any }) => {
      const res = await apiClient.updateRegistration(values.id, values);
      if ("error" in res) throw Error(res.error);
      return res;
    },
    onSuccess: (updatedRes) => {
      queryClient.setQueryData(["registrations-item", itemId], (e: any) =>
        updatorFun(e as RowProps[], updatedRes)
      );
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
    if (!status) return;
    mutation.mutate({ id: registration.id, status });
  };
  const isManager = useRole("manager");

  const handleDelete = async () => {
    const res = await apiClient.deleteRegistration(registration.id);

    if ("success" in res)
      queryClient.setQueryData(
        ["registrations-item", itemId],
        (e: RowProps[]) =>
          e ? e.filter((r) => r.registration.id !== registration.id) : e
      );
  };

  return (
    <TableRow key={registration.id}>
      <TableCell>{participant.fullName}</TableCell>
      <TableCell>{participant.chestNo}</TableCell>
      <TableCell>
        <SectionName id={participant.sectionId} />
      </TableCell>
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
      {isManager && (
        <TableCell>
          <ProtectedView requiredRole="manager">
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
          </ProtectedView>
        </TableCell>
      )}
      {isManager && (
        <TableCell>
          <Button size="icon" variant="outline">
            <Trash className="size-4" onClick={handleDelete} />
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
};
