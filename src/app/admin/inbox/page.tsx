"use client";

import { useState, useEffect } from "react";
import { 
  Send, 
  Users, 
  User,
  Megaphone,
  Package,
  Calendar,
  Tag,
  AlertCircle,
  Clock,
  CheckCircle,
  Search
} from "lucide-react";

interface Broadcast {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  targetRole: string | null;
  serviceLine: string | null;
  isActive: boolean;
  createdAt: string;
}

const notificationTypes = [
  { value: "announcement", label: "Announcement", icon: Megaphone },
  { value: "promotion", label: "Promotion", icon: Tag },
  { value: "system", label: "System Update", icon: AlertCircle },
  { value: "order_update", label: "Order Update", icon: Package },
  { value: "booking_update", label: "Booking Update", icon: Calendar },
];

const serviceLines = [
  { value: "", label: "All Services" },
  { value: "construction", label: "Construction" },
  { value: "car-rental", label: "Car Services" },
  { value: "catering-events", label: "Catering & Events" },
  { value: "logistics", label: "Logistics" },
  { value: "tech-repairs", label: "Tech Repairs" },
  { value: "travel-trips", label: "Travel & Trips" },
  { value: "salon-beauty", label: "Salon & Beauty" },
  { value: "marketplace", label: "Marketplace" },
];

export default function AdminInboxPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"compose" | "history">("compose");
  
  // Form state
  const [messageType, setMessageType] = useState<"broadcast" | "direct">("broadcast");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [notificationType, setNotificationType] = useState("announcement");
  const [priority, setPriority] = useState("normal");
  const [targetRole, setTargetRole] = useState("");
  const [serviceLine, setServiceLine] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    try {
      const res = await fetch("/api/admin/inbox");
      if (res.ok) {
        const data = await res.json();
        setBroadcasts(data.broadcasts || []);
      }
    } catch (err) {
      console.error("Failed to fetch broadcasts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: messageType,
          title,
          message,
          notificationType,
          priority,
          targetRole: targetRole || null,
          serviceLine: serviceLine || null,
          targetUserId: messageType === "direct" ? targetUserId : null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(
          messageType === "broadcast"
            ? "Broadcast sent to all users!"
            : "Message sent successfully!"
        );
        setTitle("");
        setMessage("");
        fetchBroadcasts();
      } else {
        setError(data.error || "Failed to send message");
      }
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Inbox Management</h1>
        <p className="text-slate-600">Send notifications and announcements to users</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("compose")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "compose"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Send className="w-4 h-4 inline-block mr-2" />
          Compose Message
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "history"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Clock className="w-4 h-4 inline-block mr-2" />
          Broadcast History
        </button>
      </div>

      {activeTab === "compose" ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {/* Message Type Toggle */}
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setMessageType("broadcast")}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                messageType === "broadcast"
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <Users className={`w-6 h-6 mx-auto mb-2 ${messageType === "broadcast" ? "text-blue-600" : "text-slate-400"}`} />
              <h3 className={`font-semibold ${messageType === "broadcast" ? "text-blue-900" : "text-slate-700"}`}>
                Broadcast to All
              </h3>
              <p className="text-sm text-slate-500">Send to all users or filter by role/service</p>
            </button>
            <button
              type="button"
              onClick={() => setMessageType("direct")}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                messageType === "direct"
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <User className={`w-6 h-6 mx-auto mb-2 ${messageType === "direct" ? "text-blue-600" : "text-slate-400"}`} />
              <h3 className={`font-semibold ${messageType === "direct" ? "text-blue-900" : "text-slate-700"}`}>
                Direct Message
              </h3>
              <p className="text-sm text-slate-500">Send to a specific user</p>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Direct message recipient */}
            {messageType === "direct" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Recipient User ID
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    placeholder="Enter user ID or search..."
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={messageType === "direct"}
                  />
                </div>
              </div>
            )}

            {/* Broadcast filters */}
            {messageType === "broadcast" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Target Audience
                  </label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Users</option>
                    <option value="customer">Customers Only</option>
                    <option value="staff">Staff Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Service Line Filter
                  </label>
                  <select
                    value={serviceLine}
                    onChange={(e) => setServiceLine(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {serviceLines.map((sl) => (
                      <option key={sl.value} value={sl.value}>{sl.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Notification type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notification Type
              </label>
              <div className="grid grid-cols-5 gap-2">
                {notificationTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setNotificationType(type.value)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      notificationType === type.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <type.icon className={`w-5 h-5 mx-auto mb-1 ${
                      notificationType === type.value ? "text-blue-600" : "text-slate-400"
                    }`} />
                    <span className={`text-xs font-medium ${
                      notificationType === type.value ? "text-blue-900" : "text-slate-600"
                    }`}>
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Priority
              </label>
              <div className="flex gap-2">
                {["low", "normal", "high", "urgent"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-4 py-2 rounded-lg capitalize text-sm font-medium transition-all ${
                      priority === p
                        ? p === "urgent"
                          ? "bg-red-500 text-white"
                          : p === "high"
                          ? "bg-amber-500 text-white"
                          : p === "normal"
                          ? "bg-blue-500 text-white"
                          : "bg-slate-500 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter notification title..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here..."
                rows={5}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Status messages */}
            {success && (
              <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-xl">
                <CheckCircle className="w-5 h-5" />
                {success}
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={sending}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {messageType === "broadcast" ? "Send Broadcast" : "Send Message"}
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* History Tab */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Recent Broadcasts</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : broadcasts.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No broadcasts sent yet</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {broadcasts.map((broadcast) => (
                <div key={broadcast.id} className="p-4 hover:bg-slate-50">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-900">{broadcast.title}</h3>
                    <span className="text-xs text-slate-400">
                      {new Date(broadcast.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2 line-clamp-2">{broadcast.message}</p>
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-600 capitalize">
                      {broadcast.type}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                      broadcast.priority === "urgent" ? "bg-red-100 text-red-700" :
                      broadcast.priority === "high" ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {broadcast.priority}
                    </span>
                    {broadcast.targetRole && (
                      <span className="text-xs px-2 py-1 bg-blue-100 rounded-full text-blue-700">
                        {broadcast.targetRole}s
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
