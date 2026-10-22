import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDialog } from "./hooks.js";
import {
  Home, UserPlus, Car, Baby, CalendarCheck, Wallet, Wrench, Briefcase,
  ShoppingBag, Bell, User, LogOut, Menu, X, Search, ChevronDown, ChevronRight,
  ShieldAlert, CheckCircle2, Clock, MapPin, QrCode, Phone, Building2,
  ChevronLeft, Plus, ArrowRight, AlertTriangle, Loader2, Download, XCircle,
  Megaphone, Receipt, Users, ArrowUpRight, Settings, CircleCheck, CircleDot,
  Waves, Dumbbell, Star, MapPin as MapPinIcon, ShieldCheck, Camera, Pause,
  Play, Trash2, ShoppingCart, Filter, Fuel, ParkingSquare, Mail, ChevronUp,
  Tag, MessageCircle, ImageIcon, PackageCheck,
} from "lucide-react";

/* ============================================================================
   MOCK DATA
   ============================================================================ */

const RESIDENT = {
  name: "Ananya Rao",
  initials: "AR",
  flat: "B-1204, RUhome",
  phone: "+91 98450 12345",
  email: "ananya.rao@example.com",
  community: "RUhome",
};

const NAV_ITEMS = [
  { key: "dashboard", label: "Home", icon: Home },
  { key: "visitors", label: "Visitors", icon: UserPlus },
  { key: "parking", label: "Parking", icon: Car },
  { key: "kids", label: "Kids Tracking", icon: Baby },
  { key: "amenities", label: "Amenities", icon: CalendarCheck },
  { key: "payments", label: "Payments", icon: Wallet },
  { key: "requests", label: "Service Requests", icon: Wrench },
  { key: "services", label: "Staff Services", icon: Briefcase },
  { key: "marketplace", label: "Marketplace", icon: ShoppingBag },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "profile", label: "Profile", icon: User },
];

const PAGE_META = {
  visitors: { title: "Visitors", blurb: "Invite guests, share QR passes and track every check-in.", icon: UserPlus },
  parking: { title: "Parking", blurb: "See your assigned bay and visitor parking allocation.", icon: Car },
  kids: { title: "Kids Tracking", blurb: "Zone-level presence and pickup authorisation for your children.", icon: Baby },
  amenities: { title: "Amenities", blurb: "Browse the clubhouse, gym, pool and courts, and book a slot.", icon: CalendarCheck },
  payments: { title: "Payments", blurb: "Maintenance dues, utility bills, receipts and payment history.", icon: Wallet },
  requests: { title: "Service Requests", blurb: "Raise a complaint or request and track it through to resolution.", icon: Wrench },
  services: { title: "Staff Services", blurb: "Book verified maids, cooks, drivers and technicians.", icon: Briefcase },
  marketplace: { title: "Marketplace", blurb: "Order from local vendors, book appointments and manage subscriptions.", icon: ShoppingBag },
  profile: { title: "Profile", blurb: "Your details, family members and notification preferences.", icon: User },
};

const TODAY_VISITORS = [
  { id: "v1", name: "Rohit Sharma", purpose: "Personal visit", time: "11:30 AM", status: "Expected" },
  { id: "v2", name: "Swiggy Delivery", purpose: "Food delivery", time: "12:15 PM", status: "Checked-in" },
  { id: "v3", name: "Meena (Plumber)", purpose: "Service request #SR-1042", time: "9:00 AM", status: "Completed" },
];

const STATUS_STYLES = {
  Expected: { fg: "var(--color-info-fg)", bg: "var(--color-info-bg)" },
  "Checked-in": { fg: "var(--color-success-fg)", bg: "var(--color-success-bg)" },
  Completed: { fg: "var(--color-text-secondary)", bg: "#EEF0F4" },
  Open: { fg: "var(--color-warning-fg)", bg: "var(--color-warning-bg)" },
  Assigned: { fg: "var(--color-info-fg)", bg: "var(--color-info-bg)" },
  "In Progress": { fg: "var(--color-warning-fg)", bg: "var(--color-warning-bg)" },
  Resolved: { fg: "var(--color-success-fg)", bg: "var(--color-success-bg)" },
};

const OUTSTANDING_BILL = {
  id: "BILL-SEP26",
  label: "Maintenance — September 2026",
  amount: 4250,
  dueDate: "12 Sep 2026",
  flat: "B-1204",
};

const UPCOMING_AMENITY = {
  name: "Clubhouse — Party Hall",
  date: "Sat, 6 Sep 2026",
  time: "6:00 PM – 8:00 PM",
};

const OPEN_REQUESTS = [
  { id: "SR-1042", title: "Kitchen tap leaking", category: "Plumbing", status: "In Progress", raisedOn: "2 Sep" },
  { id: "SR-1038", title: "Lift button not working (Tower B)", category: "Electrical", status: "Open", raisedOn: "30 Aug" },
];

const ANNOUNCEMENTS = [
  { id: "a1", title: "Water supply maintenance on 8 Sep", body: "Water will be shut off between 10 AM–1 PM for tank cleaning.", date: "3 Sep" },
  { id: "a2", title: "Ganesh Chaturthi celebrations", body: "Join us at the clubhouse lawn on 7 Sep, 6 PM onwards.", date: "1 Sep" },
  { id: "a3", title: "New visitor policy for deliveries", body: "All delivery partners must now show an OTP at the gate.", date: "28 Aug" },
];

const NOTIFICATIONS_SEED = [
  { id: "n1", type: "visitor", title: "Rohit Sharma checked in", body: "Your visitor was verified at Gate 1.", time: "10 min ago", read: false },
  { id: "n2", type: "payment", title: "Maintenance due in 7 days", body: "₹4,250 due on 12 Sep 2026.", time: "2 hr ago", read: false },
  { id: "n3", type: "request", title: "Request SR-1042 updated", body: "A technician has been assigned to your request.", time: "5 hr ago", read: false },
  { id: "n4", type: "amenity", title: "Booking confirmed", body: "Clubhouse — Party Hall on 6 Sep, 6–8 PM.", time: "Yesterday", read: true },
  { id: "n5", type: "announcement", title: "Water supply maintenance", body: "Shut-off scheduled 8 Sep, 10 AM–1 PM.", time: "2 days ago", read: true },
];

const NOTIF_ICON = {
  visitor: UserPlus, payment: Wallet, request: Wrench, amenity: CalendarCheck, announcement: Megaphone,
};

const UPCOMING_VISITORS = [
  { id: "v4", name: "Priya Menon", purpose: "Personal visit", date: "6 Sep", time: "5:00 PM", status: "Expected" },
  { id: "v5", name: "Urban Company — AC Service", purpose: "Service / Repair", date: "7 Sep", time: "10:00 AM", status: "Expected" },
];

const VISITOR_HISTORY = [
  { id: "h1", name: "Zomato Delivery", purpose: "Food delivery", date: "3 Sep", time: "8:45 PM", status: "Completed" },
  { id: "h2", name: "Meena (Plumber)", purpose: "Service request #SR-1042", date: "3 Sep", time: "9:00 AM", status: "Completed" },
  { id: "h3", name: "Rajesh Kumar", purpose: "Personal visit", date: "1 Sep", time: "4:30 PM", status: "Completed" },
  { id: "h4", name: "Ola Cab", purpose: "Cab / Taxi", date: "31 Aug", time: "7:15 AM", status: "Completed" },
  { id: "h5", name: "Amazon Delivery", purpose: "Delivery", date: "29 Aug", time: "1:20 PM", status: "Cancelled" },
];

const PARKING = {
  assigned: { slot: "B-1204-P2", level: "Level 1, Block B — Covered", vehicle: "KA 05 MN 4521" },
  visitorSlots: { total: 12, occupied: 7, available: 5 },
  visitorAllocations: [
    { id: "p1", visitor: "Rohit Sharma", slot: "V-04", time: "11:30 AM", status: "Reserved" },
    { id: "p2", visitor: "Priya Menon", slot: "V-09", time: "5:00 PM", status: "Reserved" },
  ],
};

const CHILDREN = [
  { id: "c1", name: "Aarav Rao", age: 8, initials: "AR", zone: "At School", statusTone: "info", lastEvent: "Exited Tower B main gate", lastEventTime: "8:05 AM", battery: 74 },
  { id: "c2", name: "Diya Rao", age: 5, initials: "DR", zone: "In Clubhouse Zone", statusTone: "success", lastEvent: "Entered Clubhouse play area", lastEventTime: "4:20 PM", battery: 58 },
];

const KID_EVENTS = [
  { id: "e1", child: "Diya Rao", event: "Entered Clubhouse Zone", time: "4:20 PM, Today" },
  { id: "e2", child: "Aarav Rao", event: "Exited Tower B main gate", time: "8:05 AM, Today" },
  { id: "e3", child: "Aarav Rao", event: "Entered school bus pickup zone", time: "7:50 AM, Today" },
  { id: "e4", child: "Diya Rao", event: "Exited Tower B main gate", time: "4:05 PM, Yesterday" },
];

const PICKUP_LIST = [
  { name: "Ananya Rao", relation: "Mother", phone: "+91 98450 12345" },
  { name: "Karthik Rao", relation: "Father", phone: "+91 98450 67890" },
  { name: "Lakshmi Bai", relation: "Grandmother", phone: "+91 90000 11223" },
];

const AMENITIES = [
  { id: "am1", name: "Clubhouse — Party Hall", icon: "Home", capacity: "Up to 80 guests", hours: "9 AM – 10 PM", rules: "Paid booking · 2 hr slots · Caterer allowed", price: 1500 },
  { id: "am2", name: "Swimming Pool", icon: "Waves", capacity: "20 at a time", hours: "6 AM – 9 PM", rules: "Free · 1 hr slots · Kids need adult supervision", price: 0 },
  { id: "am3", name: "Gym", icon: "Dumbbell", capacity: "15 at a time", hours: "5 AM – 10 PM", rules: "Free · Walk-in or 1 hr slot booking", price: 0 },
  { id: "am4", name: "Tennis Court", icon: "CircleDot", capacity: "4 players", hours: "6 AM – 9 PM", rules: "Free · 1 hr slots · Shoes mandatory", price: 0 },
];

const AMENITY_BOOKINGS = [
  { id: "bk1", amenity: "Clubhouse — Party Hall", date: "Sat, 6 Sep 2026", time: "6:00 PM – 8:00 PM", status: "Upcoming" },
  { id: "bk2", amenity: "Tennis Court", date: "Wed, 2 Sep 2026", time: "7:00 AM – 8:00 AM", status: "Completed" },
];

const MAINTENANCE_BILLS = [
  { id: "m1", label: "Maintenance — September 2026", amount: 4250, dueDate: "12 Sep 2026", status: "Due" },
  { id: "m2", label: "Maintenance — August 2026", amount: 4250, dueDate: "12 Aug 2026", status: "Paid" },
  { id: "m3", label: "Maintenance — July 2026", amount: 4100, dueDate: "12 Jul 2026", status: "Paid" },
];

const UTILITY_BILLS = [
  { id: "u1", label: "Electricity — August cycle", amount: 1840, dueDate: "15 Sep 2026", status: "Due" },
  { id: "u2", label: "Water — August cycle", amount: 320, dueDate: "15 Sep 2026", status: "Due" },
  { id: "u3", label: "Electricity — July cycle", amount: 1620, dueDate: "15 Aug 2026", status: "Paid" },
];

const PAYMENT_HISTORY = [
  { id: "r1", label: "Maintenance — August 2026", amount: 4250, date: "10 Aug 2026", receiptId: "RCPT-8F2K91" },
  { id: "r2", label: "Electricity — July cycle", amount: 1620, date: "9 Aug 2026", receiptId: "RCPT-3A7M02" },
  { id: "r3", label: "Maintenance — July 2026", amount: 4100, date: "11 Jul 2026", receiptId: "RCPT-9Q1Z44" },
  { id: "r4", label: "Clubhouse booking fee", amount: 1500, date: "28 Jun 2026", receiptId: "RCPT-1L8R76" },
];

const ALL_REQUESTS = [
  { id: "SR-1042", title: "Kitchen tap leaking", category: "Plumbing", status: "In Progress", raisedOn: "2 Sep 2026", description: "Constant drip from the kitchen tap, worsening over the last two days." },
  { id: "SR-1038", title: "Lift button not working (Tower B)", category: "Electrical", status: "Open", raisedOn: "30 Aug 2026", description: "Ground floor call button in Tower B lift lobby doesn't light up or respond." },
  { id: "SR-1021", title: "Balcony grill rusted", category: "Carpentry", status: "Resolved", raisedOn: "18 Aug 2026", description: "Grill hinges rusted and squeaking, needs oiling or replacement.", rating: 4 },
  { id: "SR-1009", title: "Common area light flickering", category: "Electrical", status: "Resolved", raisedOn: "5 Aug 2026", description: "Corridor light outside B-1204 flickers intermittently at night.", rating: 5 },
];

