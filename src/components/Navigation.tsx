"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, ShoppingCart, ChevronDown, LogOut, LayoutDashboard, Home, Car, Utensils, Plane, Scissors, Truck, Wrench, ShoppingBag, Inbox } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

const serviceLinks = [
  { name: "Construction", slug: "/services/construction", icon: Home, color: "#64748b" },
  { name: "Car Services", slug: "/services/car-rental", icon: Car, color: "#2563eb" },
  { name: "Catering & Events", slug: "/services/catering-events", icon: Utensils, color: "#d97706" },
  { name: "Travel & Trips", slug: "/services/travel-trips", icon: Plane, color: "#0891b2" },
  { name: "Salon & Beauty", slug: "/services/salon-beauty", icon: Scissors, color: "#c026d3" },
  { name: "Logistics", slug: "/services/logistics", icon: Truck, color: "#059669" },
  { name: "Tech Repairs", slug: "/services/tech-repairs", icon: Wrench, color: "#7c3aed" },
  { name: "Marketplace", slug: "/marketplace", icon: ShoppingBag, color: "#ef4444" },
];

export default function Navigation() {
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadInbox, setUnreadInbox] = useState(0);
  const servicesRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  
  // Fetch unread inbox count
  useEffect(() => {
    if (user) {
      fetch("/api/inbox?count=true")
        .then((res) => res.json())
        .then((data) => setUnreadInbox(data.unreadCount || 0))
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) setServicesOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const closeMobile = () => setMobileOpen(false);
  const handleLogout = () => { logout(); setUserMenuOpen(false); closeMobile(); router.push("/"); };
  const navLinkClass = `px-4 py-2 rounded-lg font-medium transition-colors ${isScrolled ? "text-slate-700 hover:bg-slate-100" : "text-white/90 hover:bg-white/10"}`;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/95 backdrop-blur-lg shadow-lg" : "bg-transparent"}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg">F</div>
              <div className="hidden sm:block">
                <h1 className={`text-lg font-bold leading-tight ${isScrolled ? "text-slate-900" : "text-white"}`}>Founders & Footsteps</h1>
                <p className={`text-[10px] uppercase tracking-widest ${isScrolled ? "text-slate-500" : "text-white/70"}`}>Apex Lifestyle Syndicate</p>
              </div>
            </Link>
            <div className="hidden lg:flex items-center gap-1">
              <Link href="/" className={navLinkClass}>Home</Link>
              <div className="relative" ref={servicesRef}>
                <button onClick={() => setServicesOpen(!servicesOpen)} className={`${navLinkClass} flex items-center gap-1`}>Services <ChevronDown className="w-4 h-4" /></button>
                {servicesOpen && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl p-4 animate-slide-up">
                    <div className="grid grid-cols-2 gap-2">
                      {serviceLinks.map((s) => (
                        <Link key={s.slug} href={s.slug} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors" onClick={() => setServicesOpen(false)}>
                          <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15`, color: s.color }}><s.icon className="w-4 h-4" /></span>
                          <span className="text-sm font-medium text-slate-700">{s.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Link href="/marketplace" className={navLinkClass}>Marketplace</Link>
              <Link href="/about" className={navLinkClass}>About</Link>
              <Link href="/contact" className={navLinkClass}>Contact</Link>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <Link href="/inbox" className={`relative p-2 rounded-lg transition-colors ${isScrolled ? "text-slate-700 hover:bg-slate-100" : "text-white/90 hover:bg-white/10"}`}>
                  <Inbox className="w-5 h-5" />
                  {unreadInbox > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadInbox > 9 ? "9+" : unreadInbox}
                    </span>
                  )}
                </Link>
              )}
              <Link href="/favorites" className={`relative p-2 rounded-lg transition-colors ${isScrolled ? "text-slate-700 hover:bg-slate-100" : "text-white/90 hover:bg-white/10"}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </Link>
              <Link href="/cart" className={`relative p-2 rounded-lg transition-colors ${isScrolled ? "text-slate-700 hover:bg-slate-100" : "text-white/90 hover:bg-white/10"}`}>
                <ShoppingCart className="w-5 h-5" />
              </Link>
              {user ? (
                <div className="relative" ref={userRef}>
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${isScrolled ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-white/10 text-white hover:bg-white/20"}`}>
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">{user.firstName?.charAt(0)}</div>
                    <span className="hidden xl:inline text-sm font-medium">{user.firstName}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 animate-slide-up">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="font-semibold text-slate-900 text-sm">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                      {isAdmin && <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50" onClick={() => setUserMenuOpen(false)}><LayoutDashboard className="w-4 h-4" /> Admin Portal</Link>}
                      <Link href="/inbox" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setUserMenuOpen(false)}>
                        <Inbox className="w-4 h-4" /> 
                        Inbox
                        {unreadInbox > 0 && <span className="ml-auto px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">{unreadInbox}</span>}
                      </Link>
                      <Link href="/favorites" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setUserMenuOpen(false)}>❤️ Favorites</Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"><LogOut className="w-4 h-4" /> Sign Out</button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth/signin" className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${isScrolled ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-white text-slate-900 hover:bg-slate-100"}`}>Sign In</Link>
              )}
              <button onClick={() => setMobileOpen(!mobileOpen)} className={`lg:hidden p-2 rounded-lg transition-colors ${isScrolled ? "text-slate-700 hover:bg-slate-100" : "text-white/90 hover:bg-white/10"}`} aria-label="Menu">
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={closeMobile} />
          <div className="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl overflow-y-auto animate-slide-up">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-900">F&F</span>
              <button onClick={closeMobile} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-600" /></button>
            </div>
            <nav className="p-4 space-y-1">
              <Link href="/" className="block px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-50 font-medium" onClick={closeMobile}>🏠 Home</Link>
              <p className="px-4 pt-4 pb-2 text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Services</p>
              {serviceLinks.map((s) => (
                <Link key={s.slug} href={s.slug} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-50" onClick={closeMobile}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                  <span className="font-medium">{s.name}</span>
                </Link>
              ))}
              <div className="border-t border-slate-100 my-3" />
              <Link href="/about" className="block px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-50 font-medium" onClick={closeMobile}>About Us</Link>
              <Link href="/contact" className="block px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-50 font-medium" onClick={closeMobile}>Contact</Link>
              <Link href="/favorites" className="block px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-50 font-medium" onClick={closeMobile}>❤️ Favorites</Link>
              <Link href="/cart" className="block px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-50 font-medium" onClick={closeMobile}>🛒 Cart</Link>
              <div className="border-t border-slate-100 my-3" />
              {user ? (
                <>
                  <div className="px-4 py-3"><p className="font-semibold text-slate-900">{user.firstName} {user.lastName}</p><p className="text-xs text-slate-500">{user.email}</p></div>
                  {isAdmin && <Link href="/admin" className="block px-4 py-3 rounded-xl text-blue-600 hover:bg-blue-50 font-medium" onClick={closeMobile}>⚙️ Admin Portal</Link>}
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium">Sign Out</button>
                </>
              ) : (
                <Link href="/auth/signin" className="block px-4 py-3 rounded-xl bg-blue-600 text-white text-center font-semibold" onClick={closeMobile}>Sign In / Register</Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
