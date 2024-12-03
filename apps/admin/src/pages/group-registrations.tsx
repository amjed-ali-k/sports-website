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
  Input,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Checkbox,
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

  const form = useForm<z.infer<typeof createGroupRegistrationSchema>>({
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

  const [searchQuery, setSearchQuery] = useState("");
  const filteredParticipants = participants
    ?.filter(
      (p) =>
        selectedItem &&
        selectedItem.gender !== "any" &&
        p.participant.gender === selectedItem?.gender
    )
    .filter((p) =>
      `${p.participant.chestNo} ${p.participant.fullName} ${p.section.name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
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
                      <div className="rounded-md border">
                        <div className="p-2 flex items-center border-b gap-2">
                          <Input
                            placeholder="Search participants..."
                            className="max-w-sm"
                            onChange={(e) => setSearchQuery(e.target.value)}
                            value={searchQuery}
                            disabled={!selectedItem}
                          />
                          <div className="ml-auto text-sm text-muted-foreground">
                            {field.value.length} selected
                          </div>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[50px]"></TableHead>
                              <TableHead>Chest No</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Section</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredParticipants.slice(0, 10).map((p) => (
                              <TableRow
                                key={p.participant.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => {
                                  const id = p.participant.id;
                                  const newValue = field.value.includes(id)
                                    ? field.value.filter((v) => v !== id)
                                    : [...field.value, id];
                                  field.onChange(newValue);
                                }}
                              >
                                <TableCell>
                                  <Checkbox
                                    checked={field.value.includes(p.participant.id)}
                                    onCheckedChange={() => {
                                      const id = p.participant.id;
                                      const newValue = field.value.includes(id)
                                        ? field.value.filter((v) => v !== id)
                                        : [...field.value, id];
                                      field.onChange(newValue);
                                    }}
                                  />
                                </TableCell>
                                <TableCell>{p.participant.chestNo}</TableCell>
                                <TableCell>{p.participant.fullName}</TableCell>
                                <TableCell>{p.section.name}</TableCell>
                              </TableRow>
                            ))}
                            {filteredParticipants.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                  No participants found
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                        {filteredParticipants.length > 10 && (
                          <div className="p-2 text-center text-sm text-muted-foreground border-t">
                            Showing first 10 of {filteredParticipants.length} participants
                          </div>
                        )}
                      </div>
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
