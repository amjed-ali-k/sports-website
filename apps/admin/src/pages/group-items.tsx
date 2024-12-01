import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sports/ui";
import { apiClient } from "@/lib/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DataTable } from "@sports/ui";
import { ColumnDef } from "@tanstack/react-table";
import { useToast } from "@sports/ui";

const createGroupItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sectionId: z.number(),
  pointsFirst: z.number().min(0),
  pointsSecond: z.number().min(0),
  pointsThird: z.number().min(0),
  minParticipants: z.number().min(1),
  maxParticipants: z.number().min(1),
});

type GroupItem = {
  id: number;
  name: string;
  sectionId: number;
  pointsFirst: number;
  pointsSecond: number;
  pointsThird: number;
  minParticipants: number;
  maxParticipants: number;
};

export default function GroupItemsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(createGroupItemSchema),
    defaultValues: {
      name: "",
      sectionId: 0,
      pointsFirst: 5,
      pointsSecond: 3,
      pointsThird: 1,
      minParticipants: 2,
      maxParticipants: 4,
    },
  });

  const { data: sections } = useQuery({
    queryKey: ["sections"],
    queryFn: () => apiClient.get("/sections").json(),
  });

  const { data: groupItems, isLoading } = useQuery({
    queryKey: ["group-items"],
    queryFn: () => apiClient.get("/groups/items").json<GroupItem[]>(),
  });

  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof createGroupItemSchema>) =>
      apiClient.post("/groups/items", { json: data }).json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-items"] });
      setIsOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Group item created successfully",
      });
    },
  });

  const columns: ColumnDef<GroupItem>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "sectionId",
      header: "Section",
      cell: ({ row }) => {
        const section = sections?.find((s) => s.id === row.original.sectionId);
        return section?.name || row.original.sectionId;
      },
    },
    {
      accessorKey: "pointsFirst",
      header: "1st Place Points",
    },
    {
      accessorKey: "pointsSecond",
      header: "2nd Place Points",
    },
    {
      accessorKey: "pointsThird",
      header: "3rd Place Points",
    },
    {
      accessorKey: "minParticipants",
      header: "Min Participants",
    },
    {
      accessorKey: "maxParticipants",
      header: "Max Participants",
    },
  ];

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h1 className="text-2xl font-bold">Group Items</h1>
          <Button onClick={() => setIsOpen(true)}>Add Group Item</Button>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={groupItems || []} />
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Group Item</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a section" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sections?.map((section) => (
                          <SelectItem
                            key={section.id}
                            value={section.id.toString()}
                          >
                            {section.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="pointsFirst"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>1st Place Points</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pointsSecond"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>2nd Place Points</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pointsThird"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>3rd Place Points</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minParticipants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Participants</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxParticipants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Participants</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full">
                Create Group Item
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
