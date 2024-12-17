import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ColorPicker,
  FormControl,
  Textarea,
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

const sectionSchema = z.object({
  name: z.string().min(1, "Section name is required"),
  logo: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  slug: z.string().min(1).max(3).nullish(),
});

type SectionFormValues = z.infer<typeof sectionSchema>;

export const NewSectionPage = () => {
  const sectionId = useParams().sectionId;
  const queryClient = useQueryClient();

  const { data: sections = [] } = useQuery({
    queryKey: ["sections"],
    queryFn: () => apiClient.getSections(),
  });

  const section = sections.find((section) => section.id === Number(sectionId));

  const form = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
  });

  useEffect(() => {
    if (section) {
      form.reset(section);
    }
  }, [section]);
  const { toast } = useToast();

  const createSection = useMutation({
    mutationFn: (data: SectionFormValues) =>
      apiClient.editSection(Number(sectionId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      form.reset();
      toast({
        title: "Success",
        description: "Section has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create section. Please try again.",
        variant: "destructive",
      });
    },
  });

  const navigate = useNavigate();

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">New Section</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Section Details</CardTitle>
          <CardDescription>
            Create a new section by filling the following form
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => createSection.mutate(data))}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section Name</FormLabel>
                    <Input {...field} placeholder="e.g., Computer Science" />
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
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder="e.g., A brief description of the section "
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section Slug</FormLabel>
                    <Input {...field} value={field.value || ""} placeholder="e.g., CS, EL, EEE" />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <ColorPicker {...field} value={field.value || "#ffffff"} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logo"
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
                disabled={createSection.isPending}
              >
                {createSection.isPending ? "Creating..." : "Create Section"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
