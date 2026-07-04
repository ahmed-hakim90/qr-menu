"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/dashboard-api";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
};

export function UsersManager({
  initialUsers,
  currentUserId,
}: {
  initialUsers: UserRow[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CAPTAIN",
  });

  const refresh = async () => {
    const data = await apiRequest<UserRow[]>("/api/users");
    setUsers(data);
  };

  const createUser = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await apiRequest("/api/users", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm({ name: "", email: "", password: "", role: "CAPTAIN" });
      await refresh();
      toast.success("User created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create user");
    }
  };

  const updateUser = async (id: string, data: Partial<UserRow & { password?: string }>) => {
    try {
      await apiRequest(`/api/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      await refresh();
      toast.success("User updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update user");
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;

    try {
      await apiRequest(`/api/users/${id}`, { method: "DELETE" });
      await refresh();
      toast.success("User deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete user");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <PasswordInput
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value })}
              >
                <option value="MANAGER">Manager</option>
                <option value="CAPTAIN">Captain</option>
                <option value="CASHIER">Cashier</option>
                <option value="VIEWER">Viewer</option>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Button type="submit">
                <Plus className="h-4 w-4" />
                Add User
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4">
              <div>
                <h3 className="font-medium">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Select
                  value={user.role}
                  onChange={(event) => updateUser(user.id, { role: event.target.value })}
                >
                  <option value="OWNER">Owner</option>
                  <option value="MANAGER">Manager</option>
                  <option value="CAPTAIN">Captain</option>
                  <option value="CASHIER">Cashier</option>
                  <option value="VIEWER">Viewer</option>
                </Select>
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={user.isActive}
                    onCheckedChange={(value) => updateUser(user.id, { isActive: value })}
                  />
                  Active
                </label>
                <Badge>{user.role}</Badge>
                {user.id !== currentUserId && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => deleteUser(user.id)}
                    title="Delete user"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
