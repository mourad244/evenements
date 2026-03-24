export type NotificationItem = {
  id: string;
  notificationId: string;
  title: string;
  message: string | null;
  type: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
};

export type NotificationListResult = {
  items: NotificationItem[];
  page: number;
  pageSize: number;
  total: number;
};

export type NotificationsQuery = {
  page?: number;
  pageSize?: number;
};
