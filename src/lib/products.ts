export type Category = { id: string; name: string; icon: string; description: string };
export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  comparePrice?: string;
  category: string;
  images: string[];
  rating: number;
  reviews: number;
  sold: number;
  brand?: string;
  specs?: { label: string; value: string }[];
  inStock?: number;
};

export const categories: Category[] = [
  { id: "phones", name: "Phones & Tablets", icon: "📱", description: "iPhones, Samsung, Tecno, iPads, Android tablets" },
  { id: "electronics", name: "Laptops & Electronics", icon: "💻", description: "MacBooks, laptops, gaming, projectors, CCTV, printers" },
  { id: "tvs", name: "TVs & Audio", icon: "📺", description: "Smart TVs, soundbars, speakers, headphones" },
  { id: "appliances", name: "Home Appliances", icon: "🍳", description: "Fridges, freezers, fans, cookers, kettles, blenders" },
  { id: "machinery", name: "Heavy Machinery", icon: "🚜", description: "Wheel loaders, excavators, cranes, generators" },
  { id: "fashion", name: "Fashion & Beauty", icon: "👕", description: "Ankara, sneakers, beauty tools, grooming" },
  { id: "accessories", name: "Accessories", icon: "🎒", description: "Bags, wearables, power banks, cases" },
];

const slug = (s: string) => s.toLowerCase().trim().replace(/\+/g, "-plus").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
const det = (s: string, mod: number) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h) % mod; };
const ratingFor = (s: string) => 4.3 + (det(s, 70) / 100);
const reviewsFor = (s: string) => 40 + det(s + "r", 1800);
const soldFor = (s: string) => 80 + det(s + "s", 4000);
const stockFor = (s: string) => 4 + det(s + "k", 80);

const out: Product[] = [];
function add(p: Omit<Product, "rating" | "reviews" | "sold" | "inStock" | "slug"> & { slug?: string }) {
  const key = p.name + (p.specs?.map((s) => s.value).join("|") ?? "");
  out.push({
    ...p,
    slug: p.slug ?? slug(p.name),
    rating: Math.round(ratingFor(key) * 100) / 100,
    reviews: reviewsFor(key),
    sold: soldFor(key),
    inStock: stockFor(key),
  });
}

