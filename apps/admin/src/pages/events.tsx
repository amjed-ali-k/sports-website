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
import { Input } from "@sports/ui";
import { useToast } from "@sports/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/api";
import { shake } from "radash";
import { format } from "date-fns/format";
import { FileUpload } from "@/components/file-upload";

const eventSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  startDate: z.string().transform((value) => {
    return new Date(value).toISOString();
  }),
  endDate: z.string().transform((value) => {
    return new Date(value).toISOString();
  }),
  description: z.string().optional(),
  eventStartTime: z.string().nullish(),
  eventEndTime: z.string().nullish(),
  registrationStartDate: z.string().nullish(),
  registrationEndDate: z.string().nullish(),
  logo: z.string().nullish(),
  maxRegistrationPerParticipant: z.number().int().min(1).default(3),
});

type EventFormValues = z.infer<typeof eventSchema>;

export default function EventsPage() {
  const [isOpen, setIsOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      id: undefined,
    },
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: () => apiClient.getEvents(),
  });

  const [editingEvent, setEditingEvent] = useState<(typeof events)[0] | null>(
    null
  );

  const mutation = useMutation({
    mutationFn: async (values: EventFormValues) => {
      const res = editingEvent?.id
        ? await apiClient.updateEvent(editingEvent.id, values)
        : await apiClient.createEvent({ ...values });
      if ("error" in res) {
        throw new Error("Failed to save event");
      } else {
        return res;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setIsOpen(false);
      setEditingEvent(null);
      form.reset();
      toast({
        title: "Success",
        description: `Item ${editingEvent ? "updated" : "created"} successfully`,
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

  const onSubmit = (values: EventFormValues) => {
    mutation.mutate(values);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Events Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Add New Event</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? "Edit Event" : "Add New Event"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxRegistrationPerParticipant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Registration per Participant</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FileUpload />
                <Button type="submit" className="w-full">
                  {editingEvent ? "Update" : "Create"} event
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Max items per participant</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events?.map((event) => (
            <TableRow key={event.id}>
              <TableCell>{event.name}</TableCell>
              <TableCell>
                {event.startDate && event.endDate
                  ? `${format(new Date(event.startDate), "dd-MM-yyyy")} to ${format(
                      new Date(event.endDate),
                      "dd-MM-yyyy"
                    )}`
                  : "N/A"}
              </TableCell>
              <TableCell className="capitalize">
                {event.maxRegistrationPerParticipant}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingEvent(event);
                    form.reset({
                      ...shake(event),
                      startDate: format(
                        new Date(event.startDate),
                        "yyyy-MM-dd"
                      ),
                      endDate: format(new Date(event.endDate), "yyyy-MM-dd"),
                      
                    });
                    setIsOpen(true);
                  }}
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
