import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  FormLabel,
  Input,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  useToast,
} from "@sports/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { apiClient } from "@/lib/api";
import { useMemo } from "react";
import { useIndividualItem } from "@/hooks/use-item";
import { useRegistrations } from "@/hooks/use-registrations";
import { sift } from "radash";
import { useRole } from "@/lib/auth";

const registrationSchema = z.object({
  itemId: z.number(),
  metaInfo: z.string().optional(),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export function NewRegistrationPage() {
  const { itemId } = useParams();

  const [selectedParticipants, setSelectedParticipants] = useState<number[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      itemId: Number(itemId),
    },
  });

  const selectedItem = useIndividualItem(itemId);

  const { data: participants = [], isLoading: participantsLoading } = useQuery({
    queryKey: ["participants"],
    queryFn: () => apiClient.getParticipants(),
  });

  const { registrations } = useRegistrations();
  const mutation = useMutation({
    mutationFn: async (
      values: RegistrationFormValues & {
        participantIds: number[];
      }
    ) => {
      const res = await Promise.all(
        values.participantIds.map((participantId: number) => {
          return apiClient.createRegistration({ ...values, participantId });
        })
      );

      const newData = sift(
        res.map((e) => {
          if ("error" in e) return;
          return e;
        })
      );
      return newData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["registrations-item", "registrations", itemId],
      });

      queryClient;
      toast({
        title: "Success",
        description: "Registration created successfully",
      });
      navigate(-1);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  const isAdmin = useRole("controller");

  const onSubmit = (values: RegistrationFormValues) => {
    if (!isAdmin && selectedItem?.canRegister === 0) {
      toast({
        title: "Error",
        description: "Registration is closed for this item",
        variant: "destructive",
      });
      return;
    }
    if (selectedParticipants.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one participant",
        variant: "destructive",
      });
      return;
    }
    if(!mutation.isPending)
    mutation.mutate({
      ...values,
      participantIds: selectedParticipants,
    });
  };

  const isLoading = selectedItem?.isLoading || participantsLoading;

  const filteredParticipants = participants?.filter(({ participant: p }) => {
    if (!selectedItem) return true;
    if (registrations?.find(({ participant }) => participant.id === p.id))
      return false;
    // Filter by gender if item is gender-specific
    if (selectedItem.gender !== "any") {
      return p.gender === selectedItem.gender;
    }
    return true;
  });

  const filteredAndSearchedParticipants = useMemo(() => {
    return filteredParticipants?.filter(({ participant }) => {
      const searchStr = searchQuery.toLowerCase();
      return (
        participant.fullName.toLowerCase().includes(searchStr) ||
        participant.chestNo?.toString().includes(searchStr) ||
        participant.batch.toString().includes(searchStr)
      );
    });
  }, [filteredParticipants, searchQuery]);

  const paginatedParticipants = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredAndSearchedParticipants?.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredAndSearchedParticipants, page]);

  if (isLoading) return <div>Loading...</div>;
  if (!selectedItem) return <div>Item not found</div>;

  const totalPages = Math.ceil(
    (filteredAndSearchedParticipants?.length || 0) / itemsPerPage
  );

  return (
    <div className="lg:container  max-w-4xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">New Registration</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Registration Details</CardTitle>
          <CardDescription>
            Create a new registration by selecting an item and participants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormLabel>
                  Select Participants{" "}
                  <Badge className="font-bold pt-1" variant="default">
                    {selectedParticipants.length} Selected
                  </Badge>{" "}
                </FormLabel>
                <div className="lg:flex-row flex flex-col items-center gap-4">
                  <Input
                    placeholder="Search by name, chest no, or semester..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="max-w-md"
                  />
                  <p className="text-sm text-muted-foreground">
                    Showing {paginatedParticipants?.length || 0} of{" "}
                    {filteredAndSearchedParticipants?.length || 0} participants
                  </p>
                </div>
                <div className="grid lg:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                  {paginatedParticipants?.map(({ participant, section }) => (
                    <Card
                      key={participant.id}
                      className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                        selectedParticipants.includes(participant.id)
                          ? "border-primary/25 bg-gradient-to-br from-purple-200 to-orange-200"
                          : ""
                      }`}
                      onClick={() => {
                        const newSelected = selectedParticipants.includes(
                          participant.id
                        )
                          ? selectedParticipants.filter(
                              (id) => id !== participant.id
                            )
                          : [...selectedParticipants, participant.id];
                        setSelectedParticipants(newSelected);
                      }}
                    >
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm font-medium">
                          {participant.fullName}
                        </CardTitle>
                        <CardDescription>
                          Chest No: {participant.chestNo}{" "}
                          {participant.no && ` - ID No: ${participant.no}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex gap-2">
                          <Badge className="h-4 truncate">{section.name}</Badge>

                          <Badge className="h-4 truncate" variant="outline">
                            {participant.batch}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        Page {page} of {totalPages}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={mutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  Create Registration
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