// iPhones
const iphoneColors = ["Black", "White", "Blue", "Pink", "Green", "Gold", "Titanium Natural", "Titanium Blue", "Titanium Desert"];
const iphoneModels: { name: string; base: number; storages: string[]; colors: string[]; img: string }[] = [
  { name: "iPhone 15", base: 8999, storages: ["128GB", "256GB", "512GB"], colors: iphoneColors.slice(0, 6), img: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80" },
  { name: "iPhone 15 Pro", base: 11499, storages: ["128GB", "256GB", "512GB", "1TB"], colors: iphoneColors.slice(4, 9), img: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&q=80" },
  { name: "iPhone 15 Pro Max", base: 12499, storages: ["256GB", "512GB", "1TB"], colors: iphoneColors.slice(4, 9), img: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&q=80" },
  { name: "iPhone 16", base: 10499, storages: ["128GB", "256GB", "512GB"], colors: iphoneColors.slice(0, 7), img: "https://images.unsplash.com/photo-1727327874258-7c4e7e3d0b8a?w=800&q=80" },
  { name: "iPhone 16 Pro", base: 12999, storages: ["128GB", "256GB", "512GB", "1TB"], colors: iphoneColors.slice(4, 9), img: "https://images.unsplash.com/photo-1727327874258-7c4e7e3d0b8a?w=800&q=80" },
  { name: "iPhone 16 Pro Max", base: 14499, storages: ["256GB", "512GB", "1TB"], colors: iphoneColors.slice(4, 9), img: "https://images.unsplash.com/photo-1727327874258-7c4e7e3d0b8a?w=800&q=80" },
  { name: "iPhone 17 Pro", base: 14999, storages: ["256GB", "512GB", "1TB"], colors: iphoneColors.slice(4, 9), img: "https://images.unsplash.com/photo-1727327874258-7c4e7e3d0b8a?w=800&q=80" },
  { name: "iPhone 17 Pro Max", base: 16999, storages: ["256GB", "512GB", "1TB"], colors: iphoneColors.slice(4, 9), img: "https://images.unsplash.com/photo-1727327874258-7c4e7e3d0b8a?w=800&q=80" },
];
for (const m of iphoneModels) {
  for (const storage of m.storages.slice(0, 2)) {
    for (const color of m.colors.slice(0, 2)) {
      const storageMult = storage === "64GB" ? 1 : storage === "128GB" ? 1 : storage === "256GB" ? 1.12 : storage === "512GB" ? 1.28 : storage === "1TB" ? 1.5 : 1.8;
      const price = Math.round(m.base * storageMult);
      add({ id: `iphone-${slug(m.name + storage + color)}`, name: `Apple ${m.name} ${storage} — ${color}`, description: `${m.name} in ${color} with ${storage} storage. Original sealed, full Apple warranty.`, price: String(price), comparePrice: String(Math.round(price * 1.15)), category: "phones", brand: "Apple", images: [m.img], specs: [{ label: "Storage", value: storage }, { label: "Colour", value: color }, { label: "Warranty", value: "1 year Apple" }] });
    }
  }
}

// Samsung
const samsungModels = [
  { name: "Galaxy S24", base: 6500, storages: ["128GB", "256GB"], colors: ["Onyx Black", "Cobalt Violet"], img: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80" },
  { name: "Galaxy S24 Ultra", base: 10500, storages: ["256GB", "512GB"], colors: ["Titanium Black", "Titanium Gray"], img: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80" },
  { name: "Galaxy S25", base: 7500, storages: ["128GB", "256GB"], colors: ["Navy", "Silver Shadow"], img: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80" },
  { name: "Galaxy S25 Ultra", base: 11500, storages: ["256GB", "512GB"], colors: ["Titanium Black", "Titanium Blue"], img: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80" },
  { name: "Galaxy A55", base: 3200, storages: ["128GB", "256GB"], colors: ["Awesome Iceblue", "Awesome Navy"], img: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80" },
];
for (const m of samsungModels) {
  for (const storage of m.storages.slice(0, 2)) {
    for (const color of m.colors.slice(0, 2)) {
      const sm = storage === "128GB" ? 1 : storage === "256GB" ? 1.1 : 1.25;
      const price = Math.round(m.base * sm);
      add({ id: `samsung-${slug(m.name + storage + color)}`, name: `Samsung ${m.name} ${storage} — ${color}`, description: `${m.name} in ${color} with ${storage}. Sealed box, 1-year Samsung warranty.`, price: String(price), comparePrice: String(Math.round(price * 1.12)), category: "phones", brand: "Samsung", images: [m.img], specs: [{ label: "Storage", value: storage }, { label: "Colour", value: color }] });
    }
  }
}

// Budget phones
const budgetPhones = [
  { brand: "Tecno", name: "Camon 30 Premier", base: 3200, img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80" },
  { brand: "Tecno", name: "Spark 20 Pro+", base: 1400, img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80" },
  { brand: "Infinix", name: "Note 40 Pro", base: 2400, img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80" },
  { brand: "Xiaomi", name: "Redmi Note 14 Pro+", base: 3300, img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80" },
  { brand: "Google", name: "Pixel 9 Pro", base: 8500, img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80" },
];
for (const p of budgetPhones) {
  for (const storage of ["128GB", "256GB"]) {
    const sm = storage === "128GB" ? 1 : 1.15;
    const price = Math.round(p.base * sm);
    add({ id: `${slug(p.brand + p.name + storage)}`, name: `${p.brand} ${p.name} ${storage}`, description: `${p.brand} ${p.name}, ${storage} storage. Sealed, 1-year warranty.`, price: String(price), comparePrice: String(Math.round(price * 1.1)), category: "phones", brand: p.brand, images: [p.img], specs: [{ label: "Storage", value: storage }] });
  }
}

// MacBooks
const macbooks = [
  { name: "MacBook Air 13\" M3", base: 11000, storages: ["256GB", "512GB"] },
  { name: "MacBook Air 15\" M4", base: 15500, storages: ["256GB", "512GB"] },
  { name: "MacBook Pro 14\" M4", base: 19000, storages: ["512GB", "1TB"] },
  { name: "MacBook Pro 16\" M4 Pro", base: 30000, storages: ["512GB", "1TB"] },
  { name: "MacBook Pro 16\" M4 Max", base: 45000, storages: ["1TB", "2TB"] },
];
for (const m of macbooks) {
  for (const s of m.storages) {
    const sm = s === "256GB" ? 1 : s === "512GB" ? 1.12 : s === "1TB" ? 1.3 : 1.55;
    const price = Math.round(m.base * sm);
    add({ id: `mbp-${slug(m.name + s)}`, name: `Apple ${m.name} ${s}`, description: `${m.name} with ${s} SSD.`, price: String(price), comparePrice: String(Math.round(price * 1.1)), category: "electronics", brand: "Apple", images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80"], specs: [{ label: "Storage", value: s }] });
  }
}

// Windows laptops
const winLaptops = [
  { brand: "HP", name: "Pavilion 15", base: 5500, img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80" },
  { brand: "HP", name: "Spectre x360 14", base: 12500, img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80" },
  { brand: "Dell", name: "XPS 15", base: 16500, img: "https://images.unsplash.com/photo-1593642632823-8f78536788c6?w=800&q=80" },
  { brand: "Lenovo", name: "ThinkPad X1 Carbon", base: 16000, img: "https://images.unsplash.com/photo-1593642632823-8f78536788c6?w=800&q=80" },
  { brand: "Asus", name: "ROG Zephyrus G14", base: 15500, img: "https://images.unsplash.com/photo-1593642632823-8f78536788c6?w=800&q=80" },
];
for (const l of winLaptops) {
  for (const ram of ["16GB", "32GB"]) {
    const rm = ram === "16GB" ? 1 : 1.25;
    const price = Math.round(l.base * rm);
    add({ id: `lap-${slug(l.brand + l.name + ram)}`, name: `${l.brand} ${l.name} (${ram} RAM)`, description: `${l.brand} ${l.name} with ${ram} RAM, 512GB SSD.`, price: String(price), comparePrice: String(Math.round(price * 1.1)), category: "electronics", brand: l.brand, images: [l.img], specs: [{ label: "RAM", value: ram }] });
  }
}

// TVs
const tvBrands = [
  { brand: "Samsung", sizes: [43, 55, 65, 75], base: 1800, img: "https://images.unsplash.com/photo-1593784697956-ec88bb85e9f9?w=800&q=80" },
  { brand: "LG", sizes: [43, 55, 65, 75], base: 1900, img: "https://images.unsplash.com/photo-1593784697956-ec88bb85e9f9?w=800&q=80" },
  { brand: "Sony", sizes: [55, 65, 75], base: 2400, img: "https://images.unsplash.com/photo-1593784697956-ec88bb85e9f9?w=800&q=80" },
  { brand: "Hisense", sizes: [43, 55, 65], base: 1400, img: "https://images.unsplash.com/photo-1593784697956-ec88bb85e9f9?w=800&q=80" },
  { brand: "TCL", sizes: [43, 55, 65], base: 1300, img: "https://images.unsplash.com/photo-1593784697956-ec88bb85e9f9?w=800&q=80" },
];
for (const b of tvBrands) {
  for (const size of b.sizes) {
    const sm = size <= 43 ? 1 : size <= 55 ? 1.7 : size <= 65 ? 2.4 : 3.6;
    const price = Math.round(b.base * sm);
    add({ id: `tv-${slug(b.brand + size)}`, name: `${b.brand} ${size}" Smart TV 4K`, description: `${b.brand} ${size}-inch 4K UHD Smart TV.`, price: String(price), comparePrice: String(Math.round(price * 1.15)), category: "tvs", brand: b.brand, images: [b.img], specs: [{ label: "Size", value: `${size}"` }] });
  }
}

// Audio
const audio = [
  { name: "AirPods Pro 2", base: 2299, brand: "Apple" },
  { name: "AirPods Max", base: 5499, brand: "Apple" },
  { name: "Sony WH-1000XM5", base: 3499, brand: "Sony" },
  { name: "JBL Flip 6", base: 899, brand: "JBL" },
  { name: "JBL PartyBox 310", base: 3499, brand: "JBL" },
  { name: "Bose QuietComfort Ultra", base: 3799, brand: "Bose" },
  { name: "Beats Studio Pro", base: 3299, brand: "Beats" },
];
for (const a of audio) {
  add({ id: `audio-${slug(a.name)}`, name: a.name, description: `${a.brand} ${a.name}. Sealed, 1-year warranty.`, price: String(a.base), comparePrice: String(Math.round(a.base * 1.15)), category: "tvs", brand: a.brand, images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"] });
}

// Home appliances
const appliances = [
  { name: "Air Fryer 5.5L Digital", base: 899, img: "https://images.unsplash.com/photo-1648713087420-5997c066a9e6?w=800&q=80" },
  { name: "Blender 1000W 2L", base: 549, img: "https://images.unsplash.com/photo-1570222094114-28a9d88a27e6?w=800&q=80" },
  { name: "Electric Kettle 1.8L Glass", base: 299, img: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80" },
  { name: "Rice Cooker 1.8L", base: 399, img: "https://images.unsplash.com/photo-1585237672814-8f85a8118bf3?w=800&q=80" },
  { name: "Microwave Oven 25L", base: 899, img: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&q=80" },
  { name: "Chest Freezer 200L", base: 2499, img: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&q=80" },
  { name: "Double-Door Fridge 350L", base: 4899, img: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&q=80" },
  { name: "Split AC 1.5 HP Inverter", base: 4299, img: "https://images.unsplash.com/photo-1631545806609-05f9a4b1e7f5?w=800&q=80" },
  { name: "Washing Machine 8kg Front Load", base: 4299, img: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80" },
  { name: "Petrol Generator 6.5KVA", base: 5899, img: "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=800&q=80" },
  { name: "Solar Panel 300W Mono", base: 699, img: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80" },
  { name: "Solar Inverter 3.5KVA", base: 4299, img: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80" },
  { name: "Standing Fan 18\" Remote", base: 549, img: "https://images.unsplash.com/photo-1618941716939-553dfdfc698a?w=800&q=80" },
  { name: "Gas Cooker 4-Burner + Oven", base: 1699, img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80" },
  { name: "Espresso Machine 15 bar", base: 1899, img: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a6e4?w=800&q=80" },
  { name: "Vacuum Cleaner Cordless", base: 1499, img: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&q=80" },
];
for (const a of appliances) {
  add({ id: `ap-${slug(a.name)}`, name: a.name, description: `${a.name}. Energy-efficient, 1-year warranty.`, price: String(a.base), comparePrice: String(Math.round(a.base * 1.18)), category: "appliances", images: [a.img] });
}

// Heavy machinery
const machinery = [
  { name: "CAT 950M Wheel Loader", base: 1850000, brand: "Caterpillar", img: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80" },
  { name: "CAT 320 Hydraulic Excavator", base: 1450000, brand: "Caterpillar", img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80" },
  { name: "JCB 3CX Backhoe Loader", base: 485000, brand: "JCB", img: "https://images.unsplash.com/photo-1574689049597-738842bbe8e5?w=800&q=80" },
  { name: "Forklift 3 Ton Diesel", base: 125000, brand: "Toyota", img: "https://images.unsplash.com/photo-1605152276897-4f618f831968?w=800&q=80" },
  { name: "Dump Truck 20 Ton", base: 680000, brand: "SINOTRUK", img: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80" },
  { name: "Mobile Crane 50 Ton", base: 920000, brand: "XCMG", img: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&q=80" },
  { name: "Mini Excavator 3.5 Ton", base: 185000, brand: "Kubota", img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80" },
  { name: "Road Roller 10 Ton", base: 245000, brand: "Bomag", img: "https://images.unsplash.com/photo-1621922688758-8d99e4a0f17b?w=800&q=80" },
];
for (const m of machinery) {
  add({ id: `mc-${slug(m.name)}`, name: m.name, description: `${m.brand} ${m.name}. Includes 6-month warranty.`, price: String(m.base), comparePrice: String(Math.round(m.base * 1.1)), category: "machinery", brand: m.brand, images: [m.img] });
}

// Accessories
const acc = [
  { name: "Power Bank 20000mAh", base: 249, img: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80" },
  { name: "USB-C Hub 7-in-1", base: 299, img: "https://images.unsplash.com/photo-1622396636133-2b5e3c6d0f0e?w=800&q=80" },
  { name: "Apple Watch Series 9", base: 4299, img: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80" },
  { name: "Samsung Galaxy Watch 6", base: 2499, img: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80" },
  { name: "Laptop Backpack 17\" Anti-theft", base: 399, img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80" },
  { name: "Dash Cam 4K Front + Rear", base: 599, img: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80" },
  { name: "CCTV 4-Cam Set with 1TB DVR", base: 1499, img: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80" },
  { name: "WiFi 6 Router AX3000", base: 799, img: "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800&q=80" },
  { name: "External SSD 1TB USB-C", base: 699, img: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80" },
];
for (const a of acc) {
  add({ id: `ac-${slug(a.name)}`, name: a.name, description: `${a.name}. Brand new with warranty.`, price: String(a.base), comparePrice: String(Math.round(a.base * 1.2)), category: "accessories", images: [a.img] });
}

// Fashion
const fashion = [
  { name: "Men's Leather Sneakers", base: 549, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80" },
  { name: "Women's Ankara Dress", base: 350, img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80" },
  { name: "Men's Two-Piece Suit", base: 1299, img: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80" },
  { name: "Women's Handbag Leather", base: 599, img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80" },
  { name: "Perfume EDP 100ml Designer", base: 599, img: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80" },
  { name: "Makeup Kit Professional 24-colour", base: 499, img: "https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=800&q=80" },
  { name: "Sunglasses Polarized UV400", base: 199, img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80" },
];
for (const f of fashion) {
  add({ id: `fs-${slug(f.name)}`, name: f.name, description: `${f.name}. Premium quality.`, price: String(f.base), comparePrice: String(Math.round(f.base * 1.25)), category: "fashion", images: [f.img] });
}

// Electronics extras
const elec = [
  { name: "PlayStation 5 Slim Disc", base: 5499, img: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80" },
  { name: "Xbox Series X", base: 5299, img: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&q=80" },
  { name: "Nintendo Switch OLED", base: 2999, img: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&q=80" },
  { name: "Gaming Monitor 27\" 144Hz", base: 1899, img: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80" },
  { name: "Drone 4K with Gimbal", base: 3499, img: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80" },
  { name: "Soundbar 5.1ch Dolby Atmos", base: 3499, img: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80" },
  { name: "4K Projector 300\" Display", base: 3299, img: "https://images.unsplash.com/photo-1626379953822-baec19c3accd?w=800&q=80" },
];
for (const e of elec) {
  add({ id: `el-${slug(e.name)}`, name: e.name, description: `${e.name}. Sealed box, 1-year warranty.`, price: String(e.base), comparePrice: String(Math.round(e.base * 1.15)), category: "electronics", images: [e.img] });
}

export const products: Product[] = out;

export function getProduct(slugStr: string): Product | undefined {
  return products.find((p) => p.slug === slugStr);
}

export function getProductsByCategory(cat: string): Product[] {
  return products.filter((p) => p.category === cat);
}

export function getRelated(product: Product, limit = 4): Product[] {
  return products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, limit);
}
