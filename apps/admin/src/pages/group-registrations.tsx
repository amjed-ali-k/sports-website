import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  MultiCombobox,
  FormMessage,
} from "@sports/ui";
import { apiClient } from "@/lib/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DataTable } from "@sports/ui";
import { ColumnDef } from "@tanstack/react-table";
import { useToast } from "@sports/ui";

const createGroupRegistrationSchema = z.object({
  groupItemId: z.number(),
  participantIds: z
    .array(z.number())
    .min(1, "At least one participant is required"),
});

export default function GroupRegistrationsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(createGroupRegistrationSchema),
    defaultValues: {
      groupItemId: 0,
      participantIds: [],
    },
  });

  const { data: groupItems = [] } = useQuery({
    queryKey: ["group-items"],
    queryFn: () => apiClient.getGroupItems(),
  });

  const { data: participants = [] } = useQuery({
    queryKey: ["participants"],
    queryFn: () => apiClient.getParticipants(),
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ["group-registrations"],
    queryFn: () => apiClient.getGroupRegistrations(),
  });

  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof createGroupRegistrationSchema>) =>
      apiClient.createGroupRegistration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-registrations"] });
      setIsOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Group registration created successfully",
      });
    },
  });

  const columns: ColumnDef<(typeof registrations)[0]>[] = [
    {
      accessorKey: "item.name",
      header: "Item",
    },
    {
      accessorKey: "participants",
      header: "Participants",
      cell: ({ row }) => {
        const p = JSON.parse(row.original.participants) as { name: string }[];
        return p.map((p) => p.name).join(", ");
      },
    },
  ];

  // Watch the selected group item to enforce participant limits
  const selectedGroupItem = form.watch("groupItemId");
  const selectedItem = groupItems?.find(
    (item) => item.id === selectedGroupItem
  );

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h1 className="text-2xl font-bold">Group Registrations</h1>
          <Button onClick={() => setIsOpen(true)}>Add Registration</Button>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={registrations || []} />
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Group Registration</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) =>
                createMutation.mutate(data)
              )}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="groupItemId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Item</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a group item" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {groupItems?.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="participantIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Participants{" "}
                      {selectedItem && (
                        <span className="text-sm text-gray-500">
                          (Min: {selectedItem.minParticipants}, Max:{" "}
                          {selectedItem.maxParticipants})
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <MultiCombobox
                        value={field.value.map(String)}
                        onValueChange={(values) =>
                          field.onChange(values.map(Number))
                        }
                        options={
                          participants
                            ?.filter(
                              (p) =>
                                selectedItem &&
                                selectedItem.gender !== "any" &&
                                p.participant.gender === selectedItem?.gender
                            )
                            .map(({ participant: p, section }) => ({
                              label: `${p.chestNo} - ${p.fullName} - [${section.name}]`,
                              value: String(p.id),
                            })) || []
                        }
                        placeholder="Search and select participants"
                        emptyText="No participants found"
                        className="w-full"
                        disabled={!selectedItem}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={
                  selectedItem &&
                  (form.watch("participantIds").length <
                    selectedItem.minParticipants ||
                    form.watch("participantIds").length >
                      selectedItem.maxParticipants)
                }
              >
                Create Registration
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
