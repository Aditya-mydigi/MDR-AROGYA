"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import {
  Plus,
  Search,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Eye,
  EyeOff,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type UserRow = {
  id: string;
  mdr_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone_num?: string | null;
  gender?: string | null;
  dob?: string | null;
  created_at?: string | null;
  user_plan_active?: boolean | null;
  blood_group?: string | null;
  address?: string | null;
  plan_id?: string | null;
  payment_date?: string | null;
  expiry_date?: string | null;
  country?: string | null;
  daily_sv?: number | null;
  monthly_ocr?: number | null;
  credit?: number | null;
  region: "India" | "USA";
};

export default function UsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [users, setUsers] = useState<UserRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [limit] = useState(20);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<
    "All" | "Active" | "Inactive" | "Expired"
  >("All");
  const [region, setRegion] = useState<"total" | "india" | "usa">("total");
  const [bloodGroup, setBloodGroup] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isScansDialogOpen, setIsScansDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  const [newUserSubmitting, setNewUserSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [newUserForm, setNewUserForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone_num: "",
    password: "",
    dob: "",
    gender: "",
    blood_group: "",
    city: "",
    state: "",
    country: "INDIA",
    zip_code: "",
    emergency_contact: "",
    emergency_contact_name: "",
  });

  const [scansLoading, setScansLoading] = useState(false);
  const [scansSubmitting, setScansSubmitting] = useState(false);
  const [dailySv, setDailySv] = useState<number | "">("");
  const [monthlyOcr, setMonthlyOcr] = useState<number | "">("");
  const [actionLoadingUserId, setActionLoadingUserId] = useState<string | null>(
    null,
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const savedCollapsed = localStorage.getItem("sidebarCollapsed");
    if (savedCollapsed !== null) {
      setSidebarCollapsed(savedCollapsed === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  useEffect(() => {
    // Initial fetches
    void fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async (targetPage?: number) => {
    try {
      setLoading(true);
      setError(null);

      const pageToLoad = targetPage ?? page;
      const params = new URLSearchParams();
      params.set("page", String(pageToLoad));
      params.set("limit", String(limit));
      if (search.trim()) params.set("search", search.trim());
      if (status !== "All") params.set("status", status);
      if (region !== "total") params.set("region", region);
      if (bloodGroup) params.set("blood_groups", bloodGroup);

      const res = await fetch(`/api/users?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch users");
      }

      setUsers(data.users || []);
      setTotalUsers(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setPage(data.currentPage || pageToLoad);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong while loading users.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    void fetchUsers(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    void fetchUsers(newPage);
  };

  const handleOpenAddUser = () => {
    setNewUserForm({
      first_name: "",
      middle_name: "",
      last_name: "",
      email: "",
      phone_num: "",
      password: "",
      dob: "",
      gender: "",
      blood_group: "",
      city: "",
      state: "",
      country: "INDIA",
      zip_code: "",
      emergency_contact: "",
      emergency_contact_name: "",
    });

    setIsAddUserOpen(true);
  };

  const handleCreateUser = async () => {
    const errors: string[] = [];

    // Required fields
    if (!newUserForm.first_name) errors.push("First name is required");
    if (!newUserForm.last_name) errors.push("Last name is required");
    if (!newUserForm.email) errors.push("Email is required");
    if (!newUserForm.phone_num) errors.push("Phone number is required");
    if (!newUserForm.password) errors.push("Password is required");
    if (!newUserForm.dob) errors.push("Date of birth is required");
    if (!newUserForm.gender) errors.push("Gender is required");

    // Email validation
    if (
      newUserForm.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUserForm.email)
    ) {
      errors.push("Invalid email format");
    }

    // Phone validation
    if (
      newUserForm.phone_num &&
      !/^[0-9]{10,15}$/.test(newUserForm.phone_num)
    ) {
      errors.push("Phone number must be 10–15 digits");
    }

    // Password validation
    if (newUserForm.password) {
      if (newUserForm.password.length < 8) {
        errors.push("Password must be at least 8 characters");
      }

      if (!/[A-Z]/.test(newUserForm.password)) {
        errors.push("Password must contain at least one uppercase letter");
      }

      if (!/[0-9]/.test(newUserForm.password)) {
        errors.push("Password must contain at least one number");
      }
    }

    // DOB validation
    if (newUserForm.dob) {
      const dobDate = new Date(newUserForm.dob);
      const today = new Date();

      if (dobDate >= today) {
        errors.push("Date of birth must be in the past");
      }
    }

    // Gender validation
    if (
      newUserForm.gender &&
      !["male", "female", "other"].includes(newUserForm.gender)
    ) {
      errors.push("Invalid gender selected");
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setNewUserSubmitting(true);
      setFormErrors([]);

      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUserForm),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (Array.isArray(data.errors)) {
          setFormErrors(data.errors);
        } else {
          setFormErrors([
            data.error || "Something went wrong while creating the user.",
          ]);
        }
        return;
      }

      setIsAddUserOpen(false);
      await fetchUsers(1);
    } catch (err) {
      setFormErrors(["Network error. Please try again."]);
    } finally {
      setNewUserSubmitting(false);
    }
  };

  const openScansDialog = async (user: UserRow) => {
    setSelectedUser(user);
    setIsScansDialogOpen(true);

    if (user.region !== "India") {
      setDailySv("");
      setMonthlyOcr("");
      return;
    }

    try {
      setScansLoading(true);
      const res = await fetch(
        `/api/users/scans?id=${encodeURIComponent(user.id)}`,
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch scan limits");
      }

      setDailySv(data.daily_sv ?? 0);
      setMonthlyOcr(data.monthly_ocr ?? 0);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || "Something went wrong while loading scan limits.",
      );
      setDailySv("");
      setMonthlyOcr("");
    } finally {
      setScansLoading(false);
    }
  };

  const handleUpdateScans = async () => {
    if (!selectedUser) return;

    if (selectedUser.region !== "India") {
      setIsScansDialogOpen(false);
      return;
    }

    try {
      setScansSubmitting(true);
      setError(null);

      const res = await fetch("/api/users/scans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedUser.id,
          daily_sv: dailySv === "" ? null : Number(dailySv),
          monthly_ocr: monthlyOcr === "" ? null : Number(monthlyOcr),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update scan limits");
      }

      setIsScansDialogOpen(false);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || "Something went wrong while updating scan limits.",
      );
    } finally {
      setScansSubmitting(false);
    }
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    try {
      const date = new Date(value);
      return date.toLocaleDateString();
    } catch {
      return "-";
    }
  };

  const fullName = (user: UserRow) => {
    const parts = [user.first_name, user.last_name].filter(Boolean);
    return parts.length ? parts.join(" ") : "-";
  };

  const handleDeleteUser = async (user: UserRow) => {
    if (!user.id || !user.region) return;
    try {
      setActionLoadingUserId(user.id);
      setError(null);

      const res = await fetch(`/api/users/${encodeURIComponent(user.id)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region: user.region.toLowerCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to delete user");
      }

      await fetchUsers(page);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong while deleting user.");
    } finally {
      setActionLoadingUserId(null);
    }
  };

  return (
    <div
      className={clsx(
        "min-h-screen bg-white flex",
        sidebarOpen && "overflow-hidden",
      )}
    >
      <Sidebar
        sidebarOpen={sidebarOpen}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 bg-white">
        <Header
          title="Users"
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarCollapsed={sidebarCollapsed}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#f8fafc]">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-[#0a3a7a]">
                  MDR Users
                </h2>
                <p className="text-sm text-gray-500">
                  Manage MDR users across India and USA, add new users, and
                  manage smart vitals.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void fetchUsers(1)}
                >
                  Refresh
                </Button>
                <Button
                  size="sm"
                  className="bg-[#0a3a7a] hover:bg-[#0b4794] text-white"
                  onClick={handleOpenAddUser}
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add New User
                </Button>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="flex flex-1 flex-col gap-3 md:flex-row">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, email, phone, MDR ID, blood group..."
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/60 py-2.5 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#0a3a7a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a3a7a]/10"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <select
                      className="w-32 rounded-lg border border-gray-200 bg-gray-50/60 py-2 px-2 text-xs md:text-sm text-gray-700 focus:border-[#0a3a7a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a3a7a]/10"
                      value={status}
                      onChange={(e) =>
                        setStatus(e.target.value as typeof status)
                      }
                    >
                      <option value="All">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Expired">Expired</option>
                    </select>

                    <select
                      className="w-28 rounded-lg border border-gray-200 bg-gray-50/60 py-2 px-2 text-xs md:text-sm text-gray-700 focus:border-[#0a3a7a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a3a7a]/10"
                      value={region}
                      onChange={(e) =>
                        setRegion(e.target.value as typeof region)
                      }
                    >
                      <option value="total">All Regions</option>
                      <option value="india">India</option>
                      <option value="usa">USA</option>
                    </select>

                    <select
                      className="w-28 rounded-lg border border-gray-200 bg-gray-50/60 py-2 px-2 text-xs md:text-sm text-gray-700 focus:border-[#0a3a7a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a3a7a]/10"
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                    >
                      <option value="">Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearch("");
                      setStatus("All");
                      setRegion("total");
                      setBloodGroup("");
                      void fetchUsers(1);
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[#0a3a7a] hover:bg-[#0b4794] text-white"
                    onClick={handleApplyFilters}
                  >
                    Apply
                  </Button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs md:text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        MDR ID
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Username
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Email / Phone
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Avaialble SV Credits
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white text-sm">
                    {loading ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-4 py-10 text-center text-gray-500"
                        >
                          Loading users...
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-4 py-10 text-center text-gray-500"
                        >
                          No users found for the selected filters.
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-gray-50/80 transition-colors"
                        >
                          <td className="px-4 py-3 text-xs font-mono text-gray-700">
                            {user.mdr_id || "-"}
                          </td>
                          <td className="px-4 py-3 text-gray-900 font-medium">
                            {fullName(user)}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">
                            <div className="flex flex-col">
                              {user.email && (
                                <span className="truncate">{user.email}</span>
                              )}
                              {user.phone_num && (
                                <span className="truncate text-gray-500">
                                  {user.phone_num}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-700">
                            {user.region === "India"
                              ? typeof user.daily_sv === "number"
                                ? user.daily_sv
                                : "0"
                              : "-"}
                          </td>
                          <td className="px-4 py-3">
                            {user.user_plan_active ? (
                              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 ring-1 ring-gray-200">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a3a7a]/40"
                                aria-label="User actions"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="min-w-[190px] text-[13px]"
                              >
                                <DropdownMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() => void openScansDialog(user)}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                  <span>Add Smart Vitals</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-xs md:text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-gray-700">
                    {users.length ? (page - 1) * limit + 1 : 0}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-gray-700">
                    {(page - 1) * limit + users.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-700">
                    {totalUsers}
                  </span>{" "}
                  users
                </p>

                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1 || loading}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Prev
                  </Button>
                  <span className="text-xs md:text-sm text-gray-600">
                    Page{" "}
                    <span className="font-semibold text-gray-800">{page}</span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-800">
                      {totalPages}
                    </span>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages || loading}
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Dialog
        open={isAddUserOpen}
        onOpenChange={(open) => {
          setIsAddUserOpen(open);
          if (!open) setFormErrors([]);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add new user</DialogTitle>
            <DialogDescription>
              Create a new MDR Army user. Basic personal and contact information
              is required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name fields */}
            {formErrors.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <p className="font-semibold mb-1">Please fix the following:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {formErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  First name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                  value={newUserForm.first_name}
                  onChange={(e) =>
                    setNewUserForm((prev) => ({
                      ...prev,
                      first_name: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Middle name
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                  value={newUserForm.middle_name}
                  onChange={(e) =>
                    setNewUserForm((prev) => ({
                      ...prev,
                      middle_name: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Last name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                  value={newUserForm.last_name}
                  onChange={(e) =>
                    setNewUserForm((prev) => ({
                      ...prev,
                      last_name: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                value={newUserForm.email}
                onChange={(e) =>
                  setNewUserForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 pr-10 text-sm"
                  value={newUserForm.password}
                  onChange={(e) =>
                    setNewUserForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Password must contain: • 8+ characters • 1 uppercase letter • 1
                number
              </p>
            </div>

            {/* Phone + DOB */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Phone number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                  value={newUserForm.phone_num}
                  onChange={(e) =>
                    setNewUserForm((prev) => ({
                      ...prev,
                      phone_num: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Date of birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                  value={newUserForm.dob}
                  onChange={(e) =>
                    setNewUserForm((prev) => ({
                      ...prev,
                      dob: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Gender + Blood Group */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                  value={newUserForm.gender}
                  onChange={(e) =>
                    setNewUserForm((prev) => ({
                      ...prev,
                      gender: e.target.value,
                    }))
                  }
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Blood group
                </label>
                <select
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                  value={newUserForm.blood_group}
                  onChange={(e) =>
                    setNewUserForm((prev) => ({
                      ...prev,
                      blood_group: e.target.value,
                    }))
                  }
                >
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                  value={newUserForm.city}
                  onChange={(e) =>
                    setNewUserForm((prev) => ({
                      ...prev,
                      city: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  State
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                  value={newUserForm.state}
                  onChange={(e) =>
                    setNewUserForm((prev) => ({
                      ...prev,
                      state: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Zip code
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                  value={newUserForm.zip_code}
                  onChange={(e) =>
                    setNewUserForm((prev) => ({
                      ...prev,
                      zip_code: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Emergency contact
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                  value={newUserForm.emergency_contact}
                  onChange={(e) =>
                    setNewUserForm((prev) => ({
                      ...prev,
                      emergency_contact: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Emergency contact name
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                  value={newUserForm.emergency_contact_name}
                  onChange={(e) =>
                    setNewUserForm((prev) => ({
                      ...prev,
                      emergency_contact_name: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddUserOpen(false);
                setFormErrors([]);
              }}
              disabled={newUserSubmitting}
            >
              Cancel
            </Button>

            <Button
              size="sm"
              className="bg-[#0a3a7a] hover:bg-[#0b4794] text-white"
              onClick={() => void handleCreateUser()}
              disabled={newUserSubmitting}
            >
              {newUserSubmitting ? "Creating..." : "Create user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isScansDialogOpen} onOpenChange={setIsScansDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Smart Vitals</DialogTitle>
            <DialogDescription>
              {selectedUser?.region === "India"
                ? "Update daily and monthly OCR scan limits for this user."
                : "Scan limits are only configurable for India users."}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-3 py-2 text-sm">
              <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-700">
                <div className="font-semibold text-gray-900">
                  {fullName(selectedUser)}
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedUser.email && (
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-gray-600 border border-gray-200">
                      {selectedUser.email}
                    </span>
                  )}
                  {selectedUser.mdr_id && (
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-gray-600 border border-gray-200">
                      MDR: {selectedUser.mdr_id}
                    </span>
                  )}
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-gray-600 border border-gray-200">
                    Region: {selectedUser.region}
                  </span>
                </div>
              </div>

              {selectedUser.region === "India" ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">
                      Daily scans
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50/70 px-3 py-2 text-sm text-gray-800 focus:border-[#0a3a7a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a3a7a]/10"
                      value={dailySv}
                      onChange={(e) =>
                        setDailySv(
                          e.target.value === ""
                            ? ""
                            : Math.max(0, Number(e.target.value) || 0),
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">
                      Monthly OCR scans
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50/70 px-3 py-2 text-sm text-gray-800 focus:border-[#0a3a7a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a3a7a]/10"
                      value={monthlyOcr}
                      onChange={(e) =>
                        setMonthlyOcr(
                          e.target.value === ""
                            ? ""
                            : Math.max(0, Number(e.target.value) || 0),
                        )
                      }
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-600">
                  This user is not in India. Scan limits customization currently
                  applies only to India users.
                </p>
              )}

              {scansLoading && (
                <p className="text-xs text-gray-500">
                  Loading current scan limits...
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsScansDialogOpen(false)}
              disabled={scansSubmitting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-[#0a3a7a] hover:bg-[#0b4794] text-white"
              onClick={() => void handleUpdateScans()}
              disabled={
                scansSubmitting ||
                !selectedUser ||
                selectedUser.region !== "India"
              }
            >
              {scansSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User details</DialogTitle>
            <DialogDescription>
              Overview of the selected MDR user.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">MDR ID</span>
                <span className="font-medium text-gray-900 text-xs">
                  {selectedUser.mdr_id || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">Username</span>
                <span className="font-medium text-gray-900 text-xs">
                  {fullName(selectedUser)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">Email</span>
                <span className="font-medium text-gray-900 text-xs">
                  {selectedUser.email || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">Phone</span>
                <span className="font-medium text-gray-900 text-xs">
                  {selectedUser.phone_num || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">Plan</span>
                <span className="font-medium text-gray-900 text-xs">
                  {selectedUser.plan_id || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">SV Left</span>
                <span className="font-medium text-gray-900 text-xs">
                  {selectedUser.region === "India"
                    ? typeof selectedUser.daily_sv === "number"
                      ? selectedUser.daily_sv
                      : "0"
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">Status</span>
                <span className="font-medium text-gray-900 text-xs">
                  {selectedUser.user_plan_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDetailsOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
