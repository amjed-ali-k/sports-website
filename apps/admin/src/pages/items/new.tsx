import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@sports/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@sports/ui";
import {
  Form,
  FormControl,
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
import { useToast } from "@sports/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";
import { iconsList } from "@/components/icon";

const itemSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  eventId: z.number(),
  gender: z.enum(["male", "female", "any"]),
  pointsFirst: z.number().min(0),
  pointsSecond: z.number().min(0),
  pointsThird: z.number().min(0),
  iconName: z.string().optional().nullable(),
});

export type ItemFormValues = z.infer<typeof itemSchema>;

export const NewItemFormDialog = ({
  editingItem,
  setEditingItem,
}: {
  editingItem: ItemFormValues | null;
  setEditingItem: (e: ItemFormValues | null) => void;
}) => {
  const [isOpen, _setIsOpen] = useState(false);

  useEffect(() => {
    if (editingItem) {
      _setIsOpen(true);
      form.reset(editingItem);
    }
  }, [editingItem]);

  const setIsOpen = (e: boolean) => {
    if (!e) {
      setEditingItem(null);
    }
    _setIsOpen(e);
  };

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      id: undefined,
      gender: "any",
      pointsFirst: 5,
      pointsSecond: 3,
      pointsThird: 1,
      // status: "yet_to_begin",
    },
  });

  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: () => apiClient.getEvents(),
  });

  const mutation = useMutation({
    mutationFn: async (values: ItemFormValues) => {
      const res = editingItem?.id
        ? await apiClient.updateItem(editingItem.id, values)
        : await apiClient.createItem({ ...values, maxParticipants: 100 });
      if ("error" in res) {
        throw new Error("Failed to save item");
      } else {
        return res;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      setIsOpen(false);
      setEditingItem(null);
      form.reset();
      toast({
        title: "Success",
        description: `Item ${editingItem ? "updated" : "created"} successfully`,
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

  const onSubmit = (values: ItemFormValues) => {
    mutation.mutate(values);
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add New Item</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingItem ? "Edit Item" : "Add New Item"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eventId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events?.map((ev: any) => (
                        <SelectItem key={ev.id} value={ev.id.toString()}>
                          {ev.name}
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
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="any">Any</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="pointsFirst"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>1st Points</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pointsSecond"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>2nd Points</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pointsThird"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>3rd Points</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="iconName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    {/* <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      /> */}
                    <div className="flex gap-2 flex-wrap">
                      {iconsList.map(({ name, icon: Icon }) => (
                        <Button
                          key={name}
                          variant="outline"
                          type="button"
                          role="button"
                          className={cn("p-2", {
                            "bg-slate-200 ring-slate-500 ring-2":
                              field.value === name,
                          })}
                          onClick={() => field.onChange(name)}
                          aria-pressed={field.value === name}
                        >
                          <Icon className="size-6" />
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              {editingItem ? "Update" : "Create"} Item
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
