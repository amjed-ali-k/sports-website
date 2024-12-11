import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@sports/ui";
import { Button } from "@sports/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@sports/ui";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@sports/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sports/ui";
import { useToast } from "@sports/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/api";
import { EmptyState } from "@/components/empty-state";
import { Award } from "lucide-react";
import { useParams } from "react-router-dom";

const resultSchema = z.object({
  position: z.enum(["first", "second", "third"]),
  registrationId: z.number(),
});

type ResultFormValues = z.infer<typeof resultSchema>;

export function GroupItemResultsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const { itemId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ResultFormValues>({
    resolver: zodResolver(resultSchema),
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["group-items"],
    queryFn: () => apiClient.getGroupItems(),
  });
  const { data: sections = [] } = useQuery({
    queryKey: ["sections"],
    queryFn: () => apiClient.getSections(),
  });
  const currentItem = items?.find((item) => item.id === Number(itemId));
  const { data: _registrations = [] } = useQuery({
    queryKey: ["group-registrations"],
    queryFn: () => {
      if (!currentItem) return [];
      return apiClient.getGroupRegistration(currentItem.id);
    },
    enabled: !!currentItem,
  });

  const registrations = "error" in _registrations ? [] : _registrations;

  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ["group-results"],
    queryFn: () => apiClient.getGroupResults(),
    enabled: !!currentItem,
  });

  const mutation = useMutation({
    mutationFn: async (values: ResultFormValues) => {
      const res = await apiClient.createGroupResult({
        ...values,
        groupRegistrationId: Number(values.registrationId),
      });
      if ("error" in res) {
        throw new Error("Failed to save result");
      } else {
        return res;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-results"] });
      setIsOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Result added successfully",
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

  const onSubmit = (values: ResultFormValues) => {
    mutation.mutate(values);
  };

  const isLoading = itemsLoading;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Results Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Add Result</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Result</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="first">First</SelectItem>
                          <SelectItem value="second">Second</SelectItem>
                          <SelectItem value="third">Third</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registrationId"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Participant</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                          value={field.value?.toString()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select participant" />
                          </SelectTrigger>
                          <SelectContent>
                            {registrations
                              ?.filter(
                                ({ registration: reg }) =>
                                  reg.groupItemId === Number(itemId) &&
                                  !results?.find(
                                    (e) =>
                                      e.result.groupRegistrationId === reg.id
                                  )
                              )
                              .map(({ registration: reg, participants }) => {
                                const users = JSON.parse(participants) as {
                                  id: number;
                                  name: string;
                                  chestNo: string;
                                  sectionId: string;
                                  batch: string;
                                }[];

                                const user = users[0];

                                return (
                                  <SelectItem
                                    key={reg.id}
                                    value={reg.id.toString()}
                                  >
                                    {user.name} ({user.chestNo}) and{" "}
                                    {users.length - 1} others
                                  </SelectItem>
                                );
                              })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <Button type="submit" className="w-full">
                  Add Result
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Position</TableHead>
            <TableHead>Participant</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resultsLoading ? (
            <>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="h-4 w-16 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-12 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                </TableRow>
              ))}
            </>
          ) : results?.length ? (
            results
              ?.filter(({ item }) => item.id === Number(itemId))
              .map(({ result, participants }) => {
                const users = JSON.parse(participants) as {
                  id: number;
                  name: string;
                  chestNo: string;
                  sectionId: string;
                  batch: string;
                }[];

                const user = users[0];
                return (
                  <TableRow key={result.id}>
                    <TableCell className="capitalize">
                      {result.position}
                    </TableCell>
                    <TableCell>
                      {user.name} ({user.chestNo}) and {users.length - 1} others
                    </TableCell>

                    <TableCell>
                      {
                        sections.find(
                          (section) => section.id === Number(user.sectionId)
                        )?.name
                      }
                    </TableCell>
                    <TableCell>{result.points}</TableCell>
                  </TableRow>
                );
              })
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-96">
                <EmptyState
                  icon={Award}
                  title="No results found"
                  description="Get started by creating your first section."
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
