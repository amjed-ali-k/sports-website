import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@sports/ui";
import { Input } from "@sports/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sports/ui";
import { useToast } from "@sports/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "../../lib/api";

const orgSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  description: z.string(),
});

type OrgFormData = z.infer<typeof orgSchema>;

export default function OrganizationsEditForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<OrgFormData>({
    resolver: zodResolver(orgSchema),
  });

  const updateSettings = useMutation({
    mutationFn: async (data: OrgFormData) => {
      return apiClient.updateOrganization(data);
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
      apiClient.getOrganization().then((res) => {
        form.reset(res);
      }),
  });

  function onSubmit(data: OrgFormData) {
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
          <CardTitle>Organization Settings</CardTitle>
          <CardDescription>Change organization details here</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Govt Polytechnic college, Perinthalmanna"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is institution/organization/college name.
                    </FormDescription>
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
                      <Input
                        disabled={isLoading}
                        placeholder="Your description here"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is public description of you organization.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={updateSettings.isPending}
              className="w-full"
            >
              {updateSettings.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
