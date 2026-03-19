const API_BASE = "http://localhost:8000";

// ─── Auth helpers ───────────────────────────────────────────────
function getToken(): string | null {
  return localStorage.getItem("token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Types ──────────────────────────────────────────────────────
export type ComplaintStatus = "pending" | "verified" | "resolved";
export type Priority = "low" | "medium" | "high";

export interface Complaint {
  id: number;
  user_id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  image_url: string | null;
  status: ComplaintStatus;
  priority: Priority;
  created_at: string;
  updated_at: string;
}

export interface ComplaintListResponse {
  items: Complaint[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

// ─── Complaint API ──────────────────────────────────────────────

/**
 * Create a new complaint with optional image upload.
 * Uses multipart/form-data to support file upload.
 */
export async function createComplaint(data: {
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  priority?: Priority;
  image?: File | null;
}): Promise<Complaint> {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("latitude", String(data.latitude));
  formData.append("longitude", String(data.longitude));
  if (data.priority) formData.append("priority", data.priority);
  if (data.image) formData.append("image", data.image);

  const res = await fetch(`${API_BASE}/complaints`, {
    method: "POST",
    headers: {
      ...authHeaders(),
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create complaint");
  }

  return res.json();
}

/**
 * Get all complaints for the current authenticated user.
 */
export async function getMyComplaints(params?: {
  page?: number;
  page_size?: number;
  status?: ComplaintStatus;
  priority?: Priority;
}): Promise<ComplaintListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.page_size)
    searchParams.set("page_size", String(params.page_size));
  if (params?.status) searchParams.set("status", params.status);
  if (params?.priority) searchParams.set("priority", params.priority);

  const url = `${API_BASE}/complaints/user/me?${searchParams.toString()}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch complaints");
  }

  return res.json();
}

/**
 * Get all complaints for public view (no authentication required).
 */
export async function getPublicComplaints(params?: {
  page?: number;
  page_size?: number;
  status?: ComplaintStatus;
  priority?: Priority;
}): Promise<ComplaintListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.page_size)
    searchParams.set("page_size", String(params.page_size));
  if (params?.status) searchParams.set("status", params.status);
  if (params?.priority) searchParams.set("priority", params.priority);

  const url = `${API_BASE}/complaints/public?${searchParams.toString()}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch public complaints");
  }

  return res.json();
}

/**
 * Get a single complaint by ID.
 */
export async function getComplaint(id: number): Promise<Complaint> {
  const res = await fetch(`${API_BASE}/complaints/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch complaint");
  }

  return res.json();
}

/**
 * Upload / update image for a complaint.
 */
export async function uploadComplaintImage(
  complaintId: number,
  image: File
): Promise<Complaint> {
  const formData = new FormData();
  formData.append("image", image);

  const res = await fetch(`${API_BASE}/complaints/${complaintId}/image`, {
    method: "PATCH",
    headers: {
      ...authHeaders(),
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to upload image");
  }

  return res.json();
}

// ─── Admin-only endpoints ───────────────────────────────────────

/**
 * List all complaints (admin only).
 */
export async function listAllComplaints(params?: {
  page?: number;
  page_size?: number;
  status?: ComplaintStatus;
  priority?: Priority;
}): Promise<ComplaintListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.page_size)
    searchParams.set("page_size", String(params.page_size));
  if (params?.status) searchParams.set("status", params.status);
  if (params?.priority) searchParams.set("priority", params.priority);

  const url = `${API_BASE}/complaints?${searchParams.toString()}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch complaints");
  }

  return res.json();
}

/**
 * Update complaint status/priority (admin only).
 */
export async function updateComplaintStatus(
  complaintId: number,
  data: { status?: ComplaintStatus; priority?: Priority }
): Promise<Complaint> {
  const res = await fetch(`${API_BASE}/complaints/${complaintId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to update complaint");
  }

  return res.json();
}

/**
 * Mark a complaint as resolved (admin only).
 */
export async function resolveComplaint(
  complaintId: number
): Promise<Complaint> {
  const res = await fetch(`${API_BASE}/complaints/${complaintId}/resolve`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to resolve complaint");
  }

  return res.json();
}

/**
 * Delete a complaint (admin only).
 */
export async function deleteComplaint(complaintId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/complaints/${complaintId}`, {
    method: "DELETE",
    headers: {
      ...authHeaders(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to delete complaint");
  }
}

/**
 * Login and get access token.
 */
export async function login(
  email: string,
  password: string
): Promise<{ access_token: string; token_type: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Login failed");
  }

  return res.json();
}

/**
 * Get current user info.
 */
export async function getMe(): Promise<UserResponse> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch user");
  }

  return res.json();
}
