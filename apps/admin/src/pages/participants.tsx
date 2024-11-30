import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@sports/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sports/ui";
import { Button } from "@sports/ui";
import { ParticipantForm } from "@/components/participants/participant-form";
import { ParticipantList } from "@/components/participants/participant-list";
import { CSVImportForm } from "@/components/participants/csv-import-form";
import { api } from "@/lib/api";
import { useToast } from "@sports/ui";
import { Plus } from "lucide-react";

const sections = [
  { id: 1, name: "Civil Engineering" },
  { id: 2, name: "Mechanical Engineering" },
  { id: 3, name: "Electrical Engineering" },
  { id: 4, name: "Electronics Engineering" },
];

export default function ParticipantsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: participants = [] } = useQuery({
    queryKey: ["participants"],
    queryFn: api.participants.list,
  });

  const createParticipant = useMutation({
    mutationFn: api.participants.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participants"] });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Participant created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create participant",
        variant: "destructive",
      });
    },
  });

  const importParticipants = useMutation({
    mutationFn: (data: any[]) =>
      Promise.all(
        data.map((participant) => api.participants.create(participant)),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participants"] });
      setIsDialogOpen(false);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Participants</h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Participant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Participants</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="single">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Single</TabsTrigger>
                <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
              </TabsList>
              <TabsContent value="single">
                <ParticipantForm
                  sections={sections}
                  onSubmit={createParticipant.mutate}
                  isLoading={createParticipant.isPending}
                />
              </TabsContent>
              <TabsContent value="bulk">
                <CSVImportForm
                  onImport={importParticipants.mutate}
                  isLoading={importParticipants.isPending}
                />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <ParticipantList participants={participants} sections={sections} />
    </div>
  );
}