const WORKERS = [
  { id: "w1", name: "Lakshmi Devi", role: "Maid", rating: 4.8, experience: "6 yrs", verified: true, initials: "LD", availability: "Mon–Sat, 7–11 AM" },
  { id: "w2", name: "Suresh Babu", role: "Driver", rating: 4.6, experience: "9 yrs", verified: true, initials: "SB", availability: "All days, on call" },
  { id: "w3", name: "Kamala Rani", role: "Cook", rating: 4.9, experience: "4 yrs", verified: true, initials: "KR", availability: "Mon–Sun, 6–9 AM & 6–8 PM" },
  { id: "w4", name: "Irfan Sheikh", role: "Technician", rating: 4.5, experience: "5 yrs", verified: true, initials: "IS", availability: "On demand" },
  { id: "w5", name: "Ravi Naik", role: "Car cleaner", rating: 4.7, experience: "3 yrs", verified: true, initials: "RN", availability: "Daily, 6–8 AM" },
];

const VENDORS = [
  { id: "vn1", name: "Fresh Mart Grocery", category: "Grocery", rating: 4.5, meta: "Delivers in ~25 min" },
  { id: "vn2", name: "MedPlus Pharmacy", category: "Pharmacy", rating: 4.7, meta: "Delivers in ~20 min" },
  { id: "vn3", name: "Glow Salon", category: "Salon", rating: 4.6, meta: "Slots from 10 AM" },
  { id: "vn4", name: "CareFirst Clinic", category: "Clinic", rating: 4.8, meta: "Slots from 9 AM" },
];

const PRODUCTS = [
  { id: "pr1", vendorId: "vn1", name: "Fruits & Vegetables Basket", price: 349 },
  { id: "pr2", vendorId: "vn1", name: "Daily Essentials Combo", price: 599 },
  { id: "pr3", vendorId: "vn2", name: "Health Checkup Kit", price: 899 },
];

const SUBSCRIPTIONS = [
  { id: "sb1", service: "Milk delivery", vendor: "Fresh Mart Grocery", frequency: "Daily, 6–7 AM", price: 60, status: "Active" },
  { id: "sb2", service: "Car cleaning", vendor: "Ravi Naik", frequency: "Daily, 6–8 AM", price: 800, status: "Paused" },
];

const LISTING_CATEGORIES = ["Furniture", "Electronics", "Vehicles", "Books & Kids", "Appliances", "Other"];

const RESIDENT_LISTINGS = [
  { id: "ls1", title: "IKEA study table (like new)", price: 2500, category: "Furniture", condition: "Like New", seller: "Kavita Iyer", flat: "A-0803", postedOn: "2 days ago", description: "Barely used, moving out sale. White finish, 100x50cm.", mine: false, status: "Active" },
  { id: "ls2", title: "Study bicycle - kids (6-9 yrs)", price: 1800, category: "Books & Kids", condition: "Used", seller: "Rohit Sharma", flat: "C-0501", postedOn: "3 days ago", description: "Outgrown by my son, well maintained, new tyres.", mine: false, status: "Active" },
  { id: "ls3", title: "Samsung 32\" LED TV", price: 8500, category: "Electronics", condition: "Used", seller: "Ananya Rao", flat: "B-1204", postedOn: "5 days ago", description: "Upgrading to a bigger screen. Works perfectly, remote included.", mine: true, status: "Active" },
  { id: "ls4", title: "Honda Activa 2019", price: 45000, category: "Vehicles", condition: "Used", seller: "Vikram Nair", flat: "D-1102", postedOn: "1 week ago", description: "Single owner, all papers clear, 18,000 km driven.", mine: false, status: "Active" },
  { id: "ls5", title: "Prestige induction cooktop", price: 1200, category: "Appliances", condition: "Like New", seller: "Ananya Rao", flat: "B-1204", postedOn: "2 weeks ago", description: "Got a new one as a gift, this one works great.", mine: true, status: "Sold" },
];

/* ============================================================================
   HELPERS
   ============================================================================ */

function formatINR(n) {
  return "₹" + n.toLocaleString("en-IN");
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// Deterministic faux-QR pattern generator (visual only, not a real scannable code)
function qrGrid(seed, n = 17) {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967295; };
  const grid = Array.from({ length: n }, () => Array.from({ length: n }, () => rand() < 0.42));
  const stampFinder = (r0, c0) => {
    for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
      const border = r === 0 || r === 6 || c === 0 || c === 6;
      const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      grid[r0 + r][c0 + c] = border || inner;
    }
  };
  stampFinder(0, 0); stampFinder(0, n - 7); stampFinder(n - 7, 0);
  return grid;
}

/* ============================================================================
   GLOBAL STYLES / DESIGN TOKENS
   ============================================================================ */

function GlobalStyles() {
  return (
    <style>{`

      :root {
        --color-navy-900: #14213D;
        --color-navy-800: #1B2B4B;
        --color-navy-700: #24365E;
        --color-navy-50: #EEF1F7;
        --color-bg: #F5F6FA;
        --color-surface: #FFFFFF;
        --color-border: #E4E7EE;
        --color-marigold-500: #F2A93B;
        --color-marigold-600: #DB9424;
        --color-marigold-50: #FDF3DE;
        --color-text-primary: #1A2130;
        --color-text-secondary: #626B80;
        --color-text-tertiary: #697184;
        --color-success: #2F9E68;
        --color-success-bg: #E7F6EE;
        --color-danger: #D64545;
        --color-danger-bg: #FCEAEA;
        --color-warning: #C9860B;
        --color-warning-bg: #FDF3DC;
        --color-info: #3B6FD8;
        --color-info-bg: #EAF0FC;
        --color-success-fg: #237A50;
        --color-warning-fg: #8A5A00;
        --color-danger-fg: #B83232;
        --color-info-fg: #2F5DBF;
      }

      * { box-sizing: border-box; }
      body, .rwa-root { font-family: 'Inter', sans-serif; color: var(--color-text-primary); }
      .rwa-heading { font-family: 'Sora', sans-serif; }

      .rwa-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
      .rwa-scrollbar::-webkit-scrollbar-thumb { background: #D6DAE3; border-radius: 8px; }
      .rwa-scrollbar::-webkit-scrollbar-track { background: transparent; }

      @keyframes rwa-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      .rwa-animate-in { animation: rwa-fade-in 0.22s ease-out; }

      @keyframes rwa-slide-in { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      .rwa-drawer-in { animation: rwa-slide-in 0.24s ease-out; }

      @keyframes rwa-pulse-ring {
        0% { box-shadow: 0 0 0 0 rgba(214, 69, 69, 0.35); }
        70% { box-shadow: 0 0 0 14px rgba(214, 69, 69, 0); }
        100% { box-shadow: 0 0 0 0 rgba(214, 69, 69, 0); }
      }
      .rwa-sos-pulse { animation: rwa-pulse-ring 2s infinite; }

      @keyframes rwa-toast-in { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
      .rwa-toast { animation: rwa-toast-in 0.2s ease-out; }

      .rwa-focus:focus-visible { outline: 2px solid var(--color-navy-700); outline-offset: 2px; }

      .rwa-btn { font-family: 'Inter', sans-serif; font-weight: 600; transition: background-color .15s ease, border-color .15s ease, color .15s ease, transform .1s ease; }
      .rwa-btn:active { transform: scale(0.98); }
      .rwa-card-hover { transition: border-color .15s ease, box-shadow .15s ease; }
    `}</style>
  );
}

/* ============================================================================
   REUSABLE UI ATOMS
   ============================================================================ */

