import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useToast } from '../components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const resultSchema = z.object({
  itemId: z.number(),
  position: z.enum(['first', 'second', 'third']),
  registrationId: z.number(),
  points: z.number().min(0),
});

type ResultFormValues = z.infer<typeof resultSchema>;

export default function ResultsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ResultFormValues>({
    resolver: zodResolver(resultSchema),
  });

  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const response = await fetch('/api/items');
      if (!response.ok) throw new Error('Failed to fetch items');
      return response.json();
    },
  });

  const { data: registrations, isLoading: registrationsLoading } = useQuery({
    queryKey: ['registrations', selectedItem],
    queryFn: async () => {
      if (!selectedItem) return [];
      const response = await fetch(`/api/registrations?itemId=${selectedItem}`);
      if (!response.ok) throw new Error('Failed to fetch registrations');
      return response.json();
    },
    enabled: !!selectedItem,
  });

  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ['results', selectedItem],
    queryFn: async () => {
      if (!selectedItem) return [];
      const response = await fetch(`/api/results?itemId=${selectedItem}`);
      if (!response.ok) throw new Error('Failed to fetch results');
      return response.json();
    },
    enabled: !!selectedItem,
  });

  const mutation = useMutation({
    mutationFn: async (values: ResultFormValues) => {
      const response = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error('Failed to save result');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      setIsOpen(false);
      form.reset();
      toast({
        title: 'Success',
        description: 'Result added successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: ResultFormValues) => {
    mutation.mutate(values);
  };

  const isLoading = itemsLoading || registrationsLoading || resultsLoading;
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="itemId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(parseInt(value));
                          setSelectedItem(parseInt(value));
                        }}
                        value={field.value?.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {items?.map((item: any) => (
                            <SelectItem key={item.id} value={item.id.toString()}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Participant</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select participant" />
                        </SelectTrigger>
                        <SelectContent>
                          {registrations?.map((reg: any) => (
                            <SelectItem key={reg.id} value={reg.id.toString()}>
                              {reg.participant.fullName} ({reg.participant.chestNo})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Add Result
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <Select onValueChange={(value) => setSelectedItem(parseInt(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Select an item to view results" />
          </SelectTrigger>
          <SelectContent>
            {items?.map((item: any) => (
              <SelectItem key={item.id} value={item.id.toString()}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedItem && (
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
            {results?.map((result: any) => (
              <TableRow key={result.id}>
                <TableCell className="capitalize">
                  {result.position}
                </TableCell>
                <TableCell>
                  {result.registration.participant.fullName}
                </TableCell>
                <TableCell>
                  {result.registration.participant.chestNo}
                </TableCell>
                <TableCell>
                  {result.registration.participant.section.name}
                </TableCell>
                <TableCell>{result.points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
