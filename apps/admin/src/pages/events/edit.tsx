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
import { CertificateInput, singleCertTemplate } from "@/components/certInput";

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
  issuer: z.string().optional(),
  issuerDescription: z.string().optional(),
  registrationStartDate: z.string().nullish(),
  registrationEndDate: z.string().nullish(),
  image: z.string().nullish(),
  maxRegistrationPerParticipant: z.number().int().min(1).default(3),
  participationCertificate: z.string().optional(),
  participationBg: z.string().optional(),
  firstPrizeCertificate: z.string().optional(),
  firstPrizeCertificateBg: z.string().optional(),
  secondPrizeCertificate: z.string().optional(),
  secondPrizeCertificateBg: z.string().optional(),
  thirdPrizeCertificate: z.string().optional(),
  thirdPrizeCertificateBg: z.string().optional(),
});

const certificatesSchema = z
  .object({
    participation: singleCertTemplate,
    first: singleCertTemplate,
    second: singleCertTemplate,
    third: singleCertTemplate,
  })
  .nullish();

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
        startDate: new Date(editingEvent.startDate).toISOString().split("T")[0],
        endDate: new Date(editingEvent.endDate).toISOString().split("T")[0],
        participationCertificate: JSON.stringify(
          editingEvent.certificateTemplates?.participation
        ),
        firstPrizeCertificate: JSON.stringify(
          editingEvent.certificateTemplates?.first
        ),
        secondPrizeCertificate: JSON.stringify(
          editingEvent.certificateTemplates?.second
        ),
        thirdPrizeCertificate: JSON.stringify(
          editingEvent.certificateTemplates?.third
        ),
        participationBg:
          editingEvent.certificateTemplates?.participation
            ?.certificateBackground,
        firstPrizeCertificateBg:
          editingEvent.certificateTemplates?.first?.certificateBackground,
        secondPrizeCertificateBg:
          editingEvent.certificateTemplates?.second?.certificateBackground,
        thirdPrizeCertificateBg:
          editingEvent.certificateTemplates?.third?.certificateBackground,
        description: editingEvent.description ?? "",
        issuer: editingEvent.issuer ?? "",
        issuerDescription: editingEvent.issuerDescription ?? "",
      });
  }, [editingEvent]);

  const mutation = useMutation({
    mutationFn: async (values: EventFormValues) => {
      if (!editingEvent) return;

      const certificates = certificatesSchema.parse({
        participation: values.participationCertificate
          ? JSON.parse(values.participationCertificate)
          : undefined,
        first: values.firstPrizeCertificate
          ? JSON.parse(values.firstPrizeCertificate)
          : undefined,
        second: values.secondPrizeCertificate
          ? JSON.parse(values.secondPrizeCertificate)
          : undefined,
        third: values.thirdPrizeCertificate
          ? JSON.parse(values.thirdPrizeCertificate)
          : undefined,
      });

      if (certificates?.first && values.firstPrizeCertificateBg) {
        certificates.first.certificateBackground =
          values.firstPrizeCertificateBg;
      }
      if (certificates?.second && values.secondPrizeCertificateBg) {
        certificates.second.certificateBackground =
          values.secondPrizeCertificateBg;
      }
      if (certificates?.third && values.thirdPrizeCertificateBg) {
        certificates.third.certificateBackground =
          values.thirdPrizeCertificateBg;
      }
      if (certificates?.participation && values.participationBg) {
        certificates.participation.certificateBackground =
          values.participationBg;
      }

      const res = await apiClient.updateEvent(editingEvent.id, {
        ...values,
        certificateTemplates: certificates,
      });
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
                name="issuer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certificate Issuer</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="issuerDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certificate Issuer Description</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-4">
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
              </div>
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image</FormLabel>
                    <FormControl>
                      <div className="flex gap-4">
                        {field.value && (
                          <img
                            src={field.value}
                            className="w-full rounded-md overflow-hidden h-[78px] object-cover"
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
              <CertificateInput
                label="Participation Certificate Config"
                name="participationCertificate"
                bgName="participationBg"
              />
              <CertificateInput
                label="First Prize Certificate Config"
                name="firstPrizeCertificate"
                bgName="firstPrizeCertificateBg"
              />
              <CertificateInput
                label="Second Prize Certificate Config"
                name="secondPrizeCertificate"
                bgName="secondPrizeCertificateBg"
              />
              <CertificateInput
                label="Third Prize Certificate Config"
                name="thirdPrizeCertificate"
                bgName="thirdPrizeCertificateBg"
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
