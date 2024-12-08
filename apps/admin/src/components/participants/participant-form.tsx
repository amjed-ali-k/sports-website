import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Button } from "@sports/ui";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  sectionId: z.coerce.number().min(1, "Section is required"),
  batch: z.string(),
  gender: z.enum(["male", "female"]),
  avatar: z.string().optional(),
});

interface ParticipantFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void | Promise<void>;
  isLoading?: boolean;
}

export function ParticipantForm({ onSubmit, isLoading }: ParticipantFormProps) {
  const { data: sections = [] } = useQuery({
    queryKey: ["sections"],
    queryFn: () =>
      apiClient.getSections().then((s) => {
        s.length && form.setValue("sectionId", s[0].id);
        return s;
      }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      sectionId: sections[0]?.id || 1,
      gender: "male",
      avatar: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    await onSubmit(data);
    form.reset({
      batch: data.batch,
      sectionId: data.sectionId,
      gender: data.gender
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
          name="sectionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Section</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value.toString()}
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
                will better. It can be used to identify participatns in later
                events.
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
              <FormLabel>Avatar URL (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/avatar.jpg"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Participant"}
        </Button>
      </form>
    </Form>
  );
}
