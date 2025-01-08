import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FormControl,
  FormDescription,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from "@sports/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@sports/ui";
import { Input } from "@sports/ui";
import { Button } from "@sports/ui";
import { FileUpload } from "@/components/file-upload";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";

const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  sectionId: z.coerce.number().min(1, "Section is required"),
  batch: z.string(),
  gender: z.enum(["male", "female"]),
  avatar: z.string().nullish(),
  no: z.string().nullish(),
  chestNo: z.string().nullish(),
});

type ParticipantFormValues = z.infer<typeof formSchema>;

export const EditParticipantsPage = () => {
  const participantId = useParams().participantId;
  const queryClient = useQueryClient();

  const { data: sections = [] } = useQuery({
    queryKey: ["sections"],
    queryFn: () => apiClient.getSections(),
  });

  const { data: participants = [] } = useQuery({
    queryKey: ["participants"],
    queryFn: () => apiClient.getParticipants(),
  });

  const participant = participants.find(
    (participant) => participant.participant.id === Number(participantId)
  )?.participant;

  const form = useForm<ParticipantFormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (participant) {
      form.reset(participant);
    }
  }, [participant]);

  const { toast } = useToast();

  const createParticipant = useMutation({
    mutationFn: (data: ParticipantFormValues) =>
      apiClient.updateParticipant(Number(participantId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participants"] });
      form.reset();
      toast({
        title: "Success",
        description: "participant has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create participant. Please try again.",
        variant: "destructive",
      });
    },
  });

  const navigate = useNavigate();

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Edit Participant - {participant?.fullName}
        </h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Participant Details</CardTitle>
          <CardDescription>
            Edit participant by filling the following form
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) =>
                createParticipant.mutate(data)
              )}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No</FormLabel>
                    <FormControl>
                      <Input placeholder="23424" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Enter the unique identification number. Eg. Admisson no,
                      Registration No etc. It can be used to identify
                      participatns in later events.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="chestNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chest No</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="42"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Optional Chest No
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sectionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a section" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sections.map((section) => (
                          <SelectItem
                            key={section.id}
                            value={section.id?.toString() || ""}
                          >
                            {section.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      {sections.length === 0
                        ? "No sections found!. Add new section first"
                        : "Select a section/department/branch/trade for the participant."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="batch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch</FormLabel>
                    <FormControl>
                      <Input placeholder="EL2024" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Enter the code of batch. Using codes with{" "}
                      <span className="font-bold">passout year </span>
                      will better. It can be used to identify participatns in
                      later events.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="avatar"
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

              <Button
                type="submit"
                className="w-full"
                disabled={createParticipant.isPending}
              >
                {createParticipant.isPending
                  ? "Editing..."
                  : "Edit participant"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
