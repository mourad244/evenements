export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
};

export type NotificationsQuery = {
  page?: number;
  pageSize?: number;
};

export type NotificationsPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type NotificationsResult = {
  items: NotificationItem[];
  pagination: NotificationsPagination;
};
