"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Plus, Edit, Trash2, Search, ArrowLeft, CheckCircle, Star, X } from "lucide-react";

interface Destination {
  id: string;
  name: string;
  slug: string;
  country: string;
  description: string;
  image: string;
  gallery?: string[];
  rating: string;
  reviewCount: number;
  startingPrice: string;
  isPopular: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export default function AdminDestinationsPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDest, setEditingDest] = useState<Destination | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    country: "",
    description: "",
    image: "",
    rating: "5.0",
    reviewCount: "0",
    startingPrice: "",
    isPopular: false,
    isFeatured: false,
  });

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push("/auth/signin");
    } else if (!isLoading) {
      fetchDestinations();
    }
  }, [user, isAdmin, isLoading, router]);

  const fetchDestinations = async () => {
    const mockDestinations: Destination[] = [
      { id: "1", name: "Paris", slug: "paris", country: "France", description: "The city of love and lights", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80", rating: "4.9", reviewCount: 2450, startingPrice: "3500", isPopular: true, isFeatured: true, createdAt: "2024-01-01" },
      { id: "2", name: "Bali", slug: "bali", country: "Indonesia", description: "Tropical paradise with stunning beaches", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80", rating: "4.8", reviewCount: 1890, startingPrice: "4200", isPopular: true, isFeatured: true, createdAt: "2024-01-02" },
      { id: "3", name: "Dubai", slug: "dubai", country: "UAE", description: "Luxury and innovation in the desert", image: "https://images.unsplash.com/photo-1512453979798-5ea904ac22ac?w=800&q=80", rating: "4.9", reviewCount: 2100, startingPrice: "4900", isPopular: true, isFeatured: false, createdAt: "2024-01-03" },
      { id: "4", name: "Santorini", slug: "santorini", country: "Greece", description: "Iconic white buildings and sunsets", image: "https://images.unsplash.com/photo-1613395877344-13d4c79e4df1?w=800&q=80", rating: "4.8", reviewCount: 1420, startingPrice: "6300", isPopular: true, isFeatured: true, createdAt: "2024-01-04" },
    ];
    setDestinations(mockDestinations);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingDest) {
      setDestinations(destinations.map(d => 
        d.id === editingDest.id 
          ? { 
              ...d, 
              ...formData,
              reviewCount: parseInt(formData.reviewCount),
            } as Destination
          : d
      ));
      showNotification("success", "Destination updated successfully!");
    } else {
      const newDest: Destination = {
        id: Date.now().toString(),
        ...formData,
        reviewCount: parseInt(formData.reviewCount),
        createdAt: new Date().toISOString(),
      };
      setDestinations([newDest, ...destinations]);
      showNotification("success", "Destination created successfully!");
    }
    
    closeModal();
  };

  const handleDelete = async (id: string) => {
    setDestinations(destinations.filter(d => d.id !== id));
    showNotification("success", "Destination deleted successfully!");
    setDeleteConfirm(null);
  };

  const openModal = (dest?: Destination) => {
    if (dest) {
      setEditingDest(dest);
      setFormData({
        name: dest.name,
        slug: dest.slug,
        country: dest.country,
        description: dest.description,
        image: dest.image,
        rating: dest.rating,
        reviewCount: dest.reviewCount.toString(),
        startingPrice: dest.startingPrice,
        isPopular: dest.isPopular,
        isFeatured: dest.isFeatured,
      });
    } else {
      setEditingDest(null);
      setFormData({
        name: "",
        slug: "",
        country: "",
        description: "",
        image: "",
        rating: "5.0",
        reviewCount: "0",
        startingPrice: "",
        isPopular: false,
        isFeatured: false,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDest(null);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredDestinations = destinations.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading || !user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-lg">
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Destinations Management</h1>
              <p className="text-sm text-slate-500">Add and manage travel destinations</p>
            </div>
          </div>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Destination
          </button>
        </div>
      </header>

      {notification && (
        <div className={`fixed top-20 right-6 z-50 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-slide-up ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          <CheckCircle className="w-5 h-5" />
          {notification.message}
        </div>
      )}

      <main className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search destinations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDestinations.map((dest) => (
            <div key={dest.id} className="bg-white rounded-xl shadow-sm overflow-hidden group">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                <div className="absolute top-3 left-3 flex gap-2">
                  {dest.isPopular && <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">Popular</span>}
                  {dest.isFeatured && <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">Featured</span>}
                </div>
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(dest)} className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-blue-50">
                    <Edit className="w-4 h-4 text-blue-600" />
                  </button>
                  <button onClick={() => setDeleteConfirm(dest.id)} className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-red-50">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-slate-900">{dest.name}</h3>
                <p className="text-slate-500 text-sm mb-2">{dest.country}</p>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{dest.rating}</span>
                  <span className="text-slate-400 text-sm">({dest.reviewCount} reviews)</span>
                </div>
                <p className="text-green-600 font-bold">From GH₵{dest.startingPrice}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingDest ? "Edit Destination" : "Add New Destination"}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Destination Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} className="search-input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Country *</label>
                  <input type="text" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="search-input" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="search-input min-h-[100px]" rows={3} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Image URL *</label>
                  <input type="url" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="search-input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Starting Price (GH₵) *</label>
                  <input type="number" value={formData.startingPrice} onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })} className="search-input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                  <input type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} className="search-input" />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isPopular} onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })} className="rounded text-blue-600" />
                    <span className="text-sm font-medium">Popular</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} className="rounded text-blue-600" />
                    <span className="text-sm font-medium">Featured</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t">
                <button type="button" onClick={closeModal} className="btn-secondary px-6 py-3">Cancel</button>
                <button type="submit" className="btn-primary px-6 py-3">{editingDest ? "Update Destination" : "Create Destination"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4">Delete Destination?</h3>
            <p className="text-slate-600 mb-6">This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary px-6 py-3">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
