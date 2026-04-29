"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  HandCoins,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  User,
  Video,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  // ✅ Load user ONLY on client
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("adminUser") || "null");
    setAdminData(user);
    setLoading(false);
  }, []);

  // ✅ Auth Guard (after loading)
  useEffect(() => {
    if (!loading) {
      const token = localStorage.getItem("adminToken");

      if (!token || adminData?.role !== "admin") {
        if (pathname !== "/admin/login") {
          router.push("/admin/login");
        }
      }
    }
  }, [loading, adminData, pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    toast.success("Logged out successfully");
    router.push("/admin/login");
  };

  // ✅ Don't wrap login page
  if (pathname === "/admin/login") return children;

  // ✅ Prevent hydration mismatch
  if (loading) return null;

  if (!adminData || adminData.role !== "admin") return null;

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { name: "Orders", icon: ShoppingBag, href: "/admin/orders" },
    { name: "Products", icon: Package, href: "/admin/products" },
    { name: "Reviews", icon: Star, href: "/admin/reviews" },
    { name: "Approvals", icon: Video, href: "/admin/approvals" },
    { name: "Admin Refund Panel", icon: HandCoins, href: "/admin/refund" },
  ];

  const currentPage = pathname?.split("/").pop() || "";

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0c] text-white transition-transform duration-300 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0 overflow-y-auto`}
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center font-bold text-white">
              R
            </div>
            <span className="text-xl font-bold tracking-tight">
              Ruva <span className="text-primary-500">Admin</span>
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-primary-600/10 text-primary-500"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all font-medium"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-600"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-2 text-sm text-gray-500 ml-4">
            <span>Admin</span>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium capitalize">
              {currentPage}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-gray-500 hover:text-primary-600 transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900">
                  {adminData?.name || "Admin User"}
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                  Super Admin
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 border flex items-center justify-center text-primary-600">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}