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
import { Badge } from "@sports/ui";
import { useAuth, useRequireAuth } from "../lib/auth";
import { apiClient } from "@/lib/api";

const adminSchema = z.object({
  id: z.number().optional(),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  name: z.string().min(1, "Name is required"),
  role: z.enum(["rep", "manager", "controller", "super_admin"]),
});

type AdminFormValues = z.infer<typeof adminSchema>;

export default function AdminsPage() {
  useRequireAuth("controller");
  const { admin: currentAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminFormValues | null>(
    null
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      role: "rep",
    },
  });

  const { data: admins, isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: () => apiClient.getAdmins(),
  });

  const mutation = useMutation({
    mutationFn: async (values: AdminFormValues) => {
      editingAdmin?.id
        ? await apiClient.updateAdmin(editingAdmin.id, values)
        : await apiClient.createAdmin({...values, password: values.password || 'admin123'});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setIsOpen(false);
      setEditingAdmin(null);
      form.reset();
      toast({
        title: "Success",
        description: `Admin ${editingAdmin ? "updated" : "created"} successfully`,
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

  const onSubmit = (values: AdminFormValues) => {
    mutation.mutate(values);
  };

  if (isLoading) return <div>Loading...</div>;

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "controller":
        return "default";
      case "manager":
        return "secondary";
      default:
        return "outline";
    }
  };
  console.log()

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admins Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Add Admin</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAdmin ? "Edit Admin" : "Add Admin"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!editingAdmin && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

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
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rep">Rep</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="controller">Controller</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  {editingAdmin ? "Update" : "Create"} Admin
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins?.map((admin) => (
            <TableRow key={admin.id}>
              <TableCell>{admin.name}</TableCell>
              <TableCell>{admin.email}</TableCell>
              <TableCell>
                <Badge variant={getRoleBadgeVariant(admin.role)}>
                  {admin.role}
                </Badge>
              </TableCell>
              <TableCell>
                {currentAdmin?.id !== admin.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingAdmin(admin);
                      form.reset(admin);
                      setIsOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