function Button({ variant = "primary", size = "md", icon: Icon, iconRight, className = "", children, style, ...props }) {
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2.5 text-sm", lg: "px-5 py-3 text-base" };
  const variants = {
    primary: { background: "var(--color-navy-800)", color: "#fff", border: "1px solid var(--color-navy-800)" },
    accent: { background: "var(--color-marigold-500)", color: "var(--color-navy-900)", border: "1px solid var(--color-marigold-500)" },
    secondary: { background: "#fff", color: "var(--color-text-primary)", border: "1px solid var(--color-border)" },
    danger: { background: "var(--color-danger)", color: "#fff", border: "1px solid var(--color-danger)" },
    ghost: { background: "transparent", color: "var(--color-text-secondary)", border: "1px solid transparent" },
  };
  return (
    <button
      className={`rwa-btn rwa-focus rounded-lg inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${className}`}
      style={{ ...variants[variant], ...style }}
      onMouseEnter={(e) => { if (!props.disabled) e.currentTarget.style.filter = "brightness(0.94)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; }}
      {...props}
    >
      {Icon && <Icon size={16} strokeWidth={2.25} />}
      {children}
      {iconRight && React.createElement(iconRight, { size: 16, strokeWidth: 2.25 })}
    </button>
  );
}

function IconButton({ icon: Icon, label, active, badge, className = "", ...props }) {
  return (
    <button
      aria-label={label}
      className={`rwa-focus relative w-10 h-10 rounded-full inline-flex items-center justify-center transition-colors ${className}`}
      style={{ background: active ? "var(--color-navy-50)" : "transparent", color: "var(--color-text-secondary)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-navy-50)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = active ? "var(--color-navy-50)" : "transparent")}
      {...props}
    >
      <Icon size={19} strokeWidth={2} />
      {badge ? (
        <span
          className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
          style={{ background: "var(--color-danger)", color: "#fff" }}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function Badge({ children, tone = "neutral", fg, bg }) {
  const tones = {
    neutral: { fg: "var(--color-text-secondary)", bg: "#EEF0F4" },
    success: { fg: "var(--color-success-fg)", bg: "var(--color-success-bg)" },
    warning: { fg: "var(--color-warning-fg)", bg: "var(--color-warning-bg)" },
    danger: { fg: "var(--color-danger-fg)", bg: "var(--color-danger-bg)" },
    info: { fg: "var(--color-info-fg)", bg: "var(--color-info-bg)" },
  };
  const t = fg && bg ? { fg, bg } : tones[tone];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ color: t.fg, background: t.bg }}
    >
      {children}
    </span>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || { fg: "var(--color-text-secondary)", bg: "#EEF0F4" };
  return <Badge fg={s.fg} bg={s.bg}>{status}</Badge>;
}

function Card({ children, className = "", padded = true, ...props }) {
  return (
    <div
      className={`rwa-card-hover rounded-2xl bg-white ${padded ? "p-5" : ""} ${className}`}
      style={{ border: "1px solid var(--color-border)" }}
      {...props}
    >
      {children}
    </div>
  );
}

function Avatar({ initials, size = 36 }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold shrink-0"
      style={{ width: size, height: size, background: "var(--color-navy-800)", color: "#fff", fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

function Spinner({ size = 18, color = "currentColor" }) {
  return <Loader2 size={size} className="animate-spin" style={{ color }} />;
}

function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "var(--color-navy-50)" }}
      >
        <Icon size={28} strokeWidth={1.75} style={{ color: "var(--color-navy-700)" }} />
      </div>
      <h3 className="rwa-heading text-lg font-semibold mb-1.5">{title}</h3>
      <p className="text-sm max-w-sm" style={{ color: "var(--color-text-secondary)" }}>{body}</p>
      {action}
    </div>
  );
}

function Modal({ open, onClose, title, subtitle, children, footer, width = "max-w-md" }) {
  const panelRef = useDialog(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div
        className="absolute inset-0"
        style={{ background: "rgba(20, 33, 61, 0.45)" }}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        className={`relative w-full ${width} bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl rwa-animate-in max-h-[92vh] sm:max-h-[90vh] flex flex-col outline-none`}
      >
        <div className="flex items-start justify-between px-6 pt-5 pb-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <div>
            <h2 className="rwa-heading text-lg font-semibold">{title}</h2>
            {subtitle && <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{subtitle}</p>}
          </div>
          <button
            aria-label="Close"
            className="rwa-focus w-9 h-9 -mr-1.5 -mt-1 rounded-full flex items-center justify-center shrink-0"
            style={{ color: "var(--color-text-secondary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F1F2F6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto rwa-scrollbar">{children}</div>
        {footer && <div className="px-6 py-4 flex items-center justify-end gap-3" style={{ borderTop: "1px solid var(--color-border)" }}>{footer}</div>}
      </div>
    </div>
  );
}

function Field({ label, children, hint, error }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold mb-1.5">{label}</label>
      {children}
      {hint && !error && <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>{hint}</p>}
      {error && <p className="text-xs mt-1 font-medium" style={{ color: "var(--color-danger)" }}>{error}</p>}
    </div>
  );
}

const inputStyle = {
  border: "1px solid var(--color-border)",
  background: "#fff",
};

function TextInput(props) {
  return (
    <input
      className="rwa-focus w-full rounded-lg px-3.5 py-2.5 text-sm"
      style={inputStyle}
      {...props}
    />
  );
}

/* ============================================================================
   TOASTS
   ============================================================================ */

function ToastStack({ toasts, onDismiss }) {
  return (
    <div aria-live="polite" className="fixed top-4 right-4 left-4 sm:left-auto z-[200] flex flex-col gap-2.5 sm:w-[340px]">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="rwa-toast rounded-xl bg-white shadow-lg px-4 py-3.5 flex items-start gap-3"
          style={{ border: "1px solid var(--color-border)" }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: t.tone === "danger" ? "var(--color-danger-bg)" : "var(--color-success-bg)",
              color: t.tone === "danger" ? "var(--color-danger)" : "var(--color-success)",
            }}
          >
            {t.tone === "danger" ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-snug">{t.title}</p>
            {t.body && <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{t.body}</p>}
          </div>
          <button onClick={() => onDismiss(t.id)} aria-label="Dismiss notification" className="rwa-focus shrink-0 -mr-1.5 -mt-1 w-7 h-7 rounded-full flex items-center justify-center" style={{ color: "var(--color-text-tertiary)" }}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ============================================================================
   LOGIN SCREEN
   ============================================================================ */

function LoginScreen({ onLogin, pushToast }) {
  const [step, setStep] = useState("phone"); // phone | otp
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(30);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (step !== "otp") return;
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, timer]);

  const phoneDigits = phone.replace(/\D/g, "") || "98450 12345";

  const handleSendOtp = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      setTimer(30);
      pushToast({ title: "OTP sent", body: `A 6-digit code was sent to +91 ${phoneDigits}`, tone: "success" });
    }, 700);
  };

  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleVerify = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 700);
  };

  return (
    <div className="min-h-screen w-full flex" style={{ background: "var(--color-bg)" }}>
      {/* Left brand panel */}
      <div
        className="hidden lg:flex lg:w-[42%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(155deg, var(--color-navy-900), var(--color-navy-700))" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--color-marigold-500)" }}>
            <Building2 size={19} style={{ color: "var(--color-navy-900)" }} />
          </div>
          <span className="rwa-heading text-white font-semibold text-lg">RUhome</span>
        </div>

        <div className="relative z-10">
          <h1 className="rwa-heading text-white text-4xl font-bold leading-tight mb-4">
            Everything about<br />your home,<br />one sign-in away.
          </h1>
          <p className="text-sm max-w-sm" style={{ color: "rgba(255,255,255,0.68)" }}>
            Visitors, parking, bills, bookings and requests for RUhome —
            all in one resident portal.
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-3">
          {[
            { icon: UserPlus, text: "Invite a visitor in under a minute" },
            { icon: Wallet, text: "Pay maintenance and utility bills online" },
            { icon: ShieldAlert, text: "One-tap SOS reaches guards instantly" },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.1)" }}>
                <f.icon size={15} style={{ color: "var(--color-marigold-500)" }} />
              </div>
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.82)" }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* decorative faint grid */}
        <svg className="absolute -bottom-24 -right-24 opacity-[0.07]" width="420" height="420" viewBox="0 0 420 420">
          {Array.from({ length: 9 }).map((_, r) =>
            Array.from({ length: 9 }).map((_, c) => (
              <rect key={`${r}-${c}`} x={c * 46} y={r * 46} width="38" height="38" rx="8" fill="white" />
            ))
          )}
        </svg>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[380px]">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--color-navy-800)" }}>
              <Building2 size={19} style={{ color: "#fff" }} />
            </div>
            <span className="rwa-heading font-semibold text-lg">RUhome</span>
          </div>

          {step === "phone" ? (
            <form onSubmit={handleSendOtp} key="phone-step">
              <h2 className="rwa-heading text-2xl font-bold mb-1.5">Resident sign in</h2>
              <p className="text-sm mb-7" style={{ color: "var(--color-text-secondary)" }}>
                Enter your registered mobile number to receive a one-time code.
              </p>
              <Field label="Mobile number">
                <div className="flex gap-2">
                  <div
                    className="rounded-lg px-3.5 py-2.5 text-sm font-medium flex items-center"
                    style={{ ...inputStyle, color: "var(--color-text-secondary)" }}
                  >
                    +91
                  </div>
                  <TextInput
                    type="tel"
                    inputMode="numeric"
                    placeholder="98450 12345"
                    value={phone}
                    maxLength={10}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    autoFocus
                  />
                </div>
              </Field>
              <Button type="submit" variant="primary" size="lg" className="w-full mt-2" disabled={loading}>
                {loading ? <Spinner size={16} color="#fff" /> : "Send OTP"}
              </Button>
              <p className="text-xs text-center mt-4" style={{ color: "var(--color-text-tertiary)" }}>
                This is a resident sign-in only. Security and admin teams use separate apps.
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerify} key="otp-step">
              <button
                type="button"
                onClick={() => { setStep("phone"); setError(""); setOtp(["", "", "", "", "", ""]); }}
                className="rwa-focus inline-flex items-center gap-1 text-sm font-medium mb-5"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <ChevronLeft size={16} /> Back
              </button>
              <h2 className="rwa-heading text-2xl font-bold mb-1.5">Enter the code</h2>
              <p className="text-sm mb-7" style={{ color: "var(--color-text-secondary)" }}>
                We sent a 6-digit OTP to <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>+91 {phoneDigits}</span>
              </p>
              <div className="flex gap-2 mb-2">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    value={d}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    inputMode="numeric"
                    maxLength={1}
                    autoFocus={i === 0}
                    className="rwa-focus w-full h-12 text-center text-lg font-semibold rounded-lg"
                    style={inputStyle}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between mb-6 mt-3">
                <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Demo: enter any 6 digits</span>
                <button
                  type="button"
                  disabled={timer > 0}
                  onClick={() => { setTimer(30); pushToast({ title: "OTP resent", tone: "success" }); }}
                  className="rwa-focus text-xs font-semibold disabled:opacity-40"
                  style={{ color: "var(--color-navy-700)" }}
                >
                  {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
                </button>
              </div>
              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
                {loading ? <Spinner size={16} color="#fff" /> : "Verify & Continue"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   SIDEBAR
   ============================================================================ */

function SidebarContent({ route, onNavigate, collapsed }) {
  return (
    <div className="flex flex-col h-full">
      <div className={`flex items-center gap-2.5 px-4 h-16 shrink-0 ${collapsed ? "justify-center px-0" : ""}`}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--color-marigold-500)" }}>
          <Building2 size={18} style={{ color: "var(--color-navy-900)" }} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="rwa-heading text-white font-semibold text-sm leading-tight truncate">RUhome</p>
            <p className="text-[11px] leading-tight" style={{ color: "rgba(255,255,255,0.5)" }}>Resident Portal</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto rwa-scrollbar px-3 py-3 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = route === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              title={collapsed ? item.label : undefined}
              className={`rwa-focus w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${collapsed ? "justify-center" : ""}`}
              style={{
                background: active ? "rgba(242,169,59,0.14)" : "transparent",
                color: active ? "var(--color-marigold-500)" : "rgba(255,255,255,0.72)",
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <item.icon size={18} strokeWidth={2} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="p-3 mt-auto">
          <div className="rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldAlert size={15} style={{ color: "var(--color-marigold-500)" }} />
              <span className="text-xs font-semibold text-white">Need urgent help?</span>
            </div>
            <p className="text-[11px] leading-snug" style={{ color: "rgba(255,255,255,0.55)" }}>
              Use the SOS button in the top bar to alert guards immediately.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Sidebar({ route, onNavigate, collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const mobileRef = useDialog(mobileOpen, onCloseMobile);
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 h-screen sticky top-0 transition-[width] duration-200 ${collapsed ? "w-[76px]" : "w-64"}`}
        style={{ background: "var(--color-navy-900)" }}
      >
        <SidebarContent route={route} onNavigate={onNavigate} collapsed={collapsed} />
        <button
          onClick={onToggleCollapse}
          className="rwa-focus absolute -right-3 top-16 w-6 h-6 rounded-full flex items-center justify-center shadow"
          style={{ background: "#fff", border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[90] flex">
          <div className="absolute inset-0" style={{ background: "rgba(20,33,61,0.5)" }} onClick={onCloseMobile} />
          <div ref={mobileRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Navigation" className="relative w-72 max-w-[85vw] h-full rwa-drawer-in outline-none" style={{ background: "var(--color-navy-900)" }}>
            <button
              onClick={onCloseMobile}
              aria-label="Close navigation"
              className="rwa-focus absolute top-3.5 right-3 w-9 h-9 rounded-full flex items-center justify-center z-10"
              style={{ color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.08)" }}
            >
              <X size={16} />
            </button>
            <SidebarContent route={route} onNavigate={(k) => { onNavigate(k); onCloseMobile(); }} collapsed={false} />
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================================================
   NOTIFICATIONS PANEL
   ============================================================================ */

function NotificationsPanel({ open, onClose, notifications, onMarkRead, onMarkAllRead }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-[95]" onClick={onClose} />
      <div
        className="absolute right-0 top-14 w-[360px] max-h-[70vh] bg-white rounded-2xl shadow-2xl z-[96] rwa-animate-in flex flex-col overflow-hidden"
        style={{ border: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <h3 className="rwa-heading font-semibold text-sm">Notifications</h3>
          <button onClick={onMarkAllRead} className="rwa-focus text-xs font-semibold" style={{ color: "var(--color-navy-700)" }}>
            Mark all as read
          </button>
        </div>
        <div className="overflow-y-auto rwa-scrollbar flex-1">
          {notifications.length === 0 ? (
            <EmptyState icon={Bell} title="You're all caught up" body="New notifications will show up here." />
          ) : (
            notifications.map((n) => {
              const Icon = NOTIF_ICON[n.type] || Bell;
              return (
                <button
                  key={n.id}
                  onClick={() => onMarkRead(n.id)}
                  className="rwa-focus w-full text-left flex items-start gap-3 px-4 py-3.5"
                  style={{ borderBottom: "1px solid var(--color-border)", background: n.read ? "#fff" : "var(--color-navy-50)" }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "#fff", border: "1px solid var(--color-border)", color: "var(--color-navy-700)" }}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-snug">{n.title}</p>
                    <p className="text-xs mt-0.5 leading-snug" style={{ color: "var(--color-text-secondary)" }}>{n.body}</p>
                    <p className="text-[11px] mt-1" style={{ color: "var(--color-text-tertiary)" }}>{n.time}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: "var(--color-marigold-500)" }} />}
                </button>
              );
            })
          )}
        </div>
        <div className="px-4 py-3 text-center" style={{ borderTop: "1px solid var(--color-border)" }}>
          <span className="text-xs font-semibold" style={{ color: "var(--color-text-tertiary)" }}>
            Full notification centre coming in a later phase
          </span>
        </div>
      </div>
    </>
  );
}

/* ============================================================================
   USER MENU
   ============================================================================ */

function UserMenu({ open, onClose, onNavigate, onLogout }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-[95]" onClick={onClose} />
      <div
        className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-2xl z-[96] rwa-animate-in overflow-hidden"
        style={{ border: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <Avatar initials={RESIDENT.initials} size={40} />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{RESIDENT.name}</p>
            <p className="text-xs truncate" style={{ color: "var(--color-text-secondary)" }}>{RESIDENT.flat}</p>
          </div>
        </div>
        <div className="py-1.5">
          {[
            { icon: User, label: "My profile", action: () => onNavigate("profile") },
            { icon: Settings, label: "Notification preferences", action: () => onNavigate("profile") },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => { item.action(); onClose(); }}
              className="rwa-focus w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium"
              style={{ color: "var(--color-text-primary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <item.icon size={16} style={{ color: "var(--color-text-secondary)" }} />
              {item.label}
            </button>
          ))}
        </div>
        <div className="py-1.5" style={{ borderTop: "1px solid var(--color-border)" }}>
          <button
            onClick={onLogout}
            className="rwa-focus w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold"
            style={{ color: "var(--color-danger)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-danger-bg)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </div>
    </>
  );
}

/* ============================================================================
   TOP BAR
   ============================================================================ */

function TopBar({ onOpenMobileNav, onOpenNotifications, notifOpen, unreadCount, onOpenUserMenu, userMenuOpen, onOpenSos, notifPanel, userMenu }) {
  return (
    <header
      className="sticky top-0 z-[80] h-16 flex items-center gap-3 px-4 md:px-6 shrink-0"
      style={{ background: "#fff", borderBottom: "1px solid var(--color-border)" }}
    >
      <button
        onClick={onOpenMobileNav}
        className="rwa-focus md:hidden w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ color: "var(--color-text-secondary)" }}
      >
        <Menu size={20} />
      </button>

      <div className="hidden sm:flex items-center gap-2 min-w-0">
        <Building2 size={16} style={{ color: "var(--color-text-tertiary)" }} />
        <span className="text-sm font-semibold truncate" style={{ color: "var(--color-text-secondary)" }}>
          {RESIDENT.community}
        </span>
      </div>

      <div className="hidden md:flex items-center flex-1 max-w-md ml-4">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }} />
          <input
            placeholder="Search visitors, bills, requests…"
            className="rwa-focus w-full rounded-lg pl-9 pr-3 py-2 text-sm"
            style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}
            disabled
          />
        </div>
      </div>

      <div className="flex-1 md:hidden" />

      <div className="flex items-center gap-1.5 ml-auto">
        <Button variant="danger" size="sm" icon={ShieldAlert} onClick={onOpenSos} className="rwa-sos-pulse rounded-full !px-4">
          SOS
        </Button>

        <div className="relative">
          <IconButton icon={Bell} label="Notifications" active={notifOpen} badge={unreadCount || null} onClick={onOpenNotifications} />
          {notifPanel}
        </div>

        <div className="relative ml-1">
          <button onClick={onOpenUserMenu} className="rwa-focus flex items-center gap-2 pl-1 pr-2 py-1 rounded-full" style={{ background: userMenuOpen ? "var(--color-navy-50)" : "transparent" }}>
            <Avatar initials={RESIDENT.initials} size={32} />
            <ChevronDown size={14} className="hidden sm:block" style={{ color: "var(--color-text-tertiary)" }} />
          </button>
          {userMenu}
        </div>
      </div>
    </header>
  );
}

/* ============================================================================
   SOS FLOW
   ============================================================================ */

function SosModal({ stage, onClose, onConfirm }) {
  if (stage === "closed") return null;
  return (
    <Modal
      open
      onClose={onClose}
      title={stage === "confirm" ? "Trigger emergency SOS?" : "SOS alert sent"}
      width="max-w-sm"
      footer={
        stage === "confirm" ? (
          <>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="danger" icon={ShieldAlert} onClick={onConfirm}>Yes, alert guards now</Button>
          </>
        ) : (
          <Button variant="primary" className="w-full" onClick={onClose}>Done</Button>
        )
      }
    >
      {stage === "confirm" ? (
        <div className="text-center py-2">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--color-danger-bg)" }}>
            <ShieldAlert size={28} style={{ color: "var(--color-danger)" }} />
          </div>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            This will immediately notify security guards and the RWA that flat{" "}
            <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>{RESIDENT.flat}</span> needs urgent help.
            Only use this in a genuine emergency.
          </p>
        </div>
      ) : (
        <div className="text-center py-2">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--color-success-bg)" }}>
            <CheckCircle2 size={28} style={{ color: "var(--color-success)" }} />
          </div>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Guards on duty and the RWA have been alerted with your flat number and location.
            Someone will reach you shortly.
          </p>
        </div>
      )}
    </Modal>
  );
}

/* ============================================================================
   INVITE VISITOR MODAL
   ============================================================================ */

function InviteVisitorModal({ open, onClose, pushToast }) {
  const [step, setStep] = useState("form"); // form | pass
  const [form, setForm] = useState({ name: "", phone: "", purpose: "Personal visit", date: "", time: "" });
  const passId = useMemo(() => "VP-" + Math.random().toString(36).slice(2, 8).toUpperCase(), [open]);
  const grid = useMemo(() => qrGrid(passId), [passId]);

  const reset = () => { setStep("form"); setForm({ name: "", phone: "", purpose: "Personal visit", date: "", time: "" }); };

  const handleClose = () => { onClose(); setTimeout(reset, 200); };

  const handleGenerate = (e) => {
    e.preventDefault();
    setStep("pass");
  };

  const handleDone = () => {
    pushToast({ title: "Visitor invited", body: `${form.name || "Your guest"} will receive the pass via SMS/WhatsApp.`, tone: "success" });
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={step === "form" ? "Invite a visitor" : "Visitor pass ready"}
      subtitle={step === "form" ? "Share a QR + OTP pass with your guest." : "Share this pass with your visitor."}
      footer={
        step === "form" ? (
          <>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" icon={QrCode} onClick={handleGenerate} type="submit" form="invite-form">Generate pass</Button>
          </>
        ) : (
          <>
            <Button variant="secondary" icon={Download}>Download</Button>
            <Button variant="primary" onClick={handleDone}>Done</Button>
          </>
        )
      }
    >
      {step === "form" ? (
        <form id="invite-form" onSubmit={handleGenerate}>
          <Field label="Visitor name">
            <TextInput placeholder="e.g. Rohit Sharma" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Visitor phone number" hint="Pass & OTP will be sent here via SMS/WhatsApp">
            <div className="flex gap-2">
              <div className="rounded-lg px-3 py-2.5 text-sm font-medium flex items-center" style={{ ...inputStyle, color: "var(--color-text-secondary)" }}>+91</div>
              <TextInput placeholder="98450 12345" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </Field>
          <Field label="Purpose of visit">
            <select
              className="rwa-focus w-full rounded-lg px-3.5 py-2.5 text-sm bg-white"
              style={inputStyle}
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            >
              <option>Personal visit</option>
              <option>Delivery</option>
              <option>Cab / Taxi</option>
              <option>Service / Repair</option>
              <option>Other</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Expected date">
              <TextInput type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Field>
            <Field label="Expected time">
              <TextInput type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </Field>
          </div>
        </form>
      ) : (
        <div className="flex flex-col items-center text-center">
          <div className="p-3 rounded-2xl mb-4" style={{ border: "1px solid var(--color-border)" }}>
            <svg width="160" height="160" viewBox="0 0 170 170">
              {grid.map((row, r) => row.map((on, c) => on ? (
                <rect key={`${r}-${c}`} x={c * 10} y={r * 10} width="10" height="10" fill="var(--color-navy-900)" />
              ) : null))}
            </svg>
          </div>
          <p className="font-semibold text-sm">{form.name || "Guest"}</p>
          <p className="text-xs mb-3" style={{ color: "var(--color-text-secondary)" }}>{form.purpose} · {form.date || "Today"} {form.time && `· ${form.time}`}</p>
          <Badge tone="info">{passId}</Badge>
          <p className="text-xs mt-4 max-w-xs" style={{ color: "var(--color-text-tertiary)" }}>
            This QR + OTP has been sent to +91 {form.phone || "•••••• ••••"} via SMS/WhatsApp. Guards will scan it at the gate.
          </p>
        </div>
      )}
    </Modal>
  );
}

/* ============================================================================
   PAY NOW MODAL
   ============================================================================ */

function PayNowModal({ open, onClose, pushToast, bill, onPaid }) {
  const activeBill = bill || OUTSTANDING_BILL;
  const [stage, setStage] = useState("review"); // review | processing | success
  const receiptId = useMemo(() => "RCPT-" + Math.random().toString(36).slice(2, 8).toUpperCase(), [open]);

  const handleClose = () => { onClose(); setTimeout(() => setStage("review"), 250); };

  const handlePay = () => {
    setStage("processing");
    setTimeout(() => {
      setStage("success");
      pushToast({ title: "Payment successful", body: `${formatINR(activeBill.amount)} paid for ${activeBill.label}`, tone: "success" });
      onPaid && onPaid(activeBill);
    }, 1400);
  };

  return (
    <Modal
      open={open}
      onClose={stage === "processing" ? () => {} : handleClose}
      title={stage === "success" ? "Payment successful" : "Pay bill"}
      width="max-w-sm"
      footer={
        stage === "review" ? (
          <>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button variant="accent" icon={Wallet} onClick={handlePay}>Pay {formatINR(activeBill.amount)}</Button>
          </>
        ) : stage === "success" ? (
          <>
            <Button variant="secondary" icon={Download}>Receipt</Button>
            <Button variant="primary" className="flex-1" onClick={handleClose}>Done</Button>
          </>
        ) : null
      }
    >
      {stage === "review" && (
        <div>
          <div className="rounded-xl p-4 mb-4" style={{ background: "var(--color-bg)" }}>
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: "var(--color-text-secondary)" }}>Bill</span>
              <span className="font-medium">{activeBill.label}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: "var(--color-text-secondary)" }}>Flat</span>
              <span className="font-medium">{RESIDENT.flat.split(",")[0]}</span>
            </div>
            <div className="flex justify-between text-sm mb-3">
              <span style={{ color: "var(--color-text-secondary)" }}>Due date</span>
              <span className="font-medium">{activeBill.dueDate}</span>
            </div>
            <div className="flex justify-between items-center pt-3" style={{ borderTop: "1px dashed var(--color-border)" }}>
              <span className="text-sm font-semibold">Amount payable</span>
              <span className="rwa-heading text-xl font-bold">{formatINR(activeBill.amount)}</span>
            </div>
          </div>
          <Field label="Payment method">
            <div className="flex items-center gap-2 rounded-lg px-3.5 py-2.5" style={inputStyle}>
              <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "var(--color-navy-50)" }}>
                <Wallet size={13} style={{ color: "var(--color-navy-700)" }} />
              </div>
              <span className="text-sm font-medium flex-1">UPI / Cards / Netbanking</span>
              <CircleCheck size={16} style={{ color: "var(--color-success)" }} />
            </div>
          </Field>
          <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>This is a simulated payment for prototype purposes — no real transaction occurs.</p>
        </div>
      )}
      {stage === "processing" && (
        <div className="flex flex-col items-center text-center py-8">
          <Spinner size={32} color="var(--color-navy-700)" />
          <p className="text-sm font-medium mt-4">Processing your payment…</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>Please don't close this window</p>
        </div>
      )}
      {stage === "success" && (
        <div className="flex flex-col items-center text-center py-2">
          <div className="w-16 h-16 rounded-full mb-4 flex items-center justify-center" style={{ background: "var(--color-success-bg)" }}>
            <CheckCircle2 size={30} style={{ color: "var(--color-success)" }} />
          </div>
          <p className="rwa-heading text-2xl font-bold">{formatINR(activeBill.amount)}</p>
          <p className="text-sm mt-1 mb-4" style={{ color: "var(--color-text-secondary)" }}>{activeBill.label}</p>
          <div className="w-full rounded-xl p-3.5 flex justify-between text-sm" style={{ background: "var(--color-bg)" }}>
            <span style={{ color: "var(--color-text-secondary)" }}>Receipt no.</span>
            <span className="font-semibold">{receiptId}</span>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ============================================================================
   SHARED PAGE UI — Tabs
   ============================================================================ */

function Tabs({ tabs, active, onChange }) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-xl mb-5" style={{ background: "var(--color-navy-50)" }}>
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className="rwa-focus px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors"
          style={{
            background: active === t.key ? "#fff" : "transparent",
            color: active === t.key ? "var(--color-navy-900)" : "var(--color-text-secondary)",
            boxShadow: active === t.key ? "0 1px 2px rgba(20,33,61,0.08)" : "none",
          }}
        >
          {t.label}{t.count != null ? ` (${t.count})` : ""}
        </button>
      ))}
    </div>
  );
}

function PageHeader({ title, blurb, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="rwa-heading text-2xl font-bold">{title}</h1>
        {blurb && <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>{blurb}</p>}
      </div>
      {action}
    </div>
  );
}

/* ============================================================================
   DASHBOARD (PHASE 2)
   ============================================================================ */

function SectionHeader({ title, actionLabel, onAction, icon: Icon }) {
  return (
    <div className="flex items-center justify-between mb-3.5">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} style={{ color: "var(--color-text-tertiary)" }} />}
        <h3 className="rwa-heading font-semibold text-[15px]">{title}</h3>
      </div>
      {actionLabel && (
        <button onClick={onAction} className="rwa-focus text-xs font-semibold inline-flex items-center gap-1" style={{ color: "var(--color-navy-700)" }}>
          {actionLabel} <ChevronRight size={13} />
        </button>
      )}
    </div>
  );
}

function Dashboard({ onNavigate, onInvite, onPayNow, onOpenSos }) {
  return (
    <div className="max-w-[1180px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="rwa-heading text-2xl font-bold">{greeting()}, {RESIDENT.name.split(" ")[0]}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
            Here's what's happening at {RESIDENT.community} today.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button variant="secondary" icon={UserPlus} onClick={onInvite}>Invite visitor</Button>
          <Button variant="secondary" icon={Wrench} onClick={() => onNavigate("requests")}>Raise request</Button>
          <Button variant="accent" icon={ShieldAlert} onClick={onOpenSos}>SOS</Button>
        </div>
      </div>

      {/* Top stat row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Card className="!p-4" onClick={() => onNavigate("visitors")}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-tertiary)", letterSpacing: "0.02em" }}>Today's visitors</span>
            <UserPlus size={15} style={{ color: "var(--color-navy-700)" }} />
          </div>
          <p className="rwa-heading text-2xl font-bold">{TODAY_VISITORS.length}</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>1 checked in · 1 expected</p>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold" style={{ color: "var(--color-text-tertiary)" }}>Outstanding payment</span>
            <Wallet size={15} style={{ color: "var(--color-navy-700)" }} />
          </div>
          <p className="rwa-heading text-2xl font-bold">{formatINR(OUTSTANDING_BILL.amount)}</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-warning)" }}>Due {OUTSTANDING_BILL.dueDate}</p>
        </Card>
        <Card className="!p-4" onClick={() => onNavigate("amenities")}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold" style={{ color: "var(--color-text-tertiary)" }}>Upcoming booking</span>
            <CalendarCheck size={15} style={{ color: "var(--color-navy-700)" }} />
          </div>
          <p className="text-sm font-bold leading-snug">{UPCOMING_AMENITY.name}</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>{UPCOMING_AMENITY.date}</p>
        </Card>
        <Card className="!p-4" onClick={() => onNavigate("requests")}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold" style={{ color: "var(--color-text-tertiary)" }}>Open requests</span>
            <Wrench size={15} style={{ color: "var(--color-navy-700)" }} />
          </div>
          <p className="rwa-heading text-2xl font-bold">{OPEN_REQUESTS.length}</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>1 in progress · 1 open</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="xl:col-span-2 flex flex-col gap-5">
          {/* Today's visitors */}
          <Card>
            <SectionHeader title="Today's visitors" icon={UserPlus} actionLabel="View all" onAction={() => onNavigate("visitors")} />
            <div className="flex flex-col divide-y" style={{ borderColor: "var(--color-border)" }}>
              {TODAY_VISITORS.map((v) => (
                <div key={v.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0" style={{ borderColor: "var(--color-border)" }}>
                  <Avatar initials={v.name.split(" ").map((s) => s[0]).slice(0, 2).join("")} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{v.name}</p>
                    <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{v.purpose} · {v.time}</p>
                  </div>
                  <StatusBadge status={v.status} />
                </div>
              ))}
            </div>
            <button
              onClick={onInvite}
              className="rwa-focus w-full mt-4 rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
              style={{ border: "1px dashed var(--color-border)", color: "var(--color-navy-700)" }}
            >
              <Plus size={15} /> Invite a new visitor
            </button>
          </Card>

          {/* Open service requests */}
          <Card>
            <SectionHeader title="Open service requests" icon={Wrench} actionLabel="View all" onAction={() => onNavigate("requests")} />
            <div className="flex flex-col divide-y" style={{ borderColor: "var(--color-border)" }}>
              {OPEN_REQUESTS.map((r) => (
                <div key={r.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--color-navy-50)" }}>
                    <Wrench size={15} style={{ color: "var(--color-navy-700)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{r.title}</p>
                    <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{r.id} · {r.category} · raised {r.raisedOn}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          </Card>

          {/* Announcements */}
          <Card>
            <SectionHeader title="Community announcements" icon={Megaphone} />
            <div className="flex flex-col divide-y" style={{ borderColor: "var(--color-border)" }}>
              {ANNOUNCEMENTS.map((a) => (
                <div key={a.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-semibold">{a.title}</p>
                    <span className="text-[11px] shrink-0 ml-2" style={{ color: "var(--color-text-tertiary)" }}>{a.date}</span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{a.body}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Outstanding payment card */}
          <Card className="relative overflow-hidden" style={{ background: "linear-gradient(150deg, var(--color-navy-900), var(--color-navy-700))", border: "none" }}>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Receipt size={15} style={{ color: "var(--color-marigold-500)" }} />
                <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>Outstanding payment</span>
              </div>
              <p className="rwa-heading text-3xl font-bold text-white mb-1">{formatINR(OUTSTANDING_BILL.amount)}</p>
              <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.6)" }}>{OUTSTANDING_BILL.label} · due {OUTSTANDING_BILL.dueDate}</p>
              <Button variant="accent" className="w-full" onClick={onPayNow}>Pay now</Button>
            </div>
            <svg className="absolute -bottom-10 -right-10 opacity-[0.08]" width="160" height="160" viewBox="0 0 160 160">
              {Array.from({ length: 4 }).map((_, r) => Array.from({ length: 4 }).map((_, c) => (
                <rect key={`${r}-${c}`} x={c * 42} y={r * 42} width="34" height="34" rx="8" fill="white" />
              )))}
            </svg>
          </Card>

          {/* Upcoming amenity */}
          <Card>
            <SectionHeader title="Upcoming amenity booking" icon={CalendarCheck} />
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0" style={{ background: "var(--color-marigold-50)" }}>
                <span className="text-[10px] font-bold uppercase" style={{ color: "var(--color-marigold-600)" }}>SEP</span>
                <span className="text-sm font-bold leading-none" style={{ color: "var(--color-navy-900)" }}>6</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{UPCOMING_AMENITY.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{UPCOMING_AMENITY.date}</p>
                <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{UPCOMING_AMENITY.time}</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" className="w-full mt-4" onClick={() => onNavigate("amenities")}>
              Manage bookings
            </Button>
          </Card>

          {/* Quick actions */}
          <Card>
            <SectionHeader title="Quick actions" />
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { icon: UserPlus, label: "Invite visitor", action: onInvite },
                { icon: Wallet, label: "Pay bills", action: onPayNow },
                { icon: CalendarCheck, label: "Book amenity", action: () => onNavigate("amenities") },
                { icon: Wrench, label: "New request", action: () => onNavigate("requests") },
                { icon: Briefcase, label: "Book staff", action: () => onNavigate("services") },
                { icon: ShoppingBag, label: "Marketplace", action: () => onNavigate("marketplace") },
              ].map((qa, i) => (
                <button
                  key={i}
                  onClick={qa.action}
                  className="rwa-focus flex flex-col items-start gap-2 rounded-xl p-3 text-left"
                  style={{ border: "1px solid var(--color-border)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-bg)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--color-navy-50)" }}>
                    <qa.icon size={15} style={{ color: "var(--color-navy-700)" }} />
                  </div>
                  <span className="text-xs font-semibold leading-tight">{qa.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   VISITORS PAGE
   ============================================================================ */

function VisitorRow({ v, dateLabel, onCancel }) {
  return (
    <div className="flex items-center gap-3 py-3.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
      <Avatar initials={v.name.split(" ").map((s) => s[0]).slice(0, 2).join("")} size={38} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{v.name}</p>
        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
          {v.purpose} · {dateLabel ? `${dateLabel}, ` : ""}{v.time}
        </p>
      </div>
      <StatusBadge status={v.status} />
      {(v.status === "Expected") && (
        <button
          onClick={() => onCancel(v)}
          className="rwa-focus text-xs font-semibold ml-1"
          style={{ color: "var(--color-danger)" }}
        >
          Cancel
        </button>
      )}
    </div>
  );
}

function VisitorsPage({ onInvite, pushToast }) {
  const [tab, setTab] = useState("today");
  const [today, setToday] = useState(TODAY_VISITORS);
  const [upcoming, setUpcoming] = useState(UPCOMING_VISITORS);

  const cancelVisitor = (v) => {
    setUpcoming((prev) => prev.filter((x) => x.id !== v.id));
    setToday((prev) => prev.filter((x) => x.id !== v.id));
    pushToast({ title: "Invitation cancelled", body: `${v.name}'s pass has been revoked.`, tone: "danger" });
  };

  const tabs = [
    { key: "today", label: "Today", count: today.length },
    { key: "upcoming", label: "Upcoming", count: upcoming.length },
    { key: "history", label: "History", count: VISITOR_HISTORY.length },
  ];

  return (
    <div className="max-w-[900px] mx-auto">
      <PageHeader
        title="Visitors"
        blurb="Invite guests, share QR passes and track every check-in."
        action={<Button variant="primary" icon={UserPlus} onClick={onInvite}>Invite visitor</Button>}
      />
      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      <Card>
        {tab === "today" && (
          today.length ? (
            <div>{today.map((v) => <VisitorRow key={v.id} v={v} onCancel={cancelVisitor} />)}</div>
          ) : (
            <EmptyState icon={UserPlus} title="No visitors today" body="Invited guests for today will show up here." action={<Button variant="primary" className="mt-4" onClick={onInvite}>Invite a visitor</Button>} />
          )
        )}
        {tab === "upcoming" && (
          upcoming.length ? (
            <div>{upcoming.map((v) => <VisitorRow key={v.id} v={v} dateLabel={v.date} onCancel={cancelVisitor} />)}</div>
          ) : (
            <EmptyState icon={CalendarCheck} title="No upcoming invitations" body="Invitations for future dates will appear here." />
          )
        )}
        {tab === "history" && (
          <div>{VISITOR_HISTORY.map((v) => <VisitorRow key={v.id} v={v} dateLabel={v.date} onCancel={() => {}} />)}</div>
        )}
      </Card>
    </div>
  );
}

/* ============================================================================
   PARKING PAGE
   ============================================================================ */

function ParkingPage() {
  const { assigned, visitorSlots, visitorAllocations } = PARKING;
  const pct = Math.round((visitorSlots.occupied / visitorSlots.total) * 100);
  return (
    <div className="max-w-[900px] mx-auto">
      <PageHeader title="Parking" blurb="Your assigned bay and visitor parking allocation." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <Card>
          <SectionHeader title="Your assigned parking" icon={Car} />
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "var(--color-navy-50)" }}>
              <ParkingSquare size={24} style={{ color: "var(--color-navy-700)" }} />
            </div>
            <div>
              <p className="rwa-heading text-xl font-bold">{assigned.slot}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{assigned.level}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
            <Fuel size={14} style={{ color: "var(--color-text-tertiary)" }} />
            <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Registered vehicle: <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>{assigned.vehicle}</span></span>
          </div>
        </Card>
        <Card>
          <SectionHeader title="Visitor parking availability" icon={ParkingSquare} />
          <div className="flex items-end justify-between mb-2">
            <p className="rwa-heading text-2xl font-bold">{visitorSlots.available} <span className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>of {visitorSlots.total} free</span></p>
            <Badge tone={pct > 80 ? "danger" : pct > 50 ? "warning" : "success"}>{pct}% occupied</Badge>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct > 80 ? "var(--color-danger)" : "var(--color-marigold-500)" }} />
          </div>
          <p className="text-xs mt-3" style={{ color: "var(--color-text-tertiary)" }}>Updated live from gate sensors as visitors check in and out.</p>
        </Card>
      </div>
      <Card>
        <SectionHeader title="Today's visitor allocations" icon={UserPlus} />
        {visitorAllocations.length ? (
          <div className="flex flex-col divide-y" style={{ borderColor: "var(--color-border)" }}>
            {visitorAllocations.map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--color-marigold-50)" }}>
                  <Car size={15} style={{ color: "var(--color-marigold-600)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{a.visitor}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Slot {a.slot} · arriving {a.time}</p>
                </div>
                <Badge tone="info">{a.status}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={Car} title="No visitor slots reserved" body="Slots reserved for your invited guests will appear here." />
        )}
      </Card>
    </div>
  );
}

/* ============================================================================
   KIDS TRACKING PAGE
   ============================================================================ */

function KidsPage() {
  return (
    <div className="max-w-[900px] mx-auto">
      <PageHeader title="Kids Tracking" blurb="Zone-level presence and pickup authorisation for your children." />

      <div
        className="flex items-start gap-3 rounded-xl p-4 mb-5"
        style={{ background: "var(--color-warning-bg)" }}
      >
        <ShieldCheck size={18} style={{ color: "var(--color-warning)" }} className="shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed" style={{ color: "#7A5A05" }}>
          Location is <span className="font-semibold">zone-level, not exact GPS</span> — e.g. "near Tower 3" or "at the clubhouse."
          Accuracy depends on receiver coverage and can be affected by walls or distance. This is a safety aid, not a precise tracker.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {CHILDREN.map((c) => (
          <Card key={c.id}>
            <div className="flex items-center gap-3 mb-4">
              <Avatar initials={c.initials} size={44} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Age {c.age}</p>
              </div>
              <Badge tone={c.statusTone}>{c.zone}</Badge>
            </div>
            <div className="flex items-center gap-2 text-xs mb-2" style={{ color: "var(--color-text-secondary)" }}>
              <MapPinIcon size={13} style={{ color: "var(--color-text-tertiary)" }} />
              {c.lastEvent} · {c.lastEventTime}
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              Tag battery: {c.battery}%
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
                <div className="h-full rounded-full" style={{ width: `${c.battery}%`, background: c.battery < 30 ? "var(--color-danger)" : "var(--color-success)" }} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <SectionHeader title="Recent activity" icon={Clock} />
          <div className="flex flex-col divide-y" style={{ borderColor: "var(--color-border)" }}>
            {KID_EVENTS.map((e) => (
              <div key={e.id} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm font-medium">{e.child} — {e.event}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>{e.time}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionHeader title="Pickup-authorised adults" icon={ShieldCheck} />
          <div className="flex flex-col divide-y" style={{ borderColor: "var(--color-border)" }}>
            {PICKUP_LIST.map((p, i) => (
              <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <Avatar initials={p.name.split(" ").map((s) => s[0]).slice(0, 2).join("")} size={34} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{p.name}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{p.relation} · {p.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================================================================
   AMENITIES PAGE
   ============================================================================ */

const AMENITY_ICONS = { Home: CalendarCheck, Waves: Waves, Dumbbell: Dumbbell, CircleDot: CircleDot };

function BookAmenityModal({ amenity, onClose, pushToast }) {
  const [step, setStep] = useState("form");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  if (!amenity) return null;

  const handleClose = () => { onClose(); setTimeout(() => setStep("form"), 250); };

  return (
    <Modal
      open={!!amenity}
      onClose={handleClose}
      title={step === "form" ? `Book ${amenity.name}` : "Booking confirmed"}
      subtitle={step === "form" ? amenity.rules : undefined}
      width="max-w-sm"
      footer={
        step === "form" ? (
          <>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" icon={CalendarCheck} onClick={() => setStep("confirmed")}>
              {amenity.price ? `Book · ${formatINR(amenity.price)}` : "Confirm booking"}
            </Button>
          </>
        ) : (
          <Button variant="primary" className="w-full" onClick={() => { pushToast({ title: "Booking confirmed", body: `${amenity.name} on ${date || "your selected date"}`, tone: "success" }); handleClose(); }}>
            Done
          </Button>
        )
      }
    >
      {step === "form" ? (
        <div>
          <div className="grid grid-cols-2 gap-3 mb-1">
            <Field label="Date">
              <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Time slot">
              <TextInput type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </Field>
          </div>
          <div className="flex items-center gap-2 text-xs mt-2" style={{ color: "var(--color-text-tertiary)" }}>
            <Clock size={13} /> Open hours: {amenity.hours} · Capacity: {amenity.capacity}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center py-2">
          <div className="w-16 h-16 rounded-full mb-4 flex items-center justify-center" style={{ background: "var(--color-success-bg)" }}>
            <CheckCircle2 size={28} style={{ color: "var(--color-success)" }} />
          </div>
          <p className="text-sm font-semibold">{amenity.name}</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>{date || "Today"} {time && `· ${time}`}</p>
        </div>
      )}
    </Modal>
  );
}

function AmenitiesPage({ pushToast }) {
  const [bookingAmenity, setBookingAmenity] = useState(null);
  const [bookings, setBookings] = useState(AMENITY_BOOKINGS);

  const cancelBooking = (b) => {
    setBookings((prev) => prev.filter((x) => x.id !== b.id));
    pushToast({ title: "Booking cancelled", body: `${b.amenity} on ${b.date}`, tone: "danger" });
  };

  return (
    <div className="max-w-[1000px] mx-auto">
      <PageHeader title="Amenities" blurb="Browse the clubhouse, gym, pool and courts, and book a slot." />

      <SectionHeader title="Browse amenities" icon={CalendarCheck} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {AMENITIES.map((a) => {
          const Icon = AMENITY_ICONS[a.icon] || CalendarCheck;
          return (
            <Card key={a.id}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--color-navy-50)" }}>
                  <Icon size={20} style={{ color: "var(--color-navy-700)" }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{a.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{a.capacity} · {a.hours}</p>
                </div>
              </div>
              <p className="text-xs mb-4" style={{ color: "var(--color-text-tertiary)" }}>{a.rules}</p>
              <Button variant="secondary" size="sm" className="w-full" icon={CalendarCheck} onClick={() => setBookingAmenity(a)}>
                {a.price ? `Book · ${formatINR(a.price)}` : "Book slot"}
              </Button>
            </Card>
          );
        })}
      </div>

      <SectionHeader title="Your bookings" icon={Clock} />
      <Card>
        {bookings.length ? (
          <div className="flex flex-col divide-y" style={{ borderColor: "var(--color-border)" }}>
            {bookings.map((b) => (
              <div key={b.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--color-marigold-50)" }}>
                  <CalendarCheck size={15} style={{ color: "var(--color-marigold-600)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{b.amenity}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{b.date} · {b.time}</p>
                </div>
                <StatusBadge status={b.status === "Upcoming" ? "Expected" : "Completed"} />
                {b.status === "Upcoming" && (
                  <button onClick={() => cancelBooking(b)} className="rwa-focus text-xs font-semibold ml-1" style={{ color: "var(--color-danger)" }}>Cancel</button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={CalendarCheck} title="No bookings yet" body="Slots you book will show up here." />
        )}
      </Card>

      <BookAmenityModal amenity={bookingAmenity} onClose={() => setBookingAmenity(null)} pushToast={pushToast} />
    </div>
  );
}

/* ============================================================================
   PAYMENTS PAGE
   ============================================================================ */

function BillRow({ bill, onPay }) {
  return (
    <div className="flex items-center gap-3 py-3.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: bill.status === "Due" ? "var(--color-warning-bg)" : "var(--color-success-bg)" }}>
        <Receipt size={15} style={{ color: bill.status === "Due" ? "var(--color-warning)" : "var(--color-success)" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{bill.label}</p>
        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Due {bill.dueDate}</p>
      </div>
      <span className="rwa-heading text-sm font-bold">{formatINR(bill.amount)}</span>
      {bill.status === "Due" ? (
        <Button variant="accent" size="sm" onClick={() => onPay(bill)}>Pay now</Button>
      ) : (
        <Badge tone="success">Paid</Badge>
      )}
    </div>
  );
}

function PaymentsPage({ onPayBill }) {
  const [tab, setTab] = useState("maintenance");
  const dueTotal = [...MAINTENANCE_BILLS, ...UTILITY_BILLS].filter((b) => b.status === "Due").reduce((s, b) => s + b.amount, 0);

  const tabs = [
    { key: "maintenance", label: "Maintenance" },
    { key: "utility", label: "Utility Bills" },
    { key: "history", label: "History" },
  ];

  return (
    <div className="max-w-[900px] mx-auto">
      <PageHeader title="Payments" blurb="Maintenance dues, utility bills, receipts and payment history." />

      <Card className="mb-5" style={{ background: "linear-gradient(150deg, var(--color-navy-900), var(--color-navy-700))", border: "none" }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>Total outstanding</p>
            <p className="rwa-heading text-3xl font-bold text-white mt-1">{formatINR(dueTotal)}</p>
          </div>
          <Button variant="accent" icon={Wallet} onClick={() => onPayBill(MAINTENANCE_BILLS.find((b) => b.status === "Due") || UTILITY_BILLS[0])}>Pay all dues</Button>
        </div>
      </Card>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      <Card>
        {tab === "maintenance" && (
          <div>{MAINTENANCE_BILLS.map((b) => <BillRow key={b.id} bill={b} onPay={onPayBill} />)}</div>
        )}
        {tab === "utility" && (
          <div>{UTILITY_BILLS.map((b) => <BillRow key={b.id} bill={b} onPay={onPayBill} />)}</div>
        )}
        {tab === "history" && (
          <div className="flex flex-col divide-y" style={{ borderColor: "var(--color-border)" }}>
            {PAYMENT_HISTORY.map((r) => (
              <div key={r.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--color-success-bg)" }}>
                  <CheckCircle2 size={15} style={{ color: "var(--color-success)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{r.label}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{r.date} · {r.receiptId}</p>
                </div>
                <span className="text-sm font-bold">{formatINR(r.amount)}</span>
                <button className="rwa-focus" style={{ color: "var(--color-text-tertiary)" }} aria-label="Download receipt">
                  <Download size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ============================================================================
   SERVICE REQUESTS PAGE
   ============================================================================ */

function NewRequestModal({ open, onClose, onCreate }) {
  const [category, setCategory] = useState("Plumbing");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const handleClose = () => { onClose(); setTitle(""); setDescription(""); setCategory("Plumbing"); };
  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Raise a service request"
      subtitle="Tell us what needs attention — we'll route it to the right team."
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" icon={Wrench} onClick={() => { onCreate({ title, category, description }); handleClose(); }}>Submit request</Button>
        </>
      }
    >
      <Field label="Category">
        <select className="rwa-focus w-full rounded-lg px-3.5 py-2.5 text-sm bg-white" style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>Plumbing</option>
          <option>Electrical</option>
          <option>Carpentry</option>
          <option>Housekeeping</option>
          <option>Security</option>
          <option>Other</option>
        </select>
      </Field>
      <Field label="Title">
        <TextInput placeholder="e.g. Kitchen tap leaking" value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="Description">
        <textarea
          rows={3}
          placeholder="Add a few details to help the technician come prepared…"
          className="rwa-focus w-full rounded-lg px-3.5 py-2.5 text-sm resize-none"
          style={inputStyle}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Field>
      <button
        type="button"
        className="rwa-focus w-full rounded-lg py-3 text-sm font-semibold flex items-center justify-center gap-2"
        style={{ border: "1px dashed var(--color-border)", color: "var(--color-text-secondary)" }}
      >
        <Camera size={15} /> Add a photo (optional)
      </button>
    </Modal>
  );
}

function RequestDetailModal({ request, onClose, onRate }) {
  if (!request) return null;
  const steps = ["Open", "Assigned", "In Progress", "Resolved"];
  const currentIdx = steps.indexOf(request.status) === -1 ? 0 : steps.indexOf(request.status);
  return (
    <Modal open={!!request} onClose={onClose} title={request.id} subtitle={request.title} width="max-w-md">
      <div className="flex items-center justify-between mb-6">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: i <= currentIdx ? "var(--color-navy-800)" : "var(--color-border)",
                  color: i <= currentIdx ? "#fff" : "var(--color-text-tertiary)",
                }}
              >
                {i < currentIdx || request.status === "Resolved" ? <CheckCircle2 size={14} /> : <CircleDot size={12} />}
              </div>
              <span className="text-[10px] font-medium text-center" style={{ color: i <= currentIdx ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className="flex-1 h-0.5 mx-1" style={{ background: i < currentIdx ? "var(--color-navy-800)" : "var(--color-border)" }} />}
          </React.Fragment>
        ))}
      </div>
      <div className="rounded-xl p-4 mb-4" style={{ background: "var(--color-bg)" }}>
        <div className="flex justify-between text-sm mb-2">
          <span style={{ color: "var(--color-text-secondary)" }}>Category</span>
          <span className="font-medium">{request.category}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span style={{ color: "var(--color-text-secondary)" }}>Raised on</span>
          <span className="font-medium">{request.raisedOn}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: "var(--color-text-secondary)" }}>Status</span>
          <StatusBadge status={request.status} />
        </div>
      </div>
      <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>{request.description}</p>
      {request.status === "Resolved" && (
        <div className="rounded-xl p-4" style={{ border: "1px solid var(--color-border)" }}>
          <p className="text-xs font-semibold mb-2">Rate this resolution</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => onRate(request, n)} className="rwa-focus">
                <Star size={20} fill={n <= (request.rating || 0) ? "var(--color-marigold-500)" : "none"} style={{ color: "var(--color-marigold-500)" }} />
              </button>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}

function RequestsPage({ pushToast }) {
  const [tab, setTab] = useState("open");
  const [requests, setRequests] = useState(ALL_REQUESTS);
  const [newOpen, setNewOpen] = useState(false);
  const [detail, setDetail] = useState(null);

  const openOnes = requests.filter((r) => r.status !== "Resolved");
  const resolvedOnes = requests.filter((r) => r.status === "Resolved");

  const handleCreate = ({ title, category, description }) => {
    const id = "SR-" + (1043 + requests.length);
    const req = { id, title: title || "New service request", category, status: "Open", raisedOn: "Today", description: description || "No additional details provided." };
    setRequests((prev) => [req, ...prev]);
    pushToast({ title: "Request submitted", body: `${id} has been raised and will be assigned shortly.`, tone: "success" });
  };

  const handleRate = (request, rating) => {
    setRequests((prev) => prev.map((r) => (r.id === request.id ? { ...r, rating } : r)));
    setDetail((d) => (d ? { ...d, rating } : d));
    pushToast({ title: "Thanks for rating!", tone: "success" });
  };

  const tabs = [
    { key: "open", label: "Open", count: openOnes.length },
    { key: "resolved", label: "Resolved", count: resolvedOnes.length },
  ];
  const list = tab === "open" ? openOnes : resolvedOnes;

  return (
    <div className="max-w-[900px] mx-auto">
      <PageHeader
        title="Service Requests"
        blurb="Raise a complaint or request and track it through to resolution."
        action={<Button variant="primary" icon={Wrench} onClick={() => setNewOpen(true)}>New request</Button>}
      />
      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      <Card>
        {list.length ? (
          <div className="flex flex-col divide-y" style={{ borderColor: "var(--color-border)" }}>
            {list.map((r) => (
              <button key={r.id} onClick={() => setDetail(r)} className="rwa-focus flex items-center gap-3 py-3.5 first:pt-0 last:pb-0 text-left w-full">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--color-navy-50)" }}>
                  <Wrench size={15} style={{ color: "var(--color-navy-700)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{r.title}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{r.id} · {r.category} · raised {r.raisedOn}</p>
                </div>
                <StatusBadge status={r.status} />
                <ChevronRight size={15} style={{ color: "var(--color-text-tertiary)" }} />
              </button>
            ))}
          </div>
        ) : (
          <EmptyState icon={Wrench} title="Nothing here" body="Requests in this category will show up here." />
        )}
      </Card>

      <NewRequestModal open={newOpen} onClose={() => setNewOpen(false)} onCreate={handleCreate} />
      <RequestDetailModal request={detail} onClose={() => setDetail(null)} onRate={handleRate} />
    </div>
  );
}

/* ============================================================================
   STAFF SERVICES PAGE
   ============================================================================ */

const ROLE_FILTERS = ["All", "Maid", "Cook", "Driver", "Technician", "Car cleaner"];

function WorkerProfileModal({ worker, onClose, pushToast }) {
  if (!worker) return null;
  return (
    <Modal
      open={!!worker}
      onClose={onClose}
      title={worker.name}
      subtitle={worker.role}
      width="max-w-sm"
      footer={
        <Button
          variant="primary"
          className="w-full"
          icon={Briefcase}
          onClick={() => { pushToast({ title: "Request sent", body: `${worker.name} will be notified of your request.`, tone: "success" }); onClose(); }}
        >
          Request booking
        </Button>
      }
    >
      <div className="flex items-center gap-4 mb-5">
        <Avatar initials={worker.initials} size={56} />
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Star size={14} fill="var(--color-marigold-500)" style={{ color: "var(--color-marigold-500)" }} />
            <span className="text-sm font-semibold">{worker.rating}</span>
            <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>· {worker.experience} experience</span>
          </div>
          {worker.verified && (
            <Badge tone="success"><ShieldCheck size={11} /> ID & police verified</Badge>
          )}
        </div>
      </div>
      <div className="rounded-xl p-4" style={{ background: "var(--color-bg)" }}>
        <div className="flex justify-between text-sm">
          <span style={{ color: "var(--color-text-secondary)" }}>Availability</span>
          <span className="font-medium">{worker.availability}</span>
        </div>
      </div>
    </Modal>
  );
}

function ServicesPage({ pushToast }) {
  const [filter, setFilter] = useState("All");
  const [profileWorker, setProfileWorker] = useState(null);
  const filtered = filter === "All" ? WORKERS : WORKERS.filter((w) => w.role === filter);

  return (
    <div className="max-w-[1000px] mx-auto">
      <PageHeader title="Staff Services" blurb="Browse verified maids, cooks, drivers and technicians." />

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <Filter size={14} style={{ color: "var(--color-text-tertiary)" }} />
        {ROLE_FILTERS.map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className="rwa-focus px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: filter === r ? "var(--color-navy-800)" : "#fff",
              color: filter === r ? "#fff" : "var(--color-text-secondary)",
              border: "1px solid var(--color-border)",
            }}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((w) => (
          <Card key={w.id} className="cursor-pointer" onClick={() => setProfileWorker(w)}>
            <div className="flex items-center gap-3 mb-3">
              <Avatar initials={w.initials} size={44} />
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{w.name}</p>
                <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{w.role}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star size={13} fill="var(--color-marigold-500)" style={{ color: "var(--color-marigold-500)" }} />
                <span className="text-xs font-semibold">{w.rating}</span>
                <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>· {w.experience}</span>
              </div>
              {w.verified && <ShieldCheck size={14} style={{ color: "var(--color-success)" }} />}
            </div>
          </Card>
        ))}
      </div>

      <WorkerProfileModal worker={profileWorker} onClose={() => setProfileWorker(null)} pushToast={pushToast} />
    </div>
  );
}

/* ============================================================================
   MARKETPLACE PAGE
   ============================================================================ */

/* ============================================================================
   RESIDENT BUY & SELL (OLX-style classifieds)
   ============================================================================ */

function PostAdModal({ open, onClose, onPost }) {
  const [form, setForm] = useState({ title: "", price: "", category: "Furniture", condition: "Used", description: "" });
  const handleClose = () => { onClose(); setForm({ title: "", price: "", category: "Furniture", condition: "Used", description: "" }); };
  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Post an ad"
      subtitle="Sell to your neighbours at RUhome."
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" icon={Tag} onClick={() => { onPost(form); handleClose(); }}>Post ad</Button>
        </>
      }
    >
      <button
        type="button"
        className="rwa-focus w-full rounded-xl py-8 mb-4 flex flex-col items-center justify-center gap-2"
        style={{ border: "1px dashed var(--color-border)", color: "var(--color-text-secondary)" }}
      >
        <ImageIcon size={22} />
        <span className="text-xs font-medium">Add photos (optional)</span>
      </button>
      <Field label="Item title">
        <TextInput placeholder="e.g. Study table, like new" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Price (₹)">
          <TextInput inputMode="numeric" placeholder="2500" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value.replace(/\D/g, "") })} />
        </Field>
        <Field label="Condition">
          <select className="rwa-focus w-full rounded-lg px-3.5 py-2.5 text-sm bg-white" style={inputStyle} value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
            <option>New</option>
            <option>Like New</option>
            <option>Used</option>
          </select>
        </Field>
      </div>
      <Field label="Category">
        <select className="rwa-focus w-full rounded-lg px-3.5 py-2.5 text-sm bg-white" style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {LISTING_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Description">
        <textarea
          rows={3}
          placeholder="Condition, reason for selling, anything a buyer should know…"
          className="rwa-focus w-full rounded-lg px-3.5 py-2.5 text-sm resize-none"
          style={inputStyle}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </Field>
      <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Your flat number is shared with interested buyers so they can coordinate pickup.</p>
    </Modal>
  );
}

function ContactSellerModal({ listing, onClose, pushToast }) {
  const [message, setMessage] = useState("");
  if (!listing) return null;
  return (
    <Modal
      open={!!listing}
      onClose={onClose}
      title="Contact seller"
      subtitle={listing.title}
      width="max-w-sm"
      footer={
        <Button
          variant="primary"
          className="w-full"
          icon={MessageCircle}
          onClick={() => { pushToast({ title: "Message sent", body: `${listing.seller} will get your message about "${listing.title}".`, tone: "success" }); onClose(); setMessage(""); }}
        >
          Send message
        </Button>
      }
    >
      <div className="flex items-center gap-3 mb-4 rounded-xl p-3.5" style={{ background: "var(--color-bg)" }}>
        <Avatar initials={listing.seller.split(" ").map((s) => s[0]).slice(0, 2).join("")} size={40} />
        <div>
          <p className="text-sm font-semibold">{listing.seller}</p>
          <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{listing.flat}</p>
        </div>
      </div>
      <Field label="Message">
        <textarea
          rows={3}
          placeholder={`Hi, is "${listing.title}" still available?`}
          className="rwa-focus w-full rounded-lg px-3.5 py-2.5 text-sm resize-none"
          style={inputStyle}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </Field>
    </Modal>
  );
}

function ListingCard({ listing, onContact, onMarkSold, onDelete }) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-2">
        <div
          className="w-full aspect-[4/3] rounded-xl flex items-center justify-center mb-3"
          style={{ background: "var(--color-navy-50)" }}
        >
          <ImageIcon size={28} style={{ color: "var(--color-navy-700)", opacity: 0.4 }} />
        </div>
      </div>
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-sm font-semibold leading-snug">{listing.title}</p>
        {listing.status === "Sold" && <Badge tone="neutral">Sold</Badge>}
      </div>
      <p className="rwa-heading text-lg font-bold mb-2">{formatINR(listing.price)}</p>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Badge tone="info">{listing.category}</Badge>
        <Badge tone="neutral">{listing.condition}</Badge>
      </div>
      <p className="text-xs mb-3 line-clamp-2" style={{ color: "var(--color-text-secondary)" }}>{listing.description}</p>
      <div className="flex items-center justify-between text-xs mb-4" style={{ color: "var(--color-text-tertiary)" }}>
        <span>{listing.mine ? "You" : listing.seller} · {listing.flat}</span>
        <span>{listing.postedOn}</span>
      </div>
      {listing.mine ? (
        <div className="flex gap-2">
          {listing.status === "Active" && (
            <Button variant="secondary" size="sm" className="flex-1" icon={PackageCheck} onClick={() => onMarkSold(listing)}>Mark sold</Button>
          )}
          <Button variant="ghost" size="sm" icon={Trash2} onClick={() => onDelete(listing)} style={{ color: "var(--color-danger)" }}>Delete</Button>
        </div>
      ) : (
        <Button variant="primary" size="sm" className="w-full" icon={MessageCircle} onClick={() => onContact(listing)} disabled={listing.status === "Sold"}>
          {listing.status === "Sold" ? "No longer available" : "Contact seller"}
        </Button>
      )}
    </Card>
  );
}

function BuySellTab({ pushToast }) {
  const [listings, setListings] = useState(RESIDENT_LISTINGS);
  const [category, setCategory] = useState("All");
  const [postOpen, setPostOpen] = useState(false);
  const [contactListing, setContactListing] = useState(null);

  const filtered = category === "All" ? listings : listings.filter((l) => l.category === category);

  const handlePost = (form) => {
    const newListing = {
      id: "ls" + (listings.length + 1),
      title: form.title || "Untitled item",
      price: Number(form.price) || 0,
      category: form.category,
      condition: form.condition,
      seller: RESIDENT.name,
      flat: RESIDENT.flat.split(",")[0],
      postedOn: "Just now",
      description: form.description || "No description provided.",
      mine: true,
      status: "Active",
    };
    setListings((prev) => [newListing, ...prev]);
    pushToast({ title: "Ad posted", body: `${newListing.title} is now live for your community.`, tone: "success" });
  };

  const markSold = (l) => {
    setListings((prev) => prev.map((x) => (x.id === l.id ? { ...x, status: "Sold" } : x)));
    pushToast({ title: "Marked as sold", body: l.title, tone: "success" });
  };

  const deleteListing = (l) => {
    setListings((prev) => prev.filter((x) => x.id !== l.id));
    pushToast({ title: "Listing deleted", body: l.title, tone: "danger" });
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} style={{ color: "var(--color-text-tertiary)" }} />
          {["All", ...LISTING_CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className="rwa-focus px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: category === c ? "var(--color-navy-800)" : "#fff",
                color: category === c ? "#fff" : "var(--color-text-secondary)",
                border: "1px solid var(--color-border)",
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <Button variant="accent" icon={Plus} onClick={() => setPostOpen(true)}>Post an ad</Button>
      </div>

      {filtered.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((l) => (
            <ListingCard key={l.id} listing={l} onContact={setContactListing} onMarkSold={markSold} onDelete={deleteListing} />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState icon={Tag} title="Nothing listed in this category" body="Be the first to post an item in this category." action={<Button variant="primary" className="mt-4" onClick={() => setPostOpen(true)}>Post an ad</Button>} />
        </Card>
      )}

      <PostAdModal open={postOpen} onClose={() => setPostOpen(false)} onPost={handlePost} />
      <ContactSellerModal listing={contactListing} onClose={() => setContactListing(null)} pushToast={pushToast} />
    </div>
  );
}

function MarketplacePage({ pushToast }) {
  const [tab, setTab] = useState("buysell");
  const [cart, setCart] = useState([]);
  const [subs, setSubs] = useState(SUBSCRIPTIONS);

  const addToCart = (product) => {
    setCart((prev) => [...prev, product]);
    pushToast({ title: "Added to cart", body: product.name, tone: "success" });
  };

  const toggleSub = (id) => {
    setSubs((prev) => prev.map((s) => (s.id === id ? { ...s, status: s.status === "Active" ? "Paused" : "Active" } : s)));
  };

  const cancelSub = (id) => {
    setSubs((prev) => prev.filter((s) => s.id !== id));
    pushToast({ title: "Subscription cancelled", tone: "danger" });
  };

  const tabs = [
    { key: "buysell", label: "Buy & Sell" },
    { key: "products", label: "Vendor Products" },
    { key: "appointments", label: "Appointments" },
    { key: "subscriptions", label: "Subscriptions", count: subs.length },
  ];

  return (
    <div className="max-w-[1000px] mx-auto">
      <PageHeader
        title="Marketplace"
        blurb="Buy & sell with neighbours, order from vendors, book appointments and manage subscriptions."
        action={
          tab !== "buysell" ? (
            <div className="relative">
              <IconButton icon={ShoppingCart} label="Cart" badge={cart.length || null} />
            </div>
          ) : undefined
        }
      />
      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === "buysell" && <BuySellTab pushToast={pushToast} />}

      {tab === "products" && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {VENDORS.filter((v) => v.category === "Grocery" || v.category === "Pharmacy").map((v) => (
              <Card key={v.id}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold">{v.name}</p>
                    <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{v.category} · {v.meta}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={12} fill="var(--color-marigold-500)" style={{ color: "var(--color-marigold-500)" }} />
                    <span className="text-xs font-semibold">{v.rating}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {PRODUCTS.filter((p) => p.vendorId === v.id).map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "var(--color-bg)" }}>
                      <span className="text-sm">{p.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{formatINR(p.price)}</span>
                        <Button variant="secondary" size="sm" onClick={() => addToCart(p)}>Add</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === "appointments" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {VENDORS.filter((v) => v.category === "Salon" || v.category === "Clinic").map((v) => (
            <Card key={v.id}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold">{v.name}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{v.category} · {v.meta}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={12} fill="var(--color-marigold-500)" style={{ color: "var(--color-marigold-500)" }} />
                  <span className="text-xs font-semibold">{v.rating}</span>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                icon={CalendarCheck}
                onClick={() => pushToast({ title: "Appointment slot held", body: `We'll confirm your ${v.name} slot shortly.`, tone: "success" })}
              >
                Book appointment
              </Button>
            </Card>
          ))}
        </div>
      )}

      {tab === "subscriptions" && (
        <Card>
          {subs.length ? (
            <div className="flex flex-col divide-y" style={{ borderColor: "var(--color-border)" }}>
              {subs.map((s) => (
                <div key={s.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--color-marigold-50)" }}>
                    <ShoppingBag size={15} style={{ color: "var(--color-marigold-600)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{s.service}</p>
                    <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{s.vendor} · {s.frequency} · {formatINR(s.price)}/cycle</p>
                  </div>
                  <Badge tone={s.status === "Active" ? "success" : "warning"}>{s.status}</Badge>
                  <button onClick={() => toggleSub(s.id)} className="rwa-focus w-8 h-8 rounded-full flex items-center justify-center" style={{ color: "var(--color-navy-700)" }} title={s.status === "Active" ? "Pause" : "Resume"}>
                    {s.status === "Active" ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button onClick={() => cancelSub(s.id)} className="rwa-focus w-8 h-8 rounded-full flex items-center justify-center" style={{ color: "var(--color-danger)" }} title="Cancel">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={ShoppingBag} title="No subscriptions" body="Recurring services like milk delivery or car cleaning will appear here." />
          )}
        </Card>
      )}
    </div>
  );
}

/* ============================================================================
   NOTIFICATIONS PAGE
   ============================================================================ */

function NotificationsPage({ notifications, onMarkRead, onMarkAllRead }) {
  return (
    <div className="max-w-[700px] mx-auto">
      <PageHeader
        title="Notifications"
        blurb="Everything that needs your attention, in one place."
        action={<Button variant="secondary" size="sm" onClick={onMarkAllRead}>Mark all as read</Button>}
      />
      <Card padded={false}>
        {notifications.length ? (
          notifications.map((n) => {
            const Icon = NOTIF_ICON[n.type] || Bell;
            return (
              <button
                key={n.id}
                onClick={() => onMarkRead(n.id)}
                className="rwa-focus w-full text-left flex items-start gap-3 px-5 py-4"
                style={{ borderBottom: "1px solid var(--color-border)", background: n.read ? "#fff" : "var(--color-navy-50)" }}
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#fff", border: "1px solid var(--color-border)", color: "var(--color-navy-700)" }}>
                  <Icon size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{n.body}</p>
                  <p className="text-[11px] mt-1" style={{ color: "var(--color-text-tertiary)" }}>{n.time}</p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: "var(--color-marigold-500)" }} />}
              </button>
            );
          })
        ) : (
          <EmptyState icon={Bell} title="You're all caught up" body="New notifications will show up here." />
        )}
      </Card>
    </div>
  );
}

/* ============================================================================
   PROFILE PAGE
   ============================================================================ */

const FAMILY_MEMBERS = [
  { name: "Karthik Rao", relation: "Spouse", phone: "+91 98450 67890" },
  { name: "Aarav Rao", relation: "Son", phone: "—" },
  { name: "Diya Rao", relation: "Daughter", phone: "—" },
];

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className="rwa-focus w-10 h-6 rounded-full relative transition-colors shrink-0"
      style={{ background: checked ? "var(--color-navy-800)" : "var(--color-border)" }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
        style={{ left: checked ? "18px" : "2px" }}
      />
    </button>
  );
}

function ProfilePage({ onLogout }) {
  const [prefs, setPrefs] = useState({ visitor: true, payment: true, amenity: true, announcements: false });
  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="max-w-[700px] mx-auto">
      <PageHeader title="Profile" blurb="Your details, family members and notification preferences." />

      <Card className="mb-5">
        <div className="flex items-center gap-4 mb-5">
          <Avatar initials={RESIDENT.initials} size={56} />
          <div>
            <p className="rwa-heading text-lg font-bold">{RESIDENT.name}</p>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{RESIDENT.flat}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-2.5 text-sm">
            <Phone size={15} style={{ color: "var(--color-text-tertiary)" }} />
            {RESIDENT.phone}
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <Mail size={15} style={{ color: "var(--color-text-tertiary)" }} />
            {RESIDENT.email}
          </div>
        </div>
      </Card>

      <Card className="mb-5">
        <SectionHeader title="Family members" icon={Users} />
        <div className="flex flex-col divide-y" style={{ borderColor: "var(--color-border)" }}>
          {FAMILY_MEMBERS.map((m, i) => (
            <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <Avatar initials={m.name.split(" ").map((s) => s[0]).slice(0, 2).join("")} size={34} />
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{m.name}</p>
                <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{m.relation}{m.phone !== "—" ? ` · ${m.phone}` : ""}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mb-5">
        <SectionHeader title="Notification preferences" icon={Bell} />
        <div className="flex flex-col divide-y" style={{ borderColor: "var(--color-border)" }}>
          {[
            { key: "visitor", label: "Visitor arrivals & check-ins" },
            { key: "payment", label: "Payment reminders & confirmations" },
            { key: "amenity", label: "Amenity booking updates" },
            { key: "announcements", label: "Community announcements" },
          ].map((p) => (
            <div key={p.key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <span className="text-sm">{p.label}</span>
              <ToggleSwitch checked={prefs[p.key]} onChange={() => toggle(p.key)} />
            </div>
          ))}
        </div>
      </Card>

      <Button variant="secondary" icon={LogOut} className="w-full" style={{ color: "var(--color-danger)" }} onClick={onLogout}>
        Log out
      </Button>
    </div>
  );
}

/* ============================================================================
   PLACEHOLDER PAGE (for phases not yet implemented)
   ============================================================================ */

function PlaceholderPage({ pageKey, onNavigate }) {
  const meta = PAGE_META[pageKey];
  if (!meta) return null;
  return (
    <div className="max-w-[1180px] mx-auto">
      <div className="mb-6">
        <h1 className="rwa-heading text-2xl font-bold">{meta.title}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>{meta.blurb}</p>
      </div>
      <Card>
        <EmptyState
          icon={meta.icon}
          title={`${meta.title} is coming in a later phase`}
          body="This module's screens and flows will be built next, following the approved implementation plan. Head back to your dashboard to try what's live today."
          action={
            <Button variant="primary" className="mt-5" iconRight={ArrowRight} onClick={() => onNavigate("dashboard")}>
              Back to dashboard
            </Button>
          }
        />
      </Card>
    </div>
  );
}

/* ============================================================================
   APP SHELL
   ============================================================================ */

function AppShell({ route, onNavigate, children, notifications, onMarkRead, onMarkAllRead, onOpenSos }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen flex" style={{ background: "var(--color-bg)" }}>
      <Sidebar
        route={route}
        onNavigate={onNavigate}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onOpenNotifications={() => { setNotifOpen((o) => !o); setUserMenuOpen(false); }}
          notifOpen={notifOpen}
          unreadCount={unreadCount}
          onOpenUserMenu={() => { setUserMenuOpen((o) => !o); setNotifOpen(false); }}
          userMenuOpen={userMenuOpen}
          onOpenSos={onOpenSos}
          notifPanel={
            <NotificationsPanel
              open={notifOpen}
              onClose={() => setNotifOpen(false)}
              notifications={notifications}
              onMarkRead={onMarkRead}
              onMarkAllRead={onMarkAllRead}
            />
          }
          userMenu={
            <UserMenu
              open={userMenuOpen}
              onClose={() => setUserMenuOpen(false)}
              onNavigate={onNavigate}
              onLogout={() => onNavigate("__logout")}
            />
          }
        />
        <main className="flex-1 p-4 md:p-7 rwa-animate-in">{children}</main>
      </div>
    </div>
  );
}

/* ============================================================================
   ROOT APP
   ============================================================================ */

export default function ResidentApp({ onExitToPortal }) {
  const [session, setSession] = useState(RESIDENT);
  const [route, setRoute] = useState("dashboard");
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState(NOTIFICATIONS_SEED);
  const [sosStage, setSosStage] = useState("closed"); // closed | confirm | sent
  const [inviteOpen, setInviteOpen] = useState(false);
  const [payBill, setPayBill] = useState(null); // null = closed, object = open with that bill

  const pushToast = (t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, ...t }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3200);
  };
  const dismissToast = (id) => setToasts((prev) => prev.filter((x) => x.id !== id));

  const handleNavigate = (key) => {
    if (key === "__logout") {
      setRoute("dashboard");
      pushToast({ title: "Logged out", body: "You have been signed out safely.", tone: "success" });
      setTimeout(() => onExitToPortal?.(), 300);
      return;
    }
    setRoute(key);
  };

  const markRead = (id) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  if (!session) {
    return (
      <div className="rwa-root">
        <GlobalStyles />
        <LoginScreen onLogin={() => { setSession(RESIDENT); setRoute("dashboard"); pushToast({ title: "Welcome back", body: `Signed in as ${RESIDENT.name}`, tone: "success" }); }} pushToast={pushToast} />
        <ToastStack toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  const PAGES = {
    dashboard: (
      <Dashboard
        onNavigate={handleNavigate}
        onInvite={() => setInviteOpen(true)}
        onPayNow={() => setPayBill(OUTSTANDING_BILL)}
        onOpenSos={() => setSosStage("confirm")}
      />
    ),
    visitors: <VisitorsPage onInvite={() => setInviteOpen(true)} pushToast={pushToast} />,
    parking: <ParkingPage />,
    kids: <KidsPage />,
    amenities: <AmenitiesPage pushToast={pushToast} />,
    payments: <PaymentsPage onPayBill={(bill) => setPayBill(bill)} />,
    requests: <RequestsPage pushToast={pushToast} />,
    services: <ServicesPage pushToast={pushToast} />,
    marketplace: <MarketplacePage pushToast={pushToast} />,
    notifications: <NotificationsPage notifications={notifications} onMarkRead={markRead} onMarkAllRead={markAllRead} />,
    profile: <ProfilePage onLogout={() => handleNavigate("__logout")} />,
  };

  return (
    <div className="rwa-root">
      <GlobalStyles />
      <AppShell
        route={route}
        onNavigate={handleNavigate}
        notifications={notifications}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
        onOpenSos={() => setSosStage("confirm")}
      >
        {PAGES[route] || PAGES.dashboard}
      </AppShell>

      <SosModal
        stage={sosStage}
        onClose={() => setSosStage("closed")}
        onConfirm={() => setSosStage("sent")}
      />
      <InviteVisitorModal open={inviteOpen} onClose={() => setInviteOpen(false)} pushToast={pushToast} />
      <PayNowModal open={!!payBill} bill={payBill} onClose={() => setPayBill(null)} pushToast={pushToast} />

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
