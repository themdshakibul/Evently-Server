export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar?: string;
  createdAt: Date;
}

export interface IEventType {
  _id: string;
  title: string;
  description: string;
  category: string;
  date: Date;
  location: string;
  images: string[];
  capacity: number;
  price: number;
  organizer: string;
  status: "draft" | "pending" | "published" | "cancelled";
  views: number;
  attendeesCount: number;
  createdAt: Date;
}

export interface IRegistrationType {
  _id: string;
  event: string;
  user: string;
  createdAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
