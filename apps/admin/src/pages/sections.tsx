import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import {
  ColorPicker,
  FormControl,
  Label,
  Textarea,
  useToast,
} from "@sports/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@sports/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@sports/ui";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@sports/ui";
import { Input } from "@sports/ui";
import { Button } from "@sports/ui";
import { Plus, Trash2, FolderIcon } from "lucide-react";
import { useRequireAuth } from "../lib/auth";
import { EmptyState } from "../components/empty-state";
import { FileUpload } from "@/components/file-upload";

const sectionSchema = z.object({
  name: z.string().min(1, "Section name is required"),
  logo: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  slug: z.string().min(1).max(3),
});

type SectionFormValues = z.infer<typeof sectionSchema>;

export default function SectionsPage() {
  useRequireAuth("controller");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
  });

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["sections"],
    queryFn: () => apiClient.getSections(),
  });

  const createSection = useMutation({
    mutationFn: (data: SectionFormValues) => apiClient.addSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      setIsDialogOpen(false);
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

  const deleteSection = useMutation({
    mutationFn: (id: number) => apiClient.deleteSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      toast({
        title: "Success",
        description: "Section has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description:
          "Failed to delete section. It might be in use by participants.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto my-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Sections</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Section</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) =>
                  createSection.mutate(data)
                )}
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
                      <Input {...field} placeholder="e.g., CS, EL, EEE" />
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
                      <ColorPicker
                        {...field}
                        value={field.value || "#ffffff"}
                      />
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
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Logo</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sections.length > 0 ? (
              sections.map((section) => (
                <TableRow key={section.id}>
                  <TableCell>
                    {section.name} ({section.slug})
                  </TableCell>
                  <TableCell>
                    {section.logo && (
                      <img
                        src={section.logo}
                        alt={section.name}
                        className="h-8 w-8 object-contain"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {section.color && (
                      <div
                        className="h-6 w-6 rounded border"
                        style={{ backgroundColor: section.color }}
                      />
                    )}
                  </TableCell>
                  <TableCell>{section.description}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this section?"
                          )
                        ) {
                          deleteSection.mutate(section.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-96">
                  <EmptyState
                    icon={FolderIcon}
                    title="No sections found"
                    description="Get started by creating your first section."
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
