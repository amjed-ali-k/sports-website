import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  useToast,
} from "@sports/ui";
import { Button } from "@sports/ui";
import { useNavigate } from "react-router-dom";
import { CSVImportForm } from "@/components/participants/csv-import-form";

export const ImportParticipantsPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const navigate = useNavigate();

  const importParticipants = useMutation({
    mutationFn: async (data: any[]) => {
      console.table(data)
      await Promise.all(
        data.map((participant) => apiClient.createParticipant(participant))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participants"] });
      toast({
        title: "Success",
        description: "Participants imported successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to import participants",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Import Participants</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Participant Details</CardTitle>
          <CardDescription>Import participants from a CSV file</CardDescription>
        </CardHeader>
        <CardContent>
          <CSVImportForm
            onImport={importParticipants.mutate}
            isLoading={importParticipants.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
};
