import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@sports/ui";
import { Button } from "@sports/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@sports/ui";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@sports/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sports/ui";
import { Input } from "@sports/ui";
import { useToast } from "@sports/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sports/ui";
import { Badge } from "@sports/ui";

const registrationSchema = z.object({
  itemId: z.number(),
  participantIds: z
    .array(z.number())
    .min(1, "At least one participant is required"),
  groupName: z.string().optional(),
  metaInfo: z.string().optional(),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export default function RegistrationsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>(
    [],
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
  });

  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ["items"],
    queryFn: async () => {
      const response = await fetch("/api/items");
      if (!response.ok) throw new Error("Failed to fetch items");
      return response.json();
    },
  });

  const { data: participants, isLoading: participantsLoading } = useQuery({
    queryKey: ["participants"],
    queryFn: async () => {
      const response = await fetch("/api/participants");
      if (!response.ok) throw new Error("Failed to fetch participants");
      return response.json();
    },
  });

  const { data: registrations, isLoading: registrationsLoading } = useQuery({
    queryKey: ["registrations", selectedItem?.id],
    queryFn: async () => {
      if (!selectedItem?.id) return [];
      const response = await fetch(
        `/api/registrations?itemId=${selectedItem.id}`,
      );
      if (!response.ok) throw new Error("Failed to fetch registrations");
      return response.json();
    },
    enabled: !!selectedItem?.id,
  });

  const mutation = useMutation({
    mutationFn: async (values: RegistrationFormValues) => {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Failed to create registration");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      setIsOpen(false);
      form.reset();
      setSelectedParticipants([]);
      toast({
        title: "Success",
        description: "Registration created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: RegistrationFormValues) => {
    mutation.mutate({
      ...values,
      participantIds: selectedParticipants,
    });
  };

  const isLoading = itemsLoading || participantsLoading || registrationsLoading;
  if (isLoading) return <div>Loading...</div>;

  const filteredParticipants = participants?.filter((p: any) => {
    if (!selectedItem) return true;
    // Filter by gender if item is gender-specific
    if (selectedItem.gender !== "any") {
      return p.gender === selectedItem.gender;
    }
    return true;
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Registrations Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Add Registration</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add Registration</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="itemId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          const item = items.find(
                            (i: any) => i.id === parseInt(value),
                          );
                          setSelectedItem(item);
                          field.onChange(parseInt(value));
                        }}
                        value={field.value?.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {items?.map((item: any) => (
                            <SelectItem
                              key={item.id}
                              value={item.id.toString()}
                            >
                              {item.name} ({item.gender})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedItem?.isGroup && (
                  <FormField
                    control={form.control}
                    name="groupName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Group Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter group name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="metaInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Info</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter additional information"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Select Participants</FormLabel>
                  <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                    {filteredParticipants?.map((participant: any) => (
                      <Card
                        key={participant.id}
                        className={`cursor-pointer ${
                          selectedParticipants.includes(participant.id)
                            ? "border-primary"
                            : ""
                        }`}
                        onClick={() => {
                          const newSelected = selectedParticipants.includes(
                            participant.id,
                          )
                            ? selectedParticipants.filter(
                                (id) => id !== participant.id,
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
                            Chest No: {participant.chestNo}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="flex gap-2">
                            <Badge>{participant.section.name}</Badge>
                            <Badge variant="outline">
                              Semester {participant.semester}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Create Registration
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <Select
          onValueChange={(value) => {
            const item = items.find((i: any) => i.id === parseInt(value));
            setSelectedItem(item);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an item to view registrations" />
          </SelectTrigger>
          <SelectContent>
            {items?.map((item: any) => (
              <SelectItem key={item.id} value={item.id.toString()}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedItem && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Participant</TableHead>
              <TableHead>Chest No</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Meta Info</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations?.map((registration: any) => (
              <TableRow key={registration.id}>
                <TableCell>{registration.participant.fullName}</TableCell>
                <TableCell>{registration.participant.chestNo}</TableCell>
                <TableCell>{registration.participant.section.name}</TableCell>
                <TableCell>{registration.groupName || "-"}</TableCell>
                <TableCell>{registration.metaInfo || "-"}</TableCell>
                <TableCell>
                  <Badge
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
