import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const settingsSchema = z.object({
  collegeName: z.string().min(1, 'College name is required'),
  year: z.string().min(1, 'Year is required'),
  eventName: z.string().min(1, 'Event name is required'),
  sponsors: z.array(z.string()),
  certificateTemplate: z.string().optional(),
  participationCertificateTemplate: z.string().optional(),
  assignedStaff: z.array(z.object({
    name: z.string(),
    role: z.string(),
    contact: z.string(),
  })),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      sponsors: [],
      assignedStaff: [],
    },
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    },
    onSuccess: (data) => {
      form.reset(data);
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: SettingsFormValues) => {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Settings updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: SettingsFormValues) => {
    mutation.mutate(values);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure system-wide settings for the sports event management system.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Basic information about the college and event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="collegeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>College Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eventName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="sponsors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sponsors</FormLabel>
                      <FormControl>
                        <Textarea
                          value={field.value?.join('\n')}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                .split('\n')
                                .map((s) => s.trim())
                                .filter(Boolean)
                            )
                          }
                          placeholder="Enter sponsors (one per line)"
                        />
                      </FormControl>
                      <FormDescription>
                        Enter each sponsor on a new line
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit">Save Settings</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Certificate Settings</CardTitle>
            <CardDescription>
              Configure certificate templates and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-4">
                <FormField
                  control={form.control}
                  name="certificateTemplate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Winner Certificate Template</FormLabel>
                      <FormControl>
                        <div className="flex gap-4">
                          <Input
                            type="file"
                            accept=".html,.pug"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  field.onChange(e.target?.result);
                                };
                                reader.readAsText(file);
                              }
                            }}
                          />
                          {field.value && (
                            <Button
                              variant="outline"
                              onClick={() => window.open(`/api/certificates/preview/winner`)}
                            >
                              Preview
                            </Button>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Upload an HTML or Pug template for winner certificates
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="participationCertificateTemplate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Participation Certificate Template</FormLabel>
                      <FormControl>
                        <div className="flex gap-4">
                          <Input
                            type="file"
                            accept=".html,.pug"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  field.onChange(e.target?.result);
                                };
                                reader.readAsText(file);
                              }
                            }}
                          />
                          {field.value && (
                            <Button
                              variant="outline"
                              onClick={() =>
                                window.open(`/api/certificates/preview/participation`)
                              }
                            >
                              Preview
                            </Button>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Upload an HTML or Pug template for participation certificates
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff Assignment</CardTitle>
            <CardDescription>
              Manage staff members assigned to the event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-4">
                <FormField
                  control={form.control}
                  name="assignedStaff"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-4">
                        {field.value?.map((staff, index) => (
                          <div key={index} className="grid grid-cols-3 gap-4">
                            <Input
                              placeholder="Name"
                              value={staff.name}
                              onChange={(e) => {
                                const newStaff = [...field.value];
                                newStaff[index] = {
                                  ...newStaff[index],
                                  name: e.target.value,
                                };
                                field.onChange(newStaff);
                              }}
                            />
                            <Input
                              placeholder="Role"
                              value={staff.role}
                              onChange={(e) => {
                                const newStaff = [...field.value];
                                newStaff[index] = {
                                  ...newStaff[index],
                                  role: e.target.value,
                                };
                                field.onChange(newStaff);
                              }}
                            />
                            <div className="flex gap-2">
                              <Input
                                placeholder="Contact"
                                value={staff.contact}
                                onChange={(e) => {
                                  const newStaff = [...field.value];
                                  newStaff[index] = {
                                    ...newStaff[index],
                                    contact: e.target.value,
                                  };
                                  field.onChange(newStaff);
                                }}
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={() => {
                                  const newStaff = field.value.filter(
                                    (_, i) => i !== index
                                  );
                                  field.onChange(newStaff);
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            field.onChange([
                              ...(field.value || []),
                              { name: '', role: '', contact: '' },
                            ]);
                          }}
                        >
                          Add Staff Member
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
