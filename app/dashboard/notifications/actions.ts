"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  const session = await getServerSession(authOptions);
  if (!session) return [];

  try {
    const notifications = await db.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20, // Limit to recent 20
    });
    return notifications;
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
}

export async function markAsRead(notificationId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  try {
    await db.notification.update({
      where: {
        id: notificationId,
        userId: session.user.id, // Security check
      },
      data: {
        isRead: true,
      },
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Failed to mark as read" };
  }
}

export async function markAllAsRead() {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  try {
    await db.notification.updateMany({
      where: {
        userId: session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Failed to mark all as read" };
  }
}
