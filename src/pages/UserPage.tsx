import React, { useEffect, useState } from "react";
import { getUsers, deleteUser, changeRole} from "../api_req";
import type { PublicUser } from "@/types";
import { useAuth } from "../hooks/useAuth";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Shield, ShieldOff, Trash2 } from "lucide-react";

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    await deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  async function handleRoleToggle(target: PublicUser) {
    const updated = await changeRole(target.id, !target.is_admin);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }

  if (loading) return (
    <div className="p-6 space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );

  if (error) return (
    <div className="p-6">
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </div>
  );

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">{users.length} total</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-medium">{u.username}</TableCell>
              <TableCell className="text-muted-foreground">{u.email}</TableCell>
              <TableCell>
                <Badge variant={u.is_admin ? "default" : "secondary"}>
                  {u.is_admin ? "Admin" : "User"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(u.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right space-x-2">
                {/* Don't show actions for yourself */}
                {u.id !== user?.id && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      title={u.is_admin ? "Remove admin" : "Make admin"}
                      onClick={() => handleRoleToggle(u)}
                    >
                      {u.is_admin
                        ? <ShieldOff className="h-4 w-4 text-muted-foreground" />
                        : <Shield className="h-4 w-4 text-primary" />}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger>
                        <Button variant="ghost" size="icon" title="Delete user">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {u.username}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This permanently deletes the account and all their saved tickers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(u.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}