import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form } from "@sports/ui";
import { Input } from "@sports/ui";
import { Label } from "@sports/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sports/ui";
import { Switch } from "@sports/ui";
import { useToast } from "@sports/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "../../lib/api";

const settingsSchema = z.object({
  eventName: z.string().min(1, "Event name is required"),
  eventDate: z.string().min(1, "Event date is required"),
  registrationEndDate: z.string().min(1, "Registration end date is required"),
  maxRegistrationsPerParticipant: z.string(),
  isRegistrationOpen: z.string(),
  isResultsPublished: z.string(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsEditForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      eventName: "",
      eventDate: "",
      registrationEndDate: "",
      maxRegistrationsPerParticipant: "3",
      isRegistrationOpen: "false",
      isResultsPublished: "false",
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (data: SettingsFormData) => {
      return apiClient.updateSettings(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast({
        title: "Settings updated",
        description: "Your settings have been updated successfully.",
      });
    },
  });

  const { isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () =>
      apiClient.getSettings().then((res) => {
        form.reset(res);
      }),
  });

  function onSubmit(data: SettingsFormData) {
    updateSettings.mutate(data);
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  console.log(form.formState.errors);
  return (
    <div className="container mx-auto my-4">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Manage your event settings here. Changes will be applied
            immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="eventName">Event Name</Label>
                  <Input
                    id="eventName"
                    {...form.register("eventName")}
                    placeholder="Enter event name"
                  />
                  {form.formState.errors.eventName && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.eventName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="eventDate">Event Date</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    {...form.register("eventDate")}
                  />
                  {form.formState.errors.eventDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.eventDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="registrationEndDate">
                    Registration End Date
                  </Label>
                  <Input
                    id="registrationEndDate"
                    type="date"
                    {...form.register("registrationEndDate")}
                  />
                  {form.formState.errors.registrationEndDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.registrationEndDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="maxRegistrationsPerParticipant">
                    Max Registrations Per Participant
                  </Label>
                  <Input
                    id="maxRegistrationsPerParticipant"
                    type="number"
                    {...form.register("maxRegistrationsPerParticipant")}
                  />
                  {form.formState.errors.maxRegistrationsPerParticipant && (
                    <p className="text-red-500 text-sm mt-1">
                      {
                        form.formState.errors.maxRegistrationsPerParticipant
                          .message
                      }
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isRegistrationOpen"
                    checked={form.watch("isRegistrationOpen") == "true"}
                    onCheckedChange={(checked) =>
                      form.setValue(
                        "isRegistrationOpen",
                        checked ? "true" : "false"
                      )
                    }
                  />
                  <Label htmlFor="isRegistrationOpen">Registration Open</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isResultsPublished"
                    checked={form.watch("isResultsPublished") == "true"}
                    onCheckedChange={(checked) =>
                      form.setValue(
                        "isResultsPublished",
                        checked ? "true" : "false"
                      )
                    }
                  />
                  <Label htmlFor="isResultsPublished">Results Published</Label>
                </div>
              </div>

              <Button
                type="submit"
                disabled={updateSettings.isPending}
                className="w-full"
              >
                {updateSettings.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
