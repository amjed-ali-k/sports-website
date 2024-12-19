import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { FileUpload } from "@/components/file-upload";
import { useNavigate, useParams } from "react-router-dom";

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
  image: z.string().nullish(),
  maxRegistrationPerParticipant: z.number().int().min(1).default(3),
});

type EventFormValues = z.infer<typeof eventSchema>;

export default function EditEventsPage() {
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

  const eventId = useParams().eventId;

  const editingEvent = events.find((event) => event.id === Number(eventId));

  useEffect(() => {
    if (editingEvent)
      form.reset({
        ...editingEvent,
        description: editingEvent.description ?? "",
      });
  }, [editingEvent]);

  const mutation = useMutation({
    mutationFn: async (values: EventFormValues) => {
      if (!editingEvent) return;
      const res = await apiClient.updateEvent(editingEvent.id, values);
      if ("error" in res) {
        throw new Error("Failed to save event");
      } else {
        return res;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      form.reset();
      toast({
        title: "Success",
        description: `Item updated successfully`,
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
  const navigate = useNavigate();
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Edit event - {editingEvent?.name}
        </h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            Update event by filling the following form
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo</FormLabel>
                    <FormControl>
                      <div>
                        {field.value && (
                          <img
                            src={field.value}
                            className="w-full h-24 object-cover"
                          />
                        )}
                        <FileUpload
                          onFileUpload={({ url }) => field.onChange(url)}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Update event
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
