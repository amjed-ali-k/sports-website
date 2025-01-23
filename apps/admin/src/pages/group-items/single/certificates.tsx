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
import { Award, Eye, EyeClosed } from "lucide-react";
import { SectionName } from "@/components/section-name";
import { apiClient, Certificate } from "@/lib/api";
import { flat } from "radash";
import { useParams } from "react-router-dom";
import { useState } from "react";
import JSZip from "jszip";
import { useGroupItem } from "@/hooks/use-item";
import { saveAs } from "file-saver";

export function SingleGroupItemCertificatesPage() {
  const { itemId } = useParams();

  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ["group-registrations"],
    queryFn: () => apiClient.getGroupRegistration(Number(itemId)),
  });
  const { data: sections = [] } = useQuery({
    queryKey: ["sections"],
    queryFn: () => apiClient.getSections(),
  });
  const regs = "error" in registrations ? [] : registrations;

  const data = flat(
    regs.map(({ registration, participants }) => {
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

      return users.map((user) => ({
        registration,
        participant: user,
        section,
      }));
    })
  );

  const { data: _pcerts } = useQuery({
    queryKey: ["certificates", Number(itemId), "participation"],
    queryFn: () =>
      itemId
        ? apiClient.getGroupCertificates(itemId.toString(), "participation")
        : null,
  });
  const pCerts = _pcerts ? ("error" in _pcerts ? [] : _pcerts) : [];
  const [downloading, setDownloading] = useState(false);

  const { currentItem } = useGroupItem(itemId);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const links = pCerts.map((e) => ({
        link: `${import.meta.env.VITE_CERTIFICATE_URL}/cert/${e.key}/image.svg`,
        ref: e.ref,
      }));
      // download all svgs in parallel and wait for them to finish
      const res = await Promise.all(
        links.map((link) => ({
          blob: fetch(link.link).then((res) => res.blob()),
          ref: link.ref,
        }))
      );

      const zip = new JSZip();
      res.forEach(({ blob, ref }) => {
        const reg = data?.find((e) => e.participant.id === ref);
        const participant = reg?.participant;
        zip.file(`${participant?.chestNo}-${participant?.name}.svg`, blob);
      });
      await zip.generateAsync({ type: "blob" }).then(function (content) {
        saveAs(
          content,
          `certificates-${currentItem?.name}-${currentItem?.gender}.zip`
        );
      });
    } catch (error) {}
    setDownloading(false);
  };

  const handleCopyCertificateUrls = () => {
    const links = pCerts.map((e) => ({
      link: `${import.meta.env.VITE_CERTIFICATE_URL}/cert/${e.key}`,
      reg: data?.find((k) => k.participant.id === e.ref),
    }));

    const text = `
Participation Certificates
${currentItem?.name} (${currentItem?.gender}) 
---
${links
  .map((e) => {
    const reg = e.reg;
    const participant = reg?.participant;
    return `${participant?.chestNo}-${participant?.name} : ${e.link}`;
  })
  .join("\n")}
`;
    navigator.clipboard.writeText(text);
  };
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Certificates</h1>
      </div>
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={handleCopyCertificateUrls}>
          Copy Participation Certificate URLs
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading
            ? "Downloading..."
            : "Download all participation certificates"}
        </Button>
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
          {data?.map((data) => (
            <Row
              key={data.registration.id}
              {...data}
              pCert={pCerts.find((e) => e.ref === data.participant.id)}
            />
          ))}
          {data?.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-96">
                <EmptyState
                  icon={Award}
                  title="No certificates found"
                  description="Certificates will be generated when participants participate in the event."
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
  pCert,
}: {
  registration: {
    id: number;
    name: string | null;
    createdAt: string;
    sectionId: number | null;
    groupItemId: number;
  };
  participant: {
    id: number;
    name: string;
    chestNo: string;
    sectionId: string;
    batch: string;
  };
  pCert: Certificate | undefined;
}) => {
  const itemId = registration.groupItemId;

  const { data: results } = useQuery({
    queryKey: ["group-results"],
    queryFn: () => apiClient.getGroupResults(),
    enabled: !!itemId,
  });

  const result = results?.find(
    (r) => r.result.groupRegistrationId === registration.id
  );

  const position = result?.result.position;

  const { data: _rcerts } = useQuery({
    queryKey: ["certificates", itemId, position],
    queryFn: () =>
      itemId && position
        ? apiClient.getGroupCertificates(itemId.toString(), position)
        : null,
  });

  const rCert = _rcerts
    ? "error" in _rcerts
      ? null
      : _rcerts.find((c) => c.ref === participant.id)
    : null;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const pCertMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.generateCertificate({
        id: participant.id,
        itemId: registration.groupItemId,
        participantId: participant.id,
        type: "participation",
        itemType: "group-item",
      });
      if ("error" in res) throw new Error(res.error);
      return res;
    },
    onSuccess: (newData) => {
      queryClient.setQueryData(
        ["certificates", itemId, "participation"],
        (d: Certificate[]) => (d ? [...d, newData] : d)
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
        id: participant.id,
        itemId: registration.groupItemId,
        participantId: participant.id,
        type: position!,
        itemType: "group-item",
      });
      if ("error" in res) throw new Error(res.error);
      return res;
    },
    onSuccess: (newData) => {
      queryClient.setQueryData(
        ["certificates", itemId, position],
        (d: Certificate[]) => (d ? [...d, newData] : d)
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

  return (
    <TableRow key={registration.id}>
      <TableCell>
        {participant.name} ({participant.chestNo})
      </TableCell>
      <TableCell>{participant.chestNo}</TableCell>
      <TableCell>
        <SectionName id={Number(participant.sectionId)} />
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
