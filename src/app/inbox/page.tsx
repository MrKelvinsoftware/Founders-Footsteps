"use client";

import { useState, useEffect } from "react";
import { 
  Inbox, 
  Bell, 
  Package, 
  Calendar, 
  Tag, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  ChevronRight,
  RefreshCw,
  Megaphone,
  Truck,
  CreditCard,
  Sparkles
} from "lucide-react";
import Link from "next/link";

interface InboxMessage {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  trackingNumber?: string | null;
  relatedType?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  isBroadcast: boolean;
}

const typeIcons: Record<string, typeof Inbox> = {
  order_update: Package,
  booking_update: Calendar,
  delivery_update: Truck,
  payment_update: CreditCard,
  promotion: Tag,
  announcement: Megaphone,
  system: AlertCircle,
  welcome: Sparkles,
};

const typeColors: Record<string, string> = {
  order_update: "bg-blue-100 text-blue-600",
  booking_update: "bg-purple-100 text-purple-600",
  delivery_update: "bg-green-100 text-green-600",
  payment_update: "bg-amber-100 text-amber-600",
  promotion: "bg-pink-100 text-pink-600",
  announcement: "bg-indigo-100 text-indigo-600",
  system: "bg-slate-100 text-slate-600",
  welcome: "bg-emerald-100 text-emerald-600",
};

const priorityStyles: Record<string, string> = {
  urgent: "border-l-4 border-l-red-500 bg-red-50",
  high: "border-l-4 border-l-amber-500 bg-amber-50",
  normal: "border-l-4 border-l-blue-500",
  low: "border-l-4 border-l-slate-300",
};

export default function InboxPage() {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inbox");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch inbox:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const markAsRead = async (messageId: string, isBroadcast: boolean) => {
    try {
      await fetch("/api/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, isBroadcast }),
      });
      
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, isRead: true, readAt: new Date().toISOString() } : m
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const filteredMessages = filter === "unread" 
    ? messages.filter((m) => !m.isRead) 
    : messages;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Inbox className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Inbox</h1>
              <p className="text-slate-500">
                {unreadCount > 0 
                  ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}`
                  : "All caught up!"}
              </p>
            </div>
          </div>
          <button
            onClick={fetchInbox}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            All Messages
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
              filter === "unread"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                filter === "unread" ? "bg-white/20" : "bg-blue-100 text-blue-600"
              }`}>
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Messages List */}
        <div className="space-y-3">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-slate-200 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-full mb-1" />
                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredMessages.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {filter === "unread" ? "No unread messages" : "Your inbox is empty"}
              </h3>
              <p className="text-slate-500">
                {filter === "unread"
                  ? "You've read all your messages!"
                  : "Messages about your orders, bookings, and updates will appear here."}
              </p>
            </div>
          ) : (
            filteredMessages.map((message) => {
              const IconComponent = typeIcons[message.type] || Bell;
              const colorClass = typeColors[message.type] || typeColors.system;
              const priorityClass = priorityStyles[message.priority] || priorityStyles.normal;

              return (
                <div
                  key={message.id}
                  onClick={() => !message.isRead && markAsRead(message.id, message.isBroadcast)}
                  className={`bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer ${priorityClass} ${
                    !message.isRead ? "ring-2 ring-blue-100" : ""
                  }`}
                >
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`font-semibold ${!message.isRead ? "text-slate-900" : "text-slate-700"}`}>
                          {message.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!message.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                          <span className="text-xs text-slate-400">
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className={`text-sm ${!message.isRead ? "text-slate-600" : "text-slate-500"} line-clamp-2`}>
                        {message.message}
                      </p>
                      {message.trackingNumber && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-slate-100 rounded-md font-mono text-slate-600">
                            {message.trackingNumber}
                          </span>
                          {message.relatedType === "order" && (
                            <Link
                              href={`/orders/${message.trackingNumber}`}
                              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Order <ChevronRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      )}
                      {message.isBroadcast && (
                        <div className="mt-2">
                          <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">
                            📢 Announcement
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
