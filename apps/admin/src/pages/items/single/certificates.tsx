import { useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast,
} from "@sports/ui";
import { EmptyState } from "@/components/empty-state";
import { Users } from "lucide-react";
import { SectionName } from "@/components/section-name";
import { useRegistrations } from "@/hooks/use-registrations";

export function SingleItemCertificatesPage() {
  const { registrations, isLoading } = useRegistrations();
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Certificates</h1>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Participant</TableHead>
            <TableHead>Chest No</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Certificates</TableHead>
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
  };
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return (
    <TableRow key={registration.id}>
      <TableCell>{participant.fullName}</TableCell>
      <TableCell>{participant.chestNo}</TableCell>
      <TableCell>
        <SectionName id={participant.sectionId} />
      </TableCell>
      <TableCell></TableCell>
    </TableRow>
  );
};
