import { db } from "@/lib/db";

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  link?: string,
) {
  try {
    await db.notification.create({
      data: {
        userId,
        title,
        message,
        link,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

export async function createBulkNotifications(
  userIds: string[],
  title: string,
  message: string,
  link?: string,
) {
  try {
    // Prisma createMany is efficient for bulk
    await db.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        title,
        message,
        link,
      })),
    });
  } catch (error) {
    console.error("Failed to create bulk notifications:", error);
  }
}
