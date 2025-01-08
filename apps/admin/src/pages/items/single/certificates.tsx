import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast,
} from "@sports/ui";
import { EmptyState } from "@/components/empty-state";
import { Eye, EyeClosed, Users } from "lucide-react";
import { SectionName } from "@/components/section-name";
import { useRegistrations } from "@/hooks/use-registrations";
import { apiClient } from "@/lib/api";
import { useResultsForItem } from "@/hooks/use-results";
import { first } from "radash";

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
            <TableHead>Participation Certificate</TableHead>
            <TableHead>Result Certificate</TableHead>
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
  const itemId = registration.itemId;
  const { data: _pcerts } = useQuery({
    queryKey: ["certificates", itemId, "participation"],
    queryFn: () =>
      itemId
        ? apiClient.getCertificates(itemId.toString(), "participation")
        : null,
  });

  const results = useResultsForItem(itemId);
  const result = results?.find(
    (r) => r.result.registrationId === registration.id
  );

  const position = result?.result.position;

  const { data: _rcerts } = useQuery({
    queryKey: ["certificates", itemId, position],
    queryFn: () =>
      itemId && position
        ? apiClient.getCertificates(itemId.toString(), position)
        : null,
  });

  const rCert = _rcerts ? ("error" in _rcerts ? null : first(_rcerts)) : null;

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const pCertMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.generateCertificate({
        id: registration.id,
        itemId: registration.itemId,
        participantId: registration.participantId,
        type: "participation",
      });
      if ("error" in res) throw new Error(res.error);
      return res;
    },
    onSuccess: (newData) => {
      queryClient.setQueryData(
        ["certificates", itemId, "participation"],
        (d: typeof pCerts) => (d ? [...d, newData] : d)
      );
    },
    onError: (e) => {
      toast({
        title: e.message,
        variant: "destructive",
      });
    },
  });

  const rCertMutation = useMutation({
    mutationFn: async () => {
      if (!result) throw new Error("Result not found");
      const res = await apiClient.generateCertificate({
        id: result?.result.id,
        itemId: registration.itemId,
        participantId: registration.participantId,
        type: position!,
      });
      if ("error" in res) throw new Error(res.error);
      return res;
    },
    onSuccess: (newData) => {
      queryClient.setQueryData(
        ["certificates", itemId, position],
        (d: typeof pCerts) => (d ? [...d, newData] : d)
      );
    },
    onError: (e) => {
      toast({
        title: e.message,
        variant: "destructive",
      });
    },
  });
  const handleClick = () => pCertMutation.mutate();
  const handleResultClick = () => rCertMutation.mutate();
  const pCerts = _pcerts ? ("error" in _pcerts ? [] : _pcerts) : [];
  const pCert = pCerts.find((c) => c.id === registration.id);
  return (
    <TableRow key={registration.id}>
      <TableCell>{participant.fullName}</TableCell>
      <TableCell>{participant.chestNo}</TableCell>
      <TableCell>
        <SectionName id={participant.sectionId} />
      </TableCell>
      <TableCell>
        {!pCert ? (
          <Button onClick={handleClick} size="sm">
            Generate
          </Button>
        ) : (
          <div className="flex gap-x-2">
            <Button asChild size="icon" variant="outline">
              <a
                target="_blank"
                href={`${import.meta.env.VITE_CERTIFICATE_URL}/cert/${pCert.key}/image.svg`}
              >
                <Eye className="size-4" />
              </a>
            </Button>
            <Button asChild size="icon" variant="outline">
              <a
                target="_blank"
                href={`${import.meta.env.VITE_CERTIFICATE_URL}/cert/${pCert.key}/image.svg?bg=false`}
              >
                <EyeClosed className="size-4" />
              </a>
            </Button>
          </div>
        )}
      </TableCell>
      <TableCell>
        {result ? (
          !rCert ? (
            <Button
              onClick={handleResultClick}
              size="sm"
              className="capitalize"
            >
              Generate {result.result.position}
            </Button>
          ) : (
            <div className="flex gap-x-2">
              <Button asChild size="icon" variant="outline">
                <a
                  target="_blank"
                  href={`${import.meta.env.VITE_CERTIFICATE_URL}/cert/${rCert.key}/image.svg`}
                >
                  <Eye className="size-4" />
                </a>
              </Button>
              <Button asChild size="icon" variant="outline">
                <a
                  target="_blank"
                  href={`${import.meta.env.VITE_CERTIFICATE_URL}/cert/${rCert.key}/image.svg?bg=false`}
                >
                  <EyeClosed className="size-4" />
                </a>
              </Button>
            </div>
          )
        ) : (
          <div />
        )}
      </TableCell>
    </TableRow>
  );
};
