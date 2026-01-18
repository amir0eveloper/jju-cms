"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateProfile } from "@/app/dashboard/profile/actions";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  username: string;
  role: string;
}

export function ProfileForm({ user }: { user: User }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setMessage(null);

    const res = await updateProfile(user.id, formData);

    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: "Profile updated successfully" });
    }
    setLoading(false);
  };

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Update your personal information and password.
        </CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Username</Label>
            <Input value={user.username} disabled className="bg-gray-100" />
            <p className="text-xs text-gray-500">Username cannot be changed.</p>
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input value={user.role} disabled className="bg-gray-100" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={user.name || ""}
              required
            />
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-3">Change Password</h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs" htmlFor="currentPassword">
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  placeholder="Required to change password"
                />
              </div>
              <div className="space-y-2 pb-2">
                <Label className="text-xs" htmlFor="newPassword">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  minLength={6}
                  placeholder="Leave blank to keep current"
                />
              </div>
              <div className="space-y-2 pb-2">
                <Label className="text-xs" htmlFor="confirmPassword">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  minLength={6}
                  placeholder="Re-enter new password"
                />
              </div>
            </div>
          </div>

          {message && (
            <div
              className={`p-3 rounded-md text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
            >
              {message.text}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
