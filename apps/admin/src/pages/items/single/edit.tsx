import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  FormControl,
  FormDescription,
  Input,
  Switch,
} from "@sports/ui";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@sports/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sports/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@sports/ui";
import { useToast } from "@sports/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/api";
import { iconsList } from "@/components/icon";
import { cn } from "@/lib/utils";
import { useItem } from "./layout";
import { useNavigate } from "react-router-dom";

const itemSchema = z.object({
  status: z.enum(["scheduled", "on-going", "finished"]),
  id: z.number(),
  name: z.string(),
  pointsFirst: z.number(),
  pointsSecond: z.number(),
  pointsThird: z.number(),
  iconName: z.string().nullish(),
  canRegister: z.number(),
  isFinished: z.number(),
  isResultPublished: z.number(),
  maxParticipants: z.number().nullish(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

export function ItemEditPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
  });

  const { currentItem, isLoading: itemsLoading } = useItem();

  useEffect(() => {
    if (currentItem) {
      form.reset(currentItem);
    }
  }, [currentItem]);

  const mutation = useMutation({
    mutationFn: async (values: ItemFormValues) => {
      if (!currentItem) return;
      const res = await apiClient.updateItem(values.id, {
        ...currentItem,
        ...values,
      });
      if ("error" in res) {
        throw new Error("Failed to save result");
      } else {
        return res;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
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

  const onSubmit = (values: ItemFormValues) => {
    mutation.mutate(values);
  };

  const isLoading = itemsLoading;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold">Edit Item</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter item name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="on-going">On Going</SelectItem>
                      <SelectItem value="finished">Finished</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="canRegister"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Registration</FormLabel>
                    <FormDescription>
                      Enable or disable registration to this item
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value == 1}
                      onCheckedChange={(e) => field.onChange(e ? 1 : 0)}
                    />
                  </FormControl>
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
          <div className="flex items-center gap-4">
            <Button type="submit" className="w-fit">
              Edit Item
            </Button>
            <DeleteButton id={currentItem?.id || 0} />
          </div>
        </form>
      </Form>
    </div>
  );
}

const DeleteButton = ({ id }: { id: number }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();
  const handleDelete = async () => {
    await apiClient.deleteItem(id);
    queryClient.invalidateQueries({ queryKey: ["items"] });
    toast({
      title: "Success",
      description: "Item deleted successfully",
    });
    navigate("/items");
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" >
          Delete Item
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete item and
            remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
