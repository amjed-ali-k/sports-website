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
  FormMessage,
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
  pointsFirst: z.number().min(0),
  pointsSecond: z.number().min(0),
  pointsThird: z.number().min(0),
  minParticipants: z.number().min(1),
  maxParticipants: z.number().min(1),
  categoryId: z.number(),
  gender: z.enum(["male", "female", "any"]),
});

type GroupItem = {
  id: number;
  name: string;
  pointsFirst: number;
  pointsSecond: number;
  pointsThird: number;
  minParticipants: number;
  maxParticipants: number;
  categoryId: number;
  gender: "male" | "female" | "any";
};

export default function GroupItemsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof createGroupItemSchema>>({
    resolver: zodResolver(createGroupItemSchema),
    defaultValues: {
      name: "",
      pointsFirst: 5,
      pointsSecond: 3,
      pointsThird: 1,
      minParticipants: 2,
      maxParticipants: 4,
      categoryId: 1,
    },
  });

  const { data: groupItems } = useQuery({
    queryKey: ["group-items"],
    queryFn: () => apiClient.getGroupItems(),
  });

  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof createGroupItemSchema>) =>
      apiClient.createGroupItem(data),
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
              onSubmit={form.handleSubmit((d) => createMutation.mutate(d))}
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
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
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
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
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
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
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
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
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
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="any">Any</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
