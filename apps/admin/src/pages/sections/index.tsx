import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useToast } from "@sports/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@sports/ui";
import { Button } from "@sports/ui";
import { Plus, Trash2, FolderIcon, Edit } from "lucide-react";
import { useRequireAuth } from "@/lib/auth";
import { EmptyState } from "@/components/empty-state";
import { Link } from "react-router-dom";

export default function SectionsPage() {
  useRequireAuth("controller");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["sections"],
    queryFn: () => apiClient.getSections(),
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

        <Button asChild>
          <Link to="/sections/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </Link>
        </Button>
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
                  <TableCell className="flex">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/sections/${section.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
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
