import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  SelectGroup,
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
import { useResults } from "@/hooks/use-results";
import { useRole } from "@/lib/auth";

const resultSchema = z.object({
  position: z.enum(["first", "second", "third"]),
  registrationId: z.number(),
});

type ResultFormValues = z.infer<typeof resultSchema>;

export function ItemResultsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const { itemId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAdmin = useRole("controller");

  const form = useForm<ResultFormValues>({
    resolver: zodResolver(resultSchema),
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["items"],
    queryFn: () => apiClient.getItems(),
  });
  const { data: sections = [] } = useQuery({
    queryKey: ["sections"],
    queryFn: () => apiClient.getSections(),
  });
  const currentItem = items?.find(
    (item) => item.item.id === Number(itemId)
  )?.item;

  const { data: registrations = [] } = useQuery({
    queryKey: ["registrations"],
    queryFn: () => {
      if (!currentItem) return [];
      return apiClient.getRegistrations();
    },
    enabled: !!currentItem,
  });

  const { results, isLoading: resultsLoading } = useResults();

  const mutation = useMutation({
    mutationFn: async (values: ResultFormValues) => {
      const res = await apiClient.createResult({
        ...values,
        itemId: Number(itemId),
      });
      if ("error" in res) {
        throw new Error("Failed to save result");
      } else {
        return res;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results"] });
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
    if (!isAdmin) {
      toast({
        title: "Error",
        description: "You don't have permission to perform this action",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate(values);
  };

  const isLoading = itemsLoading;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Results Management</h1>
        {(currentItem?.canRegister || isAdmin) && (
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
                            <SelectContent className="overflow-y-auto max-h-[10rem]">
                              <SelectGroup>
                                {registrations
                                  ?.filter(
                                    ({ registration: reg }) =>
                                      reg.itemId === Number(itemId) &&
                                      !results?.find(
                                        (e) =>
                                          e.result.registrationId === reg.id
                                      )
                                  )
                                  .map(({ registration: reg, participant }) => (
                                    <SelectItem
                                      key={reg.id}
                                      value={reg.id.toString()}
                                    >
                                      {participant.fullName} (
                                      {participant.chestNo})
                                    </SelectItem>
                                  ))}
                              </SelectGroup>
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
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Position</TableHead>
            <TableHead>Participant</TableHead>
            <TableHead>Chest No</TableHead>
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
                    <div className="h-4 w-12 animate-pulse rounded bg-muted"></div>
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
              ?.filter(({ result }) => result.itemId === Number(itemId))
              .map(({ result, participant }) => (
                <TableRow key={result.id}>
                  <TableCell className="capitalize">
                    {result.position}
                  </TableCell>
                  <TableCell>{participant.fullName}</TableCell>
                  <TableCell>{participant.chestNo}</TableCell>
                  <TableCell>
                    {
                      sections.find(
                        (section) => section.id === participant.sectionId
                      )?.name
                    }
                  </TableCell>
                  <TableCell>{result.points}</TableCell>
                </TableRow>
              ))
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
