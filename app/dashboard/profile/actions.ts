"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";

export async function updateProfile(userId: string, formData: FormData) {
    const name = formData.get("name") as string;
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    try {
        const user = await db.user.findUnique({
             where: { id: userId } 
        });

        if (!user) return { error: "User not found" };

        const data: any = {};

        if (name && name !== user.name) {
            data.name = name;
        }

        // Password reset logic
        if (newPassword) {
            if (!currentPassword) {
                return { error: "Current password is required to set a new password" };
            }

            const match = await bcrypt.compare(currentPassword, user.password);
            if (!match) {
                return { error: "Current password is incorrect" };
            }

            if (newPassword.length < 6) {
                return { error: "New password must be at least 6 characters" };
            }

            if (newPassword !== confirmPassword) {
                return { error: "New passwords do not match" };
            }

            data.password = await bcrypt.hash(newPassword, 10);
        }

        if (Object.keys(data).length > 0) {
            await db.user.update({
                where: { id: userId },
                data
            });
            revalidatePath("/dashboard");
            return { success: true };
        }

        return { success: true, message: "No changes made" };

    } catch (error) {
        console.error("Profile update error:", error);
        return { error: "Failed to update profile" };
    }
}
