import React, { useState, useMemo, useRef, useEffect } from "react";
import { useDialog, useEscape, greeting } from "./hooks.js";
import {
  LayoutDashboard, Users, UserPlus, Shield, Building2, Car, CalendarCheck,
  UserCheck, Wallet, Receipt, Wrench, Store, Megaphone, Bell, BarChart3,
  Settings, ChevronDown, ChevronRight, ChevronLeft, Search, X, Check,
  CheckCircle2, XCircle, AlertTriangle, MoreHorizontal, Filter, Download,
  Eye, Pencil, Ban, Power, KeyRound, ArrowRight, ArrowLeft, ShieldCheck,
  ShieldAlert, Siren, MapPinned, ClipboardList, Briefcase, Star, Phone,
  Mail, LogOut, Menu, Loader2, Plus, TrendingUp, TrendingDown, Home,
  FileText, Clock, RefreshCw, Slash, UserX, UserCog, Landmark, Truck,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

/* ============================================================================
   ROLES & PERMISSION TEMPLATES
   ============================================================================ */

const ROLES = [
  { key: "Resident", label: "Resident", icon: Home, group: "community", desc: "Lives in the community, uses resident services." },
  { key: "Guard", label: "Guard / Security", icon: Shield, group: "operational", desc: "Operates a gate, verifies visitors and staff." },
  { key: "Staff", label: "Staff / Service Worker", icon: Briefcase, group: "operational", desc: "Maid, cook, driver, technician or other worker." },
  { key: "Vendor", label: "Vendor", icon: Store, group: "operational", desc: "Marketplace vendor offering products or services." },
  { key: "RWA Admin", label: "RWA Admin", icon: ShieldCheck, group: "admin", desc: "Full platform control for the RWA committee." },
  { key: "Community Admin", label: "Community Admin", icon: UserCog, group: "admin", desc: "Day-to-day community administration." },
  { key: "Community Manager", label: "Community Manager", icon: Landmark, group: "admin", desc: "Operational manager for community services." },
  { key: "Finance Manager", label: "Finance Manager", icon: Wallet, group: "admin", desc: "Manages billing, payments and expenses." },
  { key: "Security Manager", label: "Security Manager", icon: ShieldAlert, group: "admin", desc: "Oversees guards, patrols and incidents." },
];
const ADMIN_ROLE_KEYS = ["RWA Admin", "Community Admin", "Community Manager", "Finance Manager", "Security Manager"];

const PERMISSION_MODULES = [
  { key: "residents", label: "Residents", actions: ["View", "Create", "Edit", "Suspend"] },
  { key: "visitors", label: "Visitors", actions: ["View", "Manage"] },
  { key: "security", label: "Security", actions: ["View", "Manage"] },
  { key: "billing", label: "Billing", actions: ["View", "Manage"] },
  { key: "amenities", label: "Amenities", actions: ["View", "Manage"] },
  { key: "requests", label: "Service Requests", actions: ["View", "Assign", "Manage"] },
  { key: "marketplace", label: "Marketplace", actions: ["View", "Manage"] },
  { key: "reports", label: "Reports", actions: ["View"] },
  { key: "users", label: "Users", actions: ["Create", "Edit", "Manage"] },
];

function defaultPermissionsFor(role) {
  const all = {};
  PERMISSION_MODULES.forEach((m) => { all[m.key] = [...m.actions]; });
  const none = {};
  PERMISSION_MODULES.forEach((m) => { none[m.key] = []; });
  switch (role) {
    case "RWA Admin": return all;
    case "Community Admin": return { ...all, billing: ["View"] };
    case "Community Manager": return { ...none, residents: ["View"], visitors: ["View", "Manage"], amenities: ["View", "Manage"], requests: ["View", "Assign", "Manage"], reports: ["View"] };
    case "Finance Manager": return { ...none, billing: ["View", "Manage"], reports: ["View"] };
    case "Security Manager": return { ...none, security: ["View", "Manage"], visitors: ["View", "Manage"], reports: ["View"] };
    default: return none;
  }
}

/* ============================================================================
   MOCK DATA
   ============================================================================ */

const ADMIN = { name: "Priya Nair", role: "RWA Admin", initials: "PN", email: "priya.nair@ruhome.in", phone: "+91 98765 43210", community: "RUhome" };

const TOWERS = ["Tower A", "Tower B", "Tower C", "Tower D"];
const FLATS_LIST = ["A-0803", "B-1204", "B-0501", "C-0902", "D-1102", "A-0405", "B-0703", "C-1201", "D-0604", "A-1105"];
const GATES = ["Main Gate", "Gate 2 — Tower B", "Service Gate", "Clubhouse Gate"];
const SHIFTS = ["Day Shift (8 AM – 8 PM)", "Night Shift (8 PM – 8 AM)", "Rotational"];
const WORKER_TYPES = ["Maid", "Driver", "Cook", "Technician", "Car cleaner", "Other"];
const VENDOR_CATEGORIES = ["Grocery", "Pharmacy", "Salon", "Clinic", "Milk", "Car cleaning", "Maintenance vendor", "Other"];

let idCounter = 100;
const nextId = () => "U" + (idCounter++);

const SEED_USERS = [
  { id: "U001", name: "Ananya Rao", role: "Resident", phone: "+91 98450 12345", email: "ananya.rao@example.com", status: "Active", createdOn: "12 Jan 2026", flat: "B-1204", tower: "Tower B", residentType: "Owner", family: 3, vehicles: 1, outstanding: 4250 },
  { id: "U002", name: "Rajesh Kumar", role: "Resident", phone: "+91 98450 22233", email: "rajesh.k@example.com", status: "Active", createdOn: "3 Feb 2026", flat: "A-0803", tower: "Tower A", residentType: "Tenant", family: 2, vehicles: 0, outstanding: 0 },
  { id: "U003", name: "Vikram Nair", role: "Resident", phone: "+91 98450 33344", email: "vikram.n@example.com", status: "Inactive", createdOn: "9 Nov 2025", flat: "D-1102", tower: "Tower D", residentType: "Owner", family: 4, vehicles: 2, outstanding: 8500 },
  { id: "U004", name: "Suresh Kumar", role: "Guard", phone: "+91 90000 55123", email: "", status: "Active", createdOn: "2 Aug 2025", employeeId: "SEC-1042", gate: "Main Gate", shift: "Day Shift (8 AM – 8 PM)" },
  { id: "U005", name: "Ramesh Yadav", role: "Guard", phone: "+91 90000 55987", email: "", status: "Active", createdOn: "14 Sep 2025", employeeId: "SEC-1043", gate: "Main Gate", shift: "Night Shift (8 PM – 8 AM)" },
  { id: "U006", name: "Lakshmi Devi", role: "Staff", phone: "+91 98765 11223", email: "", status: "Active", createdOn: "20 Mar 2025", workerType: "Maid", skill: "Housekeeping", associatedFlat: "B-1204", verification: "Verified", availability: "Mon–Sat, 7–11 AM", rating: 4.8 },
  { id: "U007", name: "Irfan Sheikh", role: "Staff", phone: "+91 98765 44556", email: "", status: "Active", createdOn: "5 May 2025", workerType: "Technician", skill: "Electrical & AC", associatedFlat: "C-0902", verification: "Pending", availability: "On demand", rating: 4.5 },
  { id: "U008", name: "Fresh Mart Grocery", role: "Vendor", phone: "+91 90111 22334", email: "contact@freshmart.in", status: "Active", createdOn: "1 Jun 2025", contactPerson: "Anil Gupta", category: "Grocery", services: "Fruits, vegetables, daily essentials" },
  { id: "U009", name: "MedPlus Pharmacy", role: "Vendor", phone: "+91 90111 55667", email: "care@medplus.in", status: "Pending", createdOn: "28 Aug 2026", contactPerson: "Sunita Rao", category: "Pharmacy", services: "Medicines, health checkups" },
  { id: "U010", name: "Deepak Verma", role: "Community Manager", phone: "+91 99887 76655", email: "deepak.verma@ruhome.in", status: "Active", createdOn: "10 Jan 2025", department: "Operations", permissions: defaultPermissionsFor("Community Manager") },
  { id: "U011", name: "Kavita Iyer", role: "Finance Manager", phone: "+91 99887 12312", email: "kavita.iyer@ruhome.in", status: "Active", createdOn: "15 Feb 2025", department: "Finance", permissions: defaultPermissionsFor("Finance Manager") },
  { id: "U012", name: "Priya Nair", role: "RWA Admin", phone: "+91 98765 43210", email: "priya.nair@ruhome.in", status: "Active", createdOn: "1 Jan 2025", department: "RWA Committee", permissions: defaultPermissionsFor("RWA Admin") },
];

const DASHBOARD_STATS = {
  community: { totalUsers: 312, residents: 248, flats: 180, occupancy: 92, guards: 8, staff: 34, vendors: 12 },
  security: { visitorsToday: 47, activeVisitors: 6, vehicleActivity: 68, incidents: 2, sosAlerts: 1, patrolCompliance: 88 },
  finance: { collected: 1842500, outstanding: 312400, utilityBilled: 224000, recentPayments: 36 },
  operations: { openRequests: 14, slaBreaches: 2, amenityBookings: 9, marketplaceOrders: 21 },
};

const VISITOR_TREND = [
  { day: "Mon", visitors: 38 }, { day: "Tue", visitors: 42 }, { day: "Wed", visitors: 35 },
  { day: "Thu", visitors: 51 }, { day: "Fri", visitors: 47 }, { day: "Sat", visitors: 63 }, { day: "Sun", visitors: 58 },
];
const COLLECTION_TREND = [
  { month: "Apr", collected: 1620000 }, { month: "May", collected: 1710000 }, { month: "Jun", collected: 1685000 },
  { month: "Jul", collected: 1790000 }, { month: "Aug", collected: 1842500 }, { month: "Sep", collected: 1250000 },
];
const REQUEST_CATEGORY = [
  { name: "Plumbing", value: 5 }, { name: "Electrical", value: 4 }, { name: "Carpentry", value: 2 },
  { name: "Housekeeping", value: 2 }, { name: "Security", value: 1 },
];
const PIE_COLORS = ["#1B2B4B", "#F2A93B", "#3B6FD8", "#2F9E68", "#D64545"];

const RECENT_ACTIVITY = [
  { id: 1, text: "Guard Suresh Kumar checked in visitor Rohit Sharma at Main Gate", time: "5 min ago", icon: UserCheck },
  { id: 2, text: "Ananya Rao (B-1204) paid maintenance ₹4,250", time: "22 min ago", icon: Wallet },
  { id: 3, text: "New service request SR-1043 raised — Lift button not working", time: "1 hr ago", icon: Wrench },
  { id: 4, text: "Vendor MedPlus Pharmacy submitted registration for approval", time: "3 hr ago", icon: Store },
  { id: 5, text: "SOS alert from B-1204 acknowledged by Security Manager", time: "5 hr ago", icon: Siren },
];

/* ============================================================================
   NAVIGATION STRUCTURE
   ============================================================================ */

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    key: "users", label: "Users", icon: Users, children: [
      { key: "users.all", label: "All Users" },
      { key: "users.residents", label: "Residents" },
      { key: "users.guards", label: "Guards" },
      { key: "users.staff", label: "Staff / Service Workers" },
      { key: "users.roles", label: "Roles & Permissions" },
    ],
  },
  {
    key: "community", label: "Community", icon: Building2, children: [
      { key: "community.flats", label: "Flats / Units" },
      { key: "community.vehicles", label: "Vehicles" },
      { key: "community.amenities", label: "Amenities" },
    ],
  },
  { key: "visitors", label: "Visitors", icon: UserPlus },
  {
    key: "security", label: "Security", icon: Shield, children: [
      { key: "security.guards", label: "Guards" },
      { key: "security.attendance", label: "Attendance" },
      { key: "security.patrols", label: "Patrols" },
      { key: "security.incidents", label: "Incidents" },
      { key: "security.sos", label: "SOS / Alerts" },
    ],
  },
  {
    key: "finance", label: "Finance", icon: Wallet, children: [
      { key: "finance.maintenance", label: "Maintenance" },
      { key: "finance.utilities", label: "Utilities" },
      { key: "finance.payments", label: "Payments" },
      { key: "finance.expenses", label: "Expenses" },
      { key: "finance.ledger", label: "Ledger" },
    ],
  },
  {
    key: "operations", label: "Operations", icon: Wrench, children: [
      { key: "operations.requests", label: "Service Requests" },
      { key: "operations.vendors", label: "Vendors" },
    ],
  },
  {
    key: "marketplace", label: "Marketplace", icon: Store, children: [
      { key: "marketplace.products", label: "Products" },
      { key: "marketplace.services", label: "Services" },
      { key: "marketplace.orders", label: "Orders" },
      { key: "marketplace.appointments", label: "Appointments" },
      { key: "marketplace.subscriptions", label: "Subscriptions" },
    ],
  },
  {
    key: "communication", label: "Communication", icon: Megaphone, children: [
      { key: "communication.announcements", label: "Announcements" },
      { key: "communication.notifications", label: "Notifications" },
    ],
  },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "settings", label: "Settings", icon: Settings },
];

const TONE_MAP = {
  success: "success", active: "success", paid: "success", resolved: "success", confirmed: "success", approved: "success",
  completed: "success", delivered: "success", verified: "success", available: "success", published: "success",
  operational: "success", "owner-occupied": "success", sent: "success", credit: "success", booked: "success",
  "checked-in": "success", "in stock": "success",
  pending: "warning", open: "warning", waiting: "warning", "in progress": "warning", scheduled: "warning",
  "low stock": "warning", "under review": "warning", "out for delivery": "warning", vacant: "warning",
  suspended: "danger", overdue: "danger", failed: "danger", cancelled: "danger", rejected: "danger",
  missed: "danger", "out of stock": "danger", inactive: "danger", "under maintenance": "danger",
  "missed checkpoint": "danger", debit: "danger", unavailable: "danger",
  assigned: "info", renewed: "info", expected: "info", processing: "info", "tenant-occupied": "info", refunded: "info",
};
function toneForValue(v) { return TONE_MAP[String(v).toLowerCase()] || "neutral"; }

const ADD_LABELS = {
  "community.flats": "Flat", "community.vehicles": "Vehicle", "community.amenities": "Amenity",
  "visitors": "Visitor", "security.attendance": "Attendance Record", "security.patrols": "Patrol",
  "security.incidents": "Incident", "security.sos": "Alert", "finance.maintenance": "Bill",
  "finance.utilities": "Bill", "finance.payments": "Payment", "finance.expenses": "Expense",
  "finance.ledger": "Entry", "operations.requests": "Request", "operations.vendors": "Vendor",
  "marketplace.products": "Product", "marketplace.services": "Service", "marketplace.orders": "Order",
  "marketplace.appointments": "Appointment", "marketplace.subscriptions": "Subscription",
  "communication.announcements": "Announcement", "communication.notifications": "Notification",
};

const PLACEHOLDER_META = {
  "community.flats": {
    title: "Flats / Units", icon: Building2, blurb: "Buildings, towers, floors, flats, occupancy and owner/tenant records.",
    columns: [
      { key: "flat", label: "Flat" }, { key: "tower", label: "Tower" }, { key: "floor", label: "Floor" },
      { key: "type", label: "Type" }, { key: "occupancy", label: "Occupancy", type: "badge" }, { key: "resident", label: "Resident" },
    ],
    rows: [
      { flat: "A-0803", tower: "Tower A", floor: 8, type: "2BHK", occupancy: "Owner-occupied", resident: "Rajesh Kumar" },
      { flat: "B-1204", tower: "Tower B", floor: 12, type: "3BHK", occupancy: "Owner-occupied", resident: "Ananya Rao" },
      { flat: "B-0501", tower: "Tower B", floor: 5, type: "2BHK", occupancy: "Tenant-occupied", resident: "Meera Pillai" },
      { flat: "C-0902", tower: "Tower C", floor: 9, type: "3BHK", occupancy: "Owner-occupied", resident: "Karthik Iyer" },
      { flat: "D-1102", tower: "Tower D", floor: 11, type: "Penthouse", occupancy: "Owner-occupied", resident: "Vikram Nair" },
      { flat: "A-0405", tower: "Tower A", floor: 4, type: "1BHK", occupancy: "Vacant", resident: "—" },
      { flat: "B-0703", tower: "Tower B", floor: 7, type: "2BHK", occupancy: "Tenant-occupied", resident: "Sana Sheikh" },
      { flat: "C-1201", tower: "Tower C", floor: 12, type: "3BHK", occupancy: "Owner-occupied", resident: "Divya Shah" },
      { flat: "D-0604", tower: "Tower D", floor: 6, type: "2BHK", occupancy: "Vacant", resident: "—" },
      { flat: "A-1105", tower: "Tower A", floor: 11, type: "3BHK", occupancy: "Tenant-occupied", resident: "Arjun Mehta" },
    ],
  },
  "community.vehicles": {
    title: "Vehicles", icon: Car, blurb: "Registered resident and visitor vehicles across the community.",
    columns: [
      { key: "vehicle", label: "Vehicle No" }, { key: "type", label: "Type" }, { key: "owner", label: "Owner" },
      { key: "flat", label: "Flat" }, { key: "slot", label: "Parking Slot" },
    ],
    rows: [
      { vehicle: "TS09AB1234", type: "Car", owner: "Ananya Rao", flat: "B-1204", slot: "B-14" },
      { vehicle: "KA05MN7821", type: "SUV", owner: "Vikram Nair", flat: "D-1102", slot: "D-02" },
      { vehicle: "TS10CD5566", type: "Car", owner: "Rajesh Kumar", flat: "A-0803", slot: "A-09" },
      { vehicle: "TS07XY9090", type: "Bike", owner: "Karthik Iyer", flat: "C-0902", slot: "C-05" },
      { vehicle: "KA41Q9981", type: "Car", owner: "Divya Shah", flat: "C-1201", slot: "C-11" },
      { vehicle: "TS22EF3344", type: "SUV", owner: "Arjun Mehta", flat: "A-1105", slot: "A-06" },
      { vehicle: "TS15GH7788", type: "Bike", owner: "Sana Sheikh", flat: "B-0703", slot: "B-08" },
      { vehicle: "TS03JK4455", type: "Car", owner: "Meera Pillai", flat: "B-0501", slot: "B-03" },
    ],
  },
  "community.amenities": {
    title: "Amenities", icon: CalendarCheck, blurb: "Configure amenities, capacity, hours, pricing and booking rules.",
    columns: [
      { key: "amenity", label: "Amenity" }, { key: "location", label: "Location" }, { key: "capacity", label: "Capacity" },
      { key: "hours", label: "Hours" }, { key: "price", label: "Price" }, { key: "bookingsToday", label: "Bookings Today" },
      { key: "status", label: "Status", type: "badge" },
    ],
    rows: [
      { amenity: "Gym", location: "Clubhouse, Level 1", capacity: 20, hours: "5:00 AM – 10:00 PM", price: "Free", bookingsToday: 12, status: "Operational" },
      { amenity: "Swimming Pool", location: "Clubhouse, Level 1", capacity: 30, hours: "6:00 AM – 8:00 PM", price: "Free", bookingsToday: 18, status: "Operational" },
      { amenity: "Tennis Court", location: "Sports Arena", capacity: 4, hours: "6:00 AM – 9:00 PM", price: "₹300/hr", bookingsToday: 6, status: "Operational" },
      { amenity: "Party Hall", location: "Clubhouse, Level 2", capacity: 100, hours: "By booking", price: "₹5,000/event", bookingsToday: 1, status: "Operational" },
      { amenity: "Kids Play Area", location: "Garden Zone", capacity: 25, hours: "7:00 AM – 7:00 PM", price: "Free", bookingsToday: 9, status: "Under Maintenance" },
      { amenity: "Badminton Court", location: "Sports Arena", capacity: 4, hours: "6:00 AM – 9:00 PM", price: "₹200/hr", bookingsToday: 4, status: "Operational" },
    ],
  },
  "visitors": {
    title: "Visitor Management", icon: UserPlus, blurb: "Community-wide visitor records, filterable by date, gate, flat and status.",
    columns: [
      { key: "visitor", label: "Visitor" }, { key: "flat", label: "Flat" }, { key: "purpose", label: "Purpose" },
      { key: "type", label: "Type" }, { key: "time", label: "Time" }, { key: "status", label: "Status", type: "badge" },
    ],
    rows: [
      { visitor: "Rahul Sharma", flat: "B-1204", purpose: "Personal visit", type: "Guest", time: "11:00 AM", status: "Checked-in" },
      { visitor: "Priya Reddy", flat: "A-0803", purpose: "Food delivery", type: "Delivery", time: "12:15 PM", status: "Completed" },
      { visitor: "Arjun Mehta", flat: "C-1502", purpose: "Airport drop", type: "Cab / Taxi", time: "2:00 PM", status: "Expected" },
      { visitor: "Zomato Delivery", flat: "B-0604", purpose: "Food delivery", type: "Delivery", time: "12:45 PM", status: "Checked-in" },
      { visitor: "Meena Iyer", flat: "C-1104", purpose: "Personal visit", type: "Guest", time: "9:00 AM", status: "Completed" },
      { visitor: "Unknown Visitor", flat: "—", purpose: "—", type: "Guest", time: "3:20 PM", status: "Rejected" },
      { visitor: "Ramesh Electric Works", flat: "C-1502", purpose: "Service call", type: "Vendor", time: "10:30 AM", status: "Checked-in" },
      { visitor: "Swati Kapoor", flat: "D-1102", purpose: "Family visit", type: "Guest", time: "6:00 PM", status: "Expected" },
    ],
  },
  "security.attendance": {
    title: "Guard Attendance", icon: Clock, blurb: "Shift attendance and clock-in/out history across all guards.",
    columns: [
      { key: "guard", label: "Guard" }, { key: "gate", label: "Gate" }, { key: "shift", label: "Shift" },
      { key: "checkIn", label: "Check-in" }, { key: "checkOut", label: "Check-out" }, { key: "status", label: "Status", type: "badge" },
    ],
    rows: [
      { guard: "Suresh Kumar", gate: "Main Gate", shift: "Day Shift (8 AM – 8 PM)", checkIn: "07:58 AM", checkOut: "—", status: "Active" },
      { guard: "Ramesh Yadav", gate: "Main Gate", shift: "Night Shift (8 PM – 8 AM)", checkIn: "07:55 PM", checkOut: "08:02 AM", status: "Completed" },
      { guard: "Irfan Ali", gate: "Gate 2 — Tower B", shift: "Day Shift (8 AM – 8 PM)", checkIn: "08:03 AM", checkOut: "—", status: "Active" },
      { guard: "Naveen Das", gate: "Service Gate", shift: "Rotational", checkIn: "08:10 AM", checkOut: "04:05 PM", status: "Completed" },
      { guard: "Arun Prasad", gate: "Clubhouse Gate", shift: "Day Shift (8 AM – 8 PM)", checkIn: "—", checkOut: "—", status: "Missed" },
    ],
  },
  "security.patrols": {
    title: "Patrols", icon: MapPinned, blurb: "Patrol compliance, checkpoint history and missed checkpoints.",
    columns: [
      { key: "route", label: "Route" }, { key: "guard", label: "Guard" }, { key: "date", label: "Date" },
      { key: "checkpoints", label: "Checkpoints" }, { key: "compliance", label: "Compliance" }, { key: "status", label: "Status", type: "badge" },
    ],
    rows: [
      { route: "Perimeter Route A", guard: "Suresh Kumar", date: "Today", checkpoints: "2 of 6", compliance: "33%", status: "In Progress" },
      { route: "Night Route", guard: "Ramesh Yadav", date: "Yesterday", checkpoints: "6 of 6", compliance: "100%", status: "Completed" },
      { route: "Perimeter Route A", guard: "Irfan Ali", date: "2 days ago", checkpoints: "5 of 6", compliance: "83%", status: "Missed Checkpoint" },
      { route: "Clubhouse Loop", guard: "Naveen Das", date: "2 days ago", checkpoints: "4 of 4", compliance: "100%", status: "Completed" },
      { route: "Service Block Route", guard: "Arun Prasad", date: "3 days ago", checkpoints: "3 of 5", compliance: "60%", status: "Missed Checkpoint" },
    ],
  },
  "security.incidents": {
    title: "Incidents", icon: AlertTriangle, blurb: "Security incidents reported by guards, with assignment and status tracking.",
    columns: [
      { key: "id", label: "Incident ID" }, { key: "category", label: "Category" }, { key: "location", label: "Location" },
      { key: "reportedBy", label: "Reported By" }, { key: "time", label: "Time" }, { key: "status", label: "Status", type: "badge" },
    ],
    rows: [
      { id: "INC-241", category: "Vehicle Issue", location: "Visitor Parking · V-06", reportedBy: "Suresh Kumar", time: "Today, 9:40 AM", status: "Open" },
      { id: "INC-238", category: "Suspicious Activity", location: "Tower C Basement", reportedBy: "Ramesh Yadav", time: "Yesterday, 11:20 PM", status: "Under Review" },
      { id: "INC-235", category: "Visitor Issue", location: "Main Gate", reportedBy: "Suresh Kumar", time: "2 days ago", status: "Under Review" },
      { id: "INC-230", category: "Property Damage", location: "Children's Park", reportedBy: "Suresh Kumar", time: "3 days ago", status: "Resolved" },
      { id: "INC-227", category: "Safety Issue", location: "Tower B Lift", reportedBy: "Irfan Ali", time: "5 days ago", status: "Resolved" },
    ],
  },
  "security.sos": {
    title: "SOS / Alerts", icon: Siren, blurb: "Emergency alerts triggered by residents and guards.",
    columns: [
      { key: "id", label: "Alert ID" }, { key: "location", label: "Flat / Gate" }, { key: "triggeredBy", label: "Triggered By" },
      { key: "time", label: "Time" }, { key: "responder", label: "Response Guard" }, { key: "status", label: "Status", type: "badge" },
    ],
    rows: [
      { id: "SOS-118", location: "B-1204", triggeredBy: "Ananya Rao", time: "Today, 8:12 PM", responder: "Suresh Kumar", status: "Resolved" },
      { id: "SOS-114", location: "Main Gate", triggeredBy: "Suresh Kumar", time: "6 days ago", responder: "Ramesh Yadav", status: "Resolved" },
      { id: "SOS-109", location: "D-1102", triggeredBy: "Vikram Nair", time: "2 weeks ago", responder: "Irfan Ali", status: "Resolved" },
    ],
  },
  "finance.maintenance": {
    title: "Maintenance Billing", icon: Receipt, blurb: "Generate and track maintenance bills across all flats.",
    columns: [
      { key: "flat", label: "Flat" }, { key: "resident", label: "Resident" }, { key: "period", label: "Period" },
      { key: "amount", label: "Amount", type: "currency" }, { key: "dueDate", label: "Due Date" }, { key: "status", label: "Status", type: "badge" },
    ],
    rows: [
      { flat: "B-1204", resident: "Ananya Rao", period: "Sep 2026", amount: 4250, dueDate: "10 Sep 2026", status: "Pending" },
      { flat: "A-0803", resident: "Rajesh Kumar", period: "Sep 2026", amount: 3800, dueDate: "10 Sep 2026", status: "Paid" },
      { flat: "D-1102", resident: "Vikram Nair", period: "Sep 2026", amount: 5200, dueDate: "10 Sep 2026", status: "Overdue" },
      { flat: "C-0902", resident: "Karthik Iyer", period: "Sep 2026", amount: 4000, dueDate: "10 Sep 2026", status: "Paid" },
      { flat: "B-0501", resident: "Meera Pillai", period: "Sep 2026", amount: 3600, dueDate: "10 Sep 2026", status: "Pending" },
      { flat: "C-1201", resident: "Divya Shah", period: "Sep 2026", amount: 4400, dueDate: "10 Sep 2026", status: "Paid" },
      { flat: "A-1105", resident: "Arjun Mehta", period: "Sep 2026", amount: 4100, dueDate: "10 Sep 2026", status: "Overdue" },
    ],
  },
  "finance.utilities": {
    title: "Utility Billing", icon: Wallet, blurb: "Electricity, water and other utility charges by flat.",
    columns: [
      { key: "flat", label: "Flat" }, { key: "utility", label: "Utility" }, { key: "period", label: "Period" },
      { key: "units", label: "Units" }, { key: "amount", label: "Amount", type: "currency" }, { key: "status", label: "Status", type: "badge" },
    ],
    rows: [
      { flat: "B-1204", utility: "Electricity", period: "Aug 2026", units: "240 kWh", amount: 2160, status: "Paid" },
      { flat: "B-1204", utility: "Water", period: "Aug 2026", units: "18 KL", amount: 540, status: "Paid" },
      { flat: "A-0803", utility: "Electricity", period: "Aug 2026", units: "190 kWh", amount: 1710, status: "Pending" },
      { flat: "D-1102", utility: "Electricity", period: "Aug 2026", units: "310 kWh", amount: 2790, status: "Overdue" },
      { flat: "C-0902", utility: "Water", period: "Aug 2026", units: "15 KL", amount: 450, status: "Paid" },
      { flat: "C-1201", utility: "Electricity", period: "Aug 2026", units: "205 kWh", amount: 1845, status: "Pending" },
    ],
  },
  "finance.payments": {
    title: "Payments", icon: Wallet, blurb: "All successful, pending, failed and refunded transactions.",
    columns: [
      { key: "txnId", label: "Txn ID" }, { key: "resident", label: "Resident" }, { key: "amount", label: "Amount", type: "currency" },
      { key: "method", label: "Method" }, { key: "status", label: "Status", type: "badge" }, { key: "date", label: "Date" },
    ],
    rows: [
      { txnId: "TXN-58231", resident: "Ananya Rao", amount: 4250, method: "UPI", status: "Success", date: "Today, 11:32 AM" },
      { txnId: "TXN-58219", resident: "Rajesh Kumar", amount: 3800, method: "Card", status: "Success", date: "Today, 9:10 AM" },
      { txnId: "TXN-58204", resident: "Divya Shah", amount: 4400, method: "Net Banking", status: "Success", date: "Yesterday" },
      { txnId: "TXN-58190", resident: "Vikram Nair", amount: 5200, method: "UPI", status: "Failed", date: "Yesterday" },
      { txnId: "TXN-58177", resident: "Meera Pillai", amount: 3600, method: "UPI", status: "Pending", date: "2 days ago" },
      { txnId: "TXN-58150", resident: "Arjun Mehta", amount: 1200, method: "Card", status: "Refunded", date: "4 days ago" },
    ],
  },
  "finance.expenses": {
    title: "Expenses", icon: Receipt, blurb: "Community operating expenses, categorised and vendor-linked.",
    columns: [
      { key: "category", label: "Category" }, { key: "vendor", label: "Vendor" }, { key: "amount", label: "Amount", type: "currency" },
      { key: "approvedBy", label: "Approved By" }, { key: "date", label: "Date" }, { key: "status", label: "Status", type: "badge" },
    ],
    rows: [
      { category: "Housekeeping", vendor: "CleanPro Services", amount: 42000, approvedBy: "Deepak Verma", date: "1 Sep 2026", status: "Approved" },
      { category: "Electricity (common)", vendor: "BESCOM", amount: 118500, approvedBy: "Kavita Iyer", date: "1 Sep 2026", status: "Approved" },
      { category: "Lift Maintenance", vendor: "Otis Services", amount: 26000, approvedBy: "Deepak Verma", date: "28 Aug 2026", status: "Approved" },
      { category: "Landscaping", vendor: "Green Thumb Gardens", amount: 15500, approvedBy: "Deepak Verma", date: "25 Aug 2026", status: "Pending" },
      { category: "Security Equipment", vendor: "SecureTech", amount: 34000, approvedBy: "Kavita Iyer", date: "20 Aug 2026", status: "Pending" },
    ],
  },
  "finance.ledger": {
    title: "Ledger", icon: FileText, blurb: "Full financial ledger of community transactions.",
    columns: [
      { key: "date", label: "Date" }, { key: "description", label: "Description" }, { key: "type", label: "Type", type: "badge" },
      { key: "amount", label: "Amount", type: "currency" }, { key: "balance", label: "Balance", type: "currency" },
    ],
    rows: [
      { date: "1 Sep 2026", description: "Opening balance", type: "Credit", amount: 0, balance: 2450000 },
      { date: "2 Sep 2026", description: "Maintenance collections", type: "Credit", amount: 186000, balance: 2636000 },
      { date: "3 Sep 2026", description: "Housekeeping payment", type: "Debit", amount: 42000, balance: 2594000 },
      { date: "4 Sep 2026", description: "Electricity (common)", type: "Debit", amount: 118500, balance: 2475500 },
      { date: "5 Sep 2026", description: "Utility collections", type: "Credit", amount: 24000, balance: 2499500 },
      { date: "6 Sep 2026", description: "Lift maintenance", type: "Debit", amount: 26000, balance: 2473500 },
    ],
  },
  "operations.requests": {
    title: "Service Requests", icon: Wrench, blurb: "Assign, escalate and track resolution of resident service requests.",
    columns: [
      { key: "ticket", label: "Ticket ID" }, { key: "category", label: "Category" }, { key: "flat", label: "Flat" },
      { key: "assignedTo", label: "Assigned To" }, { key: "sla", label: "SLA" }, { key: "status", label: "Status", type: "badge" },
    ],
    rows: [
      { ticket: "SR-1043", category: "Electrical", flat: "B-1204", assignedTo: "Ramesh Electric Works", sla: "Due in 2 hrs", status: "In Progress" },
      { ticket: "SR-1042", category: "Plumbing", flat: "C-0902", assignedTo: "Ganesh Plumbing", sla: "Due in 4 hrs", status: "Open" },
      { ticket: "SR-1038", category: "Carpentry", flat: "A-0803", assignedTo: "Woodcraft Services", sla: "Overdue by 1 day", status: "Waiting" },
      { ticket: "SR-1035", category: "Housekeeping", flat: "B-0501", assignedTo: "Lakshmi Devi", sla: "—", status: "Resolved" },
      { ticket: "SR-1030", category: "Security", flat: "Main Gate", assignedTo: "Suresh Kumar", sla: "—", status: "Resolved" },
      { ticket: "SR-1027", category: "Electrical", flat: "D-1102", assignedTo: "Ramesh Electric Works", sla: "—", status: "Resolved" },
    ],
  },
  "operations.vendors": {
    title: "Vendors", icon: Store, blurb: "Approve, suspend and manage marketplace vendors.",
    columns: [
      { key: "vendor", label: "Vendor" }, { key: "category", label: "Category" }, { key: "contact", label: "Contact" },
      { key: "rating", label: "Rating", type: "rating" }, { key: "status", label: "Status", type: "badge" },
    ],
    rows: [
      { vendor: "Fresh Mart Grocery", category: "Grocery", contact: "Anil Gupta", rating: 4.6, status: "Active" },
      { vendor: "MedPlus Pharmacy", category: "Pharmacy", contact: "Sunita Rao", rating: 4.4, status: "Pending" },
      { vendor: "Ramesh Electric Works", category: "Maintenance vendor", contact: "Ramesh Prasad", rating: 4.9, status: "Active" },
      { vendor: "CleanPro Services", category: "Maintenance vendor", contact: "Farhan Sheikh", rating: 4.5, status: "Active" },
      { vendor: "Glow Salon", category: "Salon", contact: "Nisha Verma", rating: 4.7, status: "Active" },
      { vendor: "SecureTech", category: "Maintenance vendor", contact: "Ajay Bhatia", rating: 4.2, status: "Suspended" },
    ],
  },
  "marketplace.products": {
    title: "Marketplace Products", icon: Store, blurb: "Products listed by approved vendors.",
    columns: [
      { key: "product", label: "Product" }, { key: "vendor", label: "Vendor" }, { key: "category", label: "Category" },
      { key: "price", label: "Price", type: "currency" }, { key: "stock", label: "Stock" }, { key: "status", label: "Status", type: "badge" },
    ],
    rows: [
      { product: "Alphonso Mangoes 2kg", vendor: "Fresh Mart Grocery", category: "Grocery", price: 860, stock: 42, status: "In Stock" },
      { product: "Amul Milk 1L", vendor: "Fresh Mart Grocery", category: "Milk", price: 66, stock: 120, status: "In Stock" },
      { product: "Paracetamol Strip", vendor: "MedPlus Pharmacy", category: "Pharmacy", price: 32, stock: 8, status: "Low Stock" },
      { product: "Hair Spa Kit", vendor: "Glow Salon", category: "Salon", price: 1200, stock: 0, status: "Out of Stock" },
      { product: "Vitamin C Tablets", vendor: "MedPlus Pharmacy", category: "Pharmacy", price: 240, stock: 55, status: "In Stock" },
    ],
  },
  "marketplace.services": {
    title: "Marketplace Services", icon: CalendarCheck, blurb: "Appointment-based services offered by vendors.",
    columns: [
      { key: "service", label: "Service" }, { key: "vendor", label: "Vendor" }, { key: "category", label: "Category" },
      { key: "price", label: "Price", type: "currency" }, { key: "duration", label: "Duration" }, { key: "status", label: "Status", type: "badge" },
    ],
    rows: [
      { service: "Haircut & Styling", vendor: "Glow Salon", category: "Salon", price: 450, duration: "45 min", status: "Available" },
      { service: "Full Car Wash", vendor: "Shine Auto Care", category: "Car cleaning", price: 350, duration: "30 min", status: "Available" },
      { service: "General Health Checkup", vendor: "MedPlus Clinic", category: "Clinic", price: 600, duration: "20 min", status: "Available" },
      { service: "Deep House Cleaning", vendor: "CleanPro Services", category: "Maintenance vendor", price: 1500, duration: "3 hrs", status: "Unavailable" },
    ],
  },
  "marketplace.orders": {
    title: "Marketplace Orders", icon: Truck, blurb: "Order history and fulfilment status.",
    columns: [
      { key: "orderId", label: "Order ID" }, { key: "customer", label: "Customer" }, { key: "vendor", label: "Vendor" },
      { key: "amount", label: "Amount", type: "currency" }, { key: "status", label: "Status", type: "badge" }, { key: "date", label: "Date" },
    ],
    rows: [
      { orderId: "WCE-1048", customer: "Ananya Rao", vendor: "Fresh Mart Grocery", amount: 860, status: "Delivered", date: "Today" },
      { orderId: "WCE-1047", customer: "Karthik Iyer", vendor: "MedPlus Pharmacy", amount: 272, status: "Out for Delivery", date: "Today" },
      { orderId: "WCE-1045", customer: "Divya Shah", vendor: "Fresh Mart Grocery", amount: 430, status: "Delivered", date: "Yesterday" },
      { orderId: "WCE-1041", customer: "Arjun Mehta", vendor: "Glow Salon", amount: 1200, status: "Cancelled", date: "3 days ago" },
      { orderId: "WCE-1038", customer: "Meera Pillai", vendor: "Fresh Mart Grocery", amount: 660, status: "Delivered", date: "4 days ago" },
    ],
  },
  "marketplace.appointments": {
    title: "Marketplace Appointments", icon: CalendarCheck, blurb: "Booked appointments across salons, clinics and other services.",
    columns: [
      { key: "apptId", label: "Appointment ID" }, { key: "customer", label: "Customer" }, { key: "service", label: "Service" },
      { key: "vendor", label: "Vendor" }, { key: "time", label: "Date / Time" }, { key: "status", label: "Status", type: "badge" },
    ],
    rows: [
      { apptId: "APT-320", customer: "Ananya Rao", service: "Haircut & Styling", vendor: "Glow Salon", time: "Today, 4:00 PM", status: "Booked" },
      { apptId: "APT-318", customer: "Vikram Nair", service: "General Health Checkup", vendor: "MedPlus Clinic", time: "Today, 5:30 PM", status: "Booked" },
      { apptId: "APT-312", customer: "Divya Shah", service: "Full Car Wash", vendor: "Shine Auto Care", time: "Yesterday", status: "Completed" },
      { apptId: "APT-305", customer: "Rajesh Kumar", service: "Deep House Cleaning", vendor: "CleanPro Services", time: "3 days ago", status: "Cancelled" },
    ],
  },
  "marketplace.subscriptions": {
    title: "Marketplace Subscriptions", icon: RefreshCw, blurb: "Active and paused recurring subscriptions.",
    columns: [
      { key: "customer", label: "Customer" }, { key: "plan", label: "Plan" }, { key: "vendor", label: "Vendor" },
      { key: "frequency", label: "Frequency" }, { key: "nextBilling", label: "Next Billing" }, { key: "status", label: "Status", type: "badge" },
    ],
    rows: [
      { customer: "Ananya Rao", plan: "Daily Milk 1L", vendor: "Fresh Mart Grocery", frequency: "Daily", nextBilling: "Tomorrow", status: "Active" },
      { customer: "Karthik Iyer", plan: "Weekly Essentials", vendor: "Fresh Mart Grocery", frequency: "Weekly", nextBilling: "12 Sep 2026", status: "Active" },
      { customer: "Meera Pillai", plan: "Monthly Health Checkup", vendor: "MedPlus Clinic", frequency: "Monthly", nextBilling: "1 Oct 2026", status: "Paused" },
      { customer: "Divya Shah", plan: "Fortnightly Car Wash", vendor: "Shine Auto Care", frequency: "Fortnightly", nextBilling: "18 Sep 2026", status: "Cancelled" },
    ],
  },
  "communication.announcements": {
    title: "Announcements", icon: Megaphone, blurb: "Create, schedule and publish community announcements.",
    columns: [
      { key: "title", label: "Title" }, { key: "audience", label: "Audience" }, { key: "published", label: "Published" }, { key: "status", label: "Status", type: "badge" },
    ],
    rows: [
      { title: "Monsoon Market at the Clubhouse", audience: "All Residents", published: "5 Sep 2026", status: "Published" },
      { title: "Water Supply Maintenance — Tower B", audience: "Tower B", published: "6 Sep 2026, 6 AM", status: "Scheduled" },
      { title: "AGM Meeting Notice", audience: "All Residents", published: "3 Sep 2026", status: "Published" },
      { title: "Diwali Decoration Guidelines", audience: "All Residents", published: "—", status: "Draft" },
      { title: "Gym Equipment Upgrade", audience: "All Residents", published: "28 Aug 2026", status: "Published" },
    ],
  },
  "communication.notifications": {
    title: "Notification Centre", icon: Bell, blurb: "System, security, payment and emergency alerts.",
    columns: [
      { key: "type", label: "Type" }, { key: "message", label: "Message" }, { key: "recipients", label: "Recipients" },
      { key: "sent", label: "Sent" }, { key: "status", label: "Status", type: "badge" },
    ],
    rows: [
      { type: "Payment", message: "Maintenance due reminder — Sep 2026", recipients: "180 residents", sent: "Today, 9:00 AM", status: "Sent" },
      { type: "Security", message: "SOS alert acknowledged — B-1204", recipients: "Security team", sent: "Today, 8:14 PM", status: "Sent" },
      { type: "System", message: "Scheduled maintenance window tonight", recipients: "All residents", sent: "Today, 6:00 PM", status: "Scheduled" },
      { type: "Emergency", message: "Fire drill scheduled for Tower C", recipients: "Tower C", sent: "Yesterday", status: "Sent" },
      { type: "Security", message: "Missed patrol checkpoint alert", recipients: "Security Manager", sent: "Yesterday", status: "Sent" },
    ],
  },
  "reports": { title: "Reports & Analytics", icon: BarChart3, blurb: "Security, financial and operations reports with filters and charts." },
  "settings": { title: "Community Settings", icon: Settings, blurb: "Community info, buildings, gates, amenities and billing configuration." },
};

/* ============================================================================
   HELPERS
   ============================================================================ */

function formatINR(n) { return "₹" + n.toLocaleString("en-IN"); }
function initialsOf(name) { return name.split(" ").map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase(); }
function generateTempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/* ============================================================================
   GLOBAL STYLES (shared brand tokens with Resident & Guard apps)
   ============================================================================ */

function GlobalStyles() {
  return (
    <style>{`
      :root {
        --color-navy-900: #14213D; --color-navy-800: #1B2B4B; --color-navy-700: #24365E; --color-navy-50: #EEF1F7;
        --color-bg: #F5F6FA; --color-surface: #FFFFFF; --color-border: #E4E7EE;
        --color-marigold-500: #F2A93B; --color-marigold-600: #DB9424; --color-marigold-50: #FDF3DE;
        --color-text-primary: #1A2130; --color-text-secondary: #626B80; --color-text-tertiary: #697184;
        --color-success: #2F9E68; --color-success-bg: #E7F6EE;
        --color-danger: #D64545; --color-danger-bg: #FCEAEA;
        --color-warning: #C9860B; --color-warning-bg: #FDF3DC;
        --color-info: #3B6FD8; --color-info-bg: #EAF0FC;
        --color-success-fg: #237A50; --color-warning-fg: #8A5A00; --color-danger-fg: #B83232; --color-info-fg: #2F5DBF;
      }
      * { box-sizing: border-box; }
      .aapp-root { font-family: 'Inter', sans-serif; color: var(--color-text-primary); }
      .aapp-heading { font-family: 'Sora', sans-serif; }
      .aapp-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
      .aapp-scrollbar::-webkit-scrollbar-thumb { background: #D6DAE3; border-radius: 8px; }
      .aapp-scrollbar::-webkit-scrollbar-track { background: transparent; }
      @keyframes aapp-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      .aapp-animate-in { animation: aapp-fade-in 0.2s ease-out; }
      @keyframes aapp-toast-in { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
      .aapp-toast { animation: aapp-toast-in 0.2s ease-out; }
      .aapp-focus:focus-visible { outline: 2px solid var(--color-navy-700); outline-offset: 2px; }
      .aapp-btn { font-weight: 600; transition: filter .15s ease, transform .1s ease; }
      .aapp-btn:active { transform: scale(0.98); }
      .aapp-row:hover, .aapp-row:focus-visible { background: var(--color-bg); }
      .aapp-row:focus-visible { outline: 2px solid var(--color-navy-700); outline-offset: -2px; }
      .aapp-nav-item:hover { background: rgba(255,255,255,0.06); }
      .aapp-icon-btn { transition: background-color .15s ease; }
      .aapp-icon-btn:hover { background: var(--color-navy-50); }
      .aapp-stat-link { transition: border-color .15s ease, box-shadow .15s ease; }
      .aapp-stat-link:hover { border-color: #C9CFDB !important; box-shadow: 0 2px 8px rgba(20,33,61,0.06); }
      @keyframes aapp-slide-in { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      .aapp-drawer-in { animation: aapp-slide-in 0.22s ease-out; }
      @keyframes aapp-slide-in-right { from { transform: translateX(24px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      .aapp-panel-in { animation: aapp-slide-in-right 0.2s ease-out; }
    `}</style>
  );
}

/* ============================================================================
   REUSABLE UI ATOMS (shared visual language, admin-density variants)
   ============================================================================ */

function Button({ variant = "primary", size = "md", icon: Icon, iconRight, className = "", children, style, ...props }) {
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-3.5 py-2 text-sm", lg: "px-5 py-2.5 text-sm" };
  const variants = {
    primary: { background: "var(--color-navy-800)", color: "#fff" },
    accent: { background: "var(--color-marigold-500)", color: "var(--color-navy-900)" },
    secondary: { background: "#fff", color: "var(--color-text-primary)", border: "1px solid var(--color-border)" },
    danger: { background: "var(--color-danger)", color: "#fff" },
    ghost: { background: "transparent", color: "var(--color-text-secondary)" },
  };
  return (
    <button
      className={`aapp-btn aapp-focus rounded-lg inline-flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${sizes[size]} ${className}`}
      style={{ ...variants[variant], ...style }}
      onMouseEnter={(e) => { if (!props.disabled) e.currentTarget.style.filter = "brightness(0.95)"; }}
      onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
      {...props}
    >
      {Icon && <Icon size={15} strokeWidth={2.25} />}
      {children}
      {iconRight && React.createElement(iconRight, { size: 15, strokeWidth: 2.25 })}
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
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap" style={{ color: t.fg, background: t.bg }}>{children}</span>;
}

const STATUS_TONE = { Active: "success", Inactive: "neutral", Suspended: "danger", Pending: "warning" };
function StatusBadge({ status }) { return <Badge tone={STATUS_TONE[status] || "neutral"}>{status}</Badge>; }

function Card({ children, className = "", padded = true, ...props }) {
  return <div className={`rounded-2xl bg-white ${padded ? "p-5" : ""} ${className}`} style={{ border: "1px solid var(--color-border)" }} {...props}>{children}</div>;
}

function Avatar({ initials, size = 34, tone }) {
  return <div className="rounded-full flex items-center justify-center font-semibold shrink-0" style={{ width: size, height: size, background: tone || "var(--color-navy-800)", color: "#fff", fontSize: size * 0.36 }}>{initials}</div>;
}

function Spinner({ size = 16, color = "currentColor" }) { return <Loader2 size={size} className="animate-spin" style={{ color }} />; }

function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: "var(--color-navy-50)" }}>
        <Icon size={24} strokeWidth={1.75} style={{ color: "var(--color-navy-700)" }} />
      </div>
      <h3 className="aapp-heading text-base font-semibold mb-1">{title}</h3>
      <p className="text-sm max-w-sm" style={{ color: "var(--color-text-secondary)" }}>{body}</p>
      {action}
    </div>
  );
}

function Field({ label, children, hint, error, required }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
        {label}{required && <span aria-hidden="true" style={{ color: "var(--color-danger)" }}> *</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>{hint}</p>}
      {error && <p role="alert" className="text-xs mt-1 font-medium flex items-center gap-1" style={{ color: "var(--color-danger-fg)" }}><AlertTriangle size={12} aria-hidden="true" />{error}</p>}
    </div>
  );
}

const inputStyle = { border: "1px solid var(--color-border)", background: "#fff" };
function TextInput({ invalid, ...props }) {
  return <input aria-invalid={invalid || undefined} className="aapp-focus w-full rounded-lg px-3.5 py-2.5 text-sm" style={{ ...inputStyle, ...(invalid ? { borderColor: "var(--color-danger)" } : null) }} {...props} />;
}
function Select({ children, ...props }) { return <select className="aapp-focus w-full rounded-lg px-3.5 py-2.5 text-sm bg-white" style={inputStyle} {...props}>{children}</select>; }

function Checkbox({ checked, onChange, label }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none py-1">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        aria-hidden="true"
        className="w-[18px] h-[18px] rounded-md flex items-center justify-center shrink-0 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2"
        style={{ background: checked ? "var(--color-navy-800)" : "#fff", border: `1.5px solid ${checked ? "var(--color-navy-800)" : "#B8BFCC"}`, outlineColor: "var(--color-navy-700)" }}
      >
        {checked && <Check size={12} style={{ color: "#fff" }} strokeWidth={3} />}
      </span>
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
}

function Modal({ open, onClose, title, subtitle, children, footer, width = "max-w-md" }) {
  const panelRef = useDialog(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0" style={{ background: "rgba(20,33,61,0.45)" }} onClick={onClose} />
      <div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        className={`relative w-full ${width} bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl aapp-animate-in max-h-[92vh] sm:max-h-[88vh] flex flex-col outline-none`}>
        <div className="flex items-start justify-between gap-3 px-5 sm:px-6 pt-5 pb-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <div><h2 className="aapp-heading text-lg font-bold">{title}</h2>{subtitle && <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{subtitle}</p>}</div>
          <button onClick={onClose} aria-label="Close" className="aapp-focus aapp-icon-btn w-9 h-9 -mr-1.5 -mt-1 rounded-full flex items-center justify-center shrink-0" style={{ color: "var(--color-text-secondary)" }}><X size={18} /></button>
        </div>
        <div className="px-5 sm:px-6 py-5 overflow-y-auto aapp-scrollbar">{children}</div>
        {footer && <div className="px-5 sm:px-6 py-4 flex items-center justify-end gap-3" style={{ borderTop: "1px solid var(--color-border)" }}>{footer}</div>}
      </div>
    </div>
  );
}

function Drawer({ open, onClose, title, subtitle, children, footer }) {
  const panelRef = useDialog(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div className="absolute inset-0" style={{ background: "rgba(20,33,61,0.4)" }} onClick={onClose} />
      <div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        className="relative w-full max-w-md bg-white h-full flex flex-col aapp-panel-in shadow-2xl outline-none">
        <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <div className="min-w-0"><h2 className="aapp-heading text-lg font-bold truncate">{title}</h2>{subtitle && <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{subtitle}</p>}</div>
          <button onClick={onClose} aria-label="Close" className="aapp-focus aapp-icon-btn w-9 h-9 -mr-1.5 -mt-1 rounded-full flex items-center justify-center shrink-0" style={{ color: "var(--color-text-secondary)" }}><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto aapp-scrollbar px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 flex items-center justify-end gap-3" style={{ borderTop: "1px solid var(--color-border)" }}>{footer}</div>}
      </div>
    </div>
  );
}

function ToastStack({ toasts, onDismiss }) {
  return (
    <div aria-live="polite" className="fixed top-4 right-4 left-4 sm:left-auto z-[300] flex flex-col gap-2.5 sm:w-[340px]">
      {toasts.map((t) => (
        <div key={t.id} role="status" className="aapp-toast rounded-xl bg-white shadow-lg px-4 py-3.5 flex items-start gap-3" style={{ border: "1px solid var(--color-border)" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: t.tone === "danger" ? "var(--color-danger-bg)" : "var(--color-success-bg)", color: t.tone === "danger" ? "var(--color-danger)" : "var(--color-success)" }}>
            {t.tone === "danger" ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          </div>
          <div className="flex-1 min-w-0"><p className="text-sm font-semibold leading-snug">{t.title}</p>{t.body && <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{t.body}</p>}</div>
          <button onClick={() => onDismiss(t.id)} aria-label="Dismiss notification" className="aapp-focus aapp-icon-btn -mr-1.5 -mt-1 w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ color: "var(--color-text-tertiary)" }}><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}

function ConfirmDialog({ open, onClose, onConfirm, title, body, confirmLabel = "Confirm", tone = "danger" }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-sm" footer={
      <>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm}>{confirmLabel}</Button>
      </>
    }>
      <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{body}</p>
    </Modal>
  );
}

/* Generic data table */
function DataTable({ columns, rows, onRowClick, emptyIcon, emptyTitle, emptyBody }) {
  if (!rows.length) return <EmptyState icon={emptyIcon} title={emptyTitle} body={emptyBody} />;
  return (
    <div className="overflow-x-auto aapp-scrollbar">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
            {columns.map((c) => (
              <th key={c.key} scope="col" className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--color-text-tertiary)" }}>{c.label}</th>
            ))}
            {onRowClick && <th aria-hidden="true" className="w-6" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || i}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={onRowClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onRowClick(row); } } : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              className={`aapp-row group ${onRowClick ? "cursor-pointer" : ""}`} style={{ borderBottom: "1px solid var(--color-border)" }}>
              {columns.map((c) => <td key={c.key} className="px-4 py-3.5 align-middle whitespace-nowrap">{c.render ? c.render(row) : row[c.key]}</td>)}
              {onRowClick && <td className="pr-4 py-3.5 align-middle w-6"><ChevronRight size={16} aria-hidden="true" className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity" style={{ color: "var(--color-text-tertiary)" }} /></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableToolbar({ search, onSearch, placeholder, filters, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mb-4">
      <div className="relative flex-1 sm:max-w-sm">
        <Search size={15} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }} />
        <input type="search" aria-label={placeholder || "Search"} value={search} onChange={(e) => onSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape" && search) onSearch(""); }} placeholder={placeholder || "Search…"} className="aapp-focus w-full rounded-lg pl-9 pr-9 py-2.5 text-sm [&::-webkit-search-cancel-button]:hidden" style={inputStyle} />
        {search && (
          <button type="button" onClick={() => onSearch("")} aria-label="Clear search" className="aapp-focus aapp-icon-btn absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center" style={{ color: "var(--color-text-tertiary)" }}><X size={14} /></button>
        )}
      </div>
      {filters}
      <div className="flex-1" />
      {action}
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, tone, onClick }) {
  const body = (
    <>
      <div className="flex items-center justify-between mb-2 gap-2">
        <span className="text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>{label}</span>
        {Icon && <Icon size={15} aria-hidden="true" style={{ color: tone || "var(--color-navy-700)" }} />}
      </div>
      <p className="aapp-heading text-2xl font-bold tabular-nums truncate">{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>{sub}</p>}
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="aapp-focus aapp-stat-link rounded-2xl bg-white p-4 text-left w-full" style={{ border: "1px solid var(--color-border)" }}>
        {body}
      </button>
    );
  }
  return <Card className="!p-4">{body}</Card>;
}

function SectionHeader({ title, action }) {
  return <div className="flex items-center justify-between mb-4"><h2 className="aapp-heading font-bold text-[15px]">{title}</h2>{action}</div>;
}

function SectionLink({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="aapp-focus inline-flex items-center gap-1 rounded-md px-2 py-1 -mr-2 text-xs font-semibold hover:underline" style={{ color: "var(--color-navy-700)" }}>
      {children}<ArrowRight size={13} aria-hidden="true" />
    </button>
  );
}

function PageHeader({ title, blurb, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div><h1 className="aapp-heading text-2xl font-bold">{title}</h1>{blurb && <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>{blurb}</p>}</div>
      {action}
    </div>
  );
}

/* ============================================================================
   LOGIN
   ============================================================================ */

function AdminLogin({ onLogin }) {
  const [step, setStep] = useState("creds");
  const [loading, setLoading] = useState(false);
  const handleContinue = (e) => { e.preventDefault(); setLoading(true); setTimeout(() => { setLoading(false); setStep("otp"); }, 700); };
  const handleVerify = (e) => { e.preventDefault(); setLoading(true); setTimeout(() => { setLoading(false); onLogin(); }, 700); };
  return (
    <div className="min-h-screen w-full flex" style={{ background: "var(--color-bg)" }}>
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between p-12 relative overflow-hidden" style={{ background: "linear-gradient(155deg, var(--color-navy-900), var(--color-navy-700))" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--color-marigold-500)" }}><Building2 size={19} style={{ color: "var(--color-navy-900)" }} /></div>
          <span className="aapp-heading text-white font-semibold text-lg">RUhome</span>
        </div>
        <div>
          <h1 className="aapp-heading text-white text-4xl font-bold leading-tight mb-4">The control center<br />for your entire<br />community.</h1>
          <p className="text-sm max-w-sm" style={{ color: "rgba(255,255,255,0.68)" }}>Manage residents, guards, staff, billing, security and more — all from one admin portal.</p>
        </div>
        <div className="flex flex-col gap-3">
          {[{ icon: Users, text: "Create and manage every user & role" }, { icon: Wallet, text: "Full financial visibility and control" }, { icon: ShieldCheck, text: "Complete security oversight" }].map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.1)" }}><f.icon size={15} style={{ color: "var(--color-marigold-500)" }} /></div>
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.82)" }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[380px]">
          {step === "creds" ? (
            <form onSubmit={handleContinue}>
              <h2 className="aapp-heading text-2xl font-bold mb-1.5">Admin sign in</h2>
              <p className="text-sm mb-7" style={{ color: "var(--color-text-secondary)" }}>Sign in to manage RUhome.</p>
              <Field label="Email"><TextInput type="email" autoComplete="email" placeholder="priya.nair@ruhome.in" autoFocus /></Field>
              <Field label="Password"><TextInput type="password" placeholder="••••••••" /></Field>
              <Button type="submit" variant="primary" size="lg" className="w-full mt-2" disabled={loading}>{loading ? <Spinner color="#fff" /> : "Continue"}</Button>
              <p className="text-xs text-center mt-6" style={{ color: "var(--color-text-tertiary)" }}>Demo: any email / password works</p>
            </form>
          ) : (
            <form onSubmit={handleVerify}>
              <h2 className="aapp-heading text-2xl font-bold mb-1.5">Verify it's you</h2>
              <p className="text-sm mb-7" style={{ color: "var(--color-text-secondary)" }}>Enter the 6-digit code sent to your registered device.</p>
              <div className="flex gap-2 mb-6">
                {Array.from({ length: 6 }).map((_, i) => <input key={i} maxLength={1} className="aapp-focus w-full h-12 text-center text-lg font-semibold rounded-lg" style={inputStyle} autoFocus={i === 0} />)}
              </div>
              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>{loading ? <Spinner color="#fff" /> : "Verify & Sign in"}</Button>
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

function SidebarNav({ route, onNavigate, collapsed }) {
  const topKey = route.split(".")[0];
  const [openGroups, setOpenGroups] = useState(() => {
    const g = {};
    NAV.forEach((n) => { if (n.children) g[n.key] = n.key === topKey; });
    return g;
  });
  const toggleGroup = (key) => setOpenGroups((p) => ({ ...p, [key]: !p[key] }));
  // Keep the active section expanded when the route changes from elsewhere (dashboard links, quick jump).
  useEffect(() => { setOpenGroups((p) => (p[topKey] === false ? { ...p, [topKey]: true } : p)); }, [topKey]);

  return (
    <>
      <div className={`flex items-center gap-2.5 px-4 h-16 shrink-0 ${collapsed ? "justify-center px-0" : ""}`}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--color-marigold-500)" }}><Building2 size={18} style={{ color: "var(--color-navy-900)" }} /></div>
        {!collapsed && <div className="min-w-0"><p className="aapp-heading text-white font-semibold text-sm leading-tight truncate">RUhome</p><p className="text-[11px] leading-tight" style={{ color: "rgba(255,255,255,0.6)" }}>Admin Portal</p></div>}
      </div>
      <nav aria-label="Admin sections" className="flex-1 overflow-y-auto aapp-scrollbar px-3 py-2 flex flex-col gap-0.5">
        {NAV.map((item) => {
          const active = topKey === item.key.split(".")[0] && !item.children;
          const groupActive = item.children && topKey === item.key;
          if (!item.children) {
            return (
              <button key={item.key} onClick={() => onNavigate(item.key)} title={collapsed ? item.label : undefined} aria-label={collapsed ? item.label : undefined} aria-current={active ? "page" : undefined}
                className={`aapp-focus ${active ? "" : "aapp-nav-item"} w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${collapsed ? "justify-center" : ""}`}
                style={{ background: active ? "rgba(242,169,59,0.14)" : undefined, color: active ? "var(--color-marigold-500)" : "rgba(255,255,255,0.78)" }}>
                <item.icon size={17} strokeWidth={2} className="shrink-0" aria-hidden="true" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          }
          return (
            <div key={item.key}>
              <button onClick={() => (collapsed ? onNavigate(item.children[0].key) : toggleGroup(item.key))} title={collapsed ? item.label : undefined}
                aria-label={collapsed ? item.label : undefined} aria-expanded={collapsed ? undefined : !!openGroups[item.key]}
                className={`aapp-focus ${groupActive && collapsed ? "" : "aapp-nav-item"} w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${collapsed ? "justify-center" : ""}`}
                style={{ background: groupActive && collapsed ? "rgba(242,169,59,0.14)" : undefined, color: groupActive ? "var(--color-marigold-500)" : "rgba(255,255,255,0.78)" }}>
                <item.icon size={17} strokeWidth={2} className="shrink-0" aria-hidden="true" />
                {!collapsed && <><span className="truncate flex-1 text-left">{item.label}</span><ChevronDown size={14} aria-hidden="true" style={{ transform: openGroups[item.key] ? "rotate(180deg)" : "none", transition: "transform .15s" }} /></>}
              </button>
              {!collapsed && openGroups[item.key] && (
                <div className="ml-[26px] pl-3 flex flex-col gap-0.5 mt-0.5 mb-1" style={{ borderLeft: "1px solid rgba(255,255,255,0.12)" }}>
                  {item.children.map((c) => (
                    <button key={c.key} onClick={() => onNavigate(c.key)} aria-current={route === c.key ? "page" : undefined}
                      className={`aapp-focus ${route === c.key ? "" : "aapp-nav-item"} text-left rounded-lg px-3 py-2 text-[13px] font-medium truncate`}
                      style={{ background: route === c.key ? "rgba(242,169,59,0.14)" : undefined, color: route === c.key ? "var(--color-marigold-500)" : "rgba(255,255,255,0.7)" }}>
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}

function Sidebar({ route, onNavigate, collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const mobileRef = useDialog(mobileOpen, onCloseMobile);
  return (
    <>
      <aside className={`hidden md:flex flex-col shrink-0 h-screen sticky top-0 transition-[width] duration-200 relative ${collapsed ? "w-[76px]" : "w-[248px]"}`} style={{ background: "var(--color-navy-900)" }}>
        <SidebarNav route={route} onNavigate={onNavigate} collapsed={collapsed} />
        <button onClick={onToggleCollapse} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="aapp-focus absolute -right-3.5 top-[52px] w-7 h-7 rounded-full flex items-center justify-center shadow" style={{ background: "#fff", border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}>
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[150] flex">
          <div className="absolute inset-0" style={{ background: "rgba(20,33,61,0.5)" }} onClick={onCloseMobile} />
          <div ref={mobileRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Navigation"
            className="relative w-[280px] max-w-[85vw] h-full flex flex-col aapp-drawer-in outline-none" style={{ background: "var(--color-navy-900)" }}>
            <button onClick={onCloseMobile} aria-label="Close navigation" className="aapp-focus absolute top-3.5 right-3 w-9 h-9 rounded-full flex items-center justify-center z-10" style={{ color: "rgba(255,255,255,0.85)", background: "rgba(255,255,255,0.08)" }}>
              <X size={17} />
            </button>
            <SidebarNav route={route} onNavigate={(k) => { onNavigate(k); onCloseMobile(); }} collapsed={false} />
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================================================
   QUICK JUMP (Ctrl/⌘ + K) — 35+ admin screens are hard to reach through
   nested menus; this lets admins type a page name and go.
   ============================================================================ */

const JUMP_TARGETS = NAV.flatMap((item) =>
  item.children
    ? item.children.map((c) => ({ key: c.key, label: c.label, section: item.label, icon: item.icon }))
    : [{ key: item.key, label: item.label, section: "", icon: item.icon }]
);

function QuickJump({ open, onClose, onNavigate }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const panelRef = useDialog(open, onClose);
  const inputRef = useRef(null);

  useEffect(() => { if (open) { setQuery(""); setActive(0); setTimeout(() => inputRef.current?.focus(), 0); } }, [open]);

  const q = query.trim().toLowerCase();
  const results = q
    ? JUMP_TARGETS.filter((t) => `${t.section} ${t.label}`.toLowerCase().includes(q))
    : JUMP_TARGETS;

  if (!open) return null;
  const go = (t) => { if (!t) return; onNavigate(t.key); onClose(); };
  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter") { e.preventDefault(); go(results[active]); }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0" style={{ background: "rgba(20,33,61,0.45)" }} onClick={onClose} />
      <div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Jump to page"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl aapp-animate-in overflow-hidden outline-none">
        <div className="flex items-center gap-3 px-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <Search size={17} aria-hidden="true" style={{ color: "var(--color-text-tertiary)" }} />
          <input ref={inputRef} value={query} onChange={(e) => { setQuery(e.target.value); setActive(0); }} onKeyDown={onKeyDown}
            placeholder="Jump to a page — e.g. payments, incidents, flats" aria-label="Search pages"
            role="combobox" aria-expanded="true" aria-controls="aapp-jump-list" aria-activedescendant={results[active] ? `jump-${results[active].key}` : undefined}
            className="flex-1 py-4 text-sm outline-none bg-transparent" />
          <kbd className="hidden sm:inline text-[11px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "var(--color-bg)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}>Esc</kbd>
        </div>
        <ul id="aapp-jump-list" role="listbox" className="max-h-[50vh] overflow-y-auto aapp-scrollbar py-2">
          {results.length === 0 && <li className="px-4 py-8 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>No pages match “{query}”.</li>}
          {results.map((t, i) => (
            <li key={t.key} id={`jump-${t.key}`} role="option" aria-selected={i === active}
              onMouseEnter={() => setActive(i)} onClick={() => go(t)}
              className="mx-2 flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer"
              style={{ background: i === active ? "var(--color-navy-50)" : "transparent" }}>
              <t.icon size={16} aria-hidden="true" style={{ color: "var(--color-navy-700)" }} />
              <span className="text-sm font-semibold">{t.label}</span>
              {t.section && <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{t.section}</span>}
              {i === active && <ArrowRight size={14} aria-hidden="true" className="ml-auto" style={{ color: "var(--color-text-tertiary)" }} />}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ============================================================================
   TOP BAR
   ============================================================================ */

const NOTIF_TYPE_META = {
  Payment: { icon: Wallet, tone: "info" },
  Security: { icon: ShieldAlert, tone: "warning" },
  System: { icon: Bell, tone: "neutral" },
  Emergency: { icon: AlertTriangle, tone: "danger" },
};
const NOTIF_TONE_BG = { info: "var(--color-info-bg)", warning: "var(--color-warning-bg)", danger: "var(--color-danger-bg)", neutral: "#EEF0F4" };
const NOTIF_TONE_FG = { info: "var(--color-info)", warning: "var(--color-warning)", danger: "var(--color-danger)", neutral: "var(--color-text-secondary)" };

function TopBar({ onOpenMobileNav, onOpenJump, breadcrumb, onNavigate, onLogout }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifications = PLACEHOLDER_META["communication.notifications"].rows;
  useEscape(notifOpen || userMenuOpen, () => { setNotifOpen(false); setUserMenuOpen(false); });
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
  const [section, page] = breadcrumb.includes(" / ") ? breadcrumb.split(" / ") : [null, breadcrumb];
  return (
    <header className="sticky top-0 z-[80] h-16 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 shrink-0" style={{ background: "#fff", borderBottom: "1px solid var(--color-border)" }}>
      <button onClick={onOpenMobileNav} aria-label="Open navigation" className="aapp-focus aapp-icon-btn md:hidden w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ color: "var(--color-text-secondary)" }}><Menu size={20} /></button>
      <nav aria-label="Breadcrumb" className="min-w-0">
        <p className="text-sm truncate">
          {section && <span className="hidden sm:inline" style={{ color: "var(--color-text-secondary)" }}>{section}<span aria-hidden="true" className="mx-1.5">/</span></span>}
          <span className="font-semibold" aria-current="page">{page}</span>
        </p>
      </nav>
      <div className="flex-1" />
      <button onClick={onOpenJump} aria-label="Jump to page" aria-keyshortcuts={isMac ? "Meta+K" : "Control+K"}
        className="aapp-focus hidden lg:flex items-center gap-2 rounded-lg pl-3 pr-2 py-2 text-sm w-64" style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}>
        <Search size={15} aria-hidden="true" />
        <span className="flex-1 text-left">Jump to page…</span>
        <kbd className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-white" style={{ border: "1px solid var(--color-border)" }}>{isMac ? "⌘K" : "Ctrl K"}</kbd>
      </button>
      <button onClick={onOpenJump} aria-label="Jump to page" className="aapp-focus aapp-icon-btn lg:hidden w-10 h-10 rounded-full inline-flex items-center justify-center" style={{ color: "var(--color-text-secondary)" }}>
        <Search size={19} />
      </button>
      <div className="flex items-center gap-1.5 relative">
        <button onClick={() => { setNotifOpen((o) => !o); setUserMenuOpen(false); }} aria-label={`Notifications, ${notifications.length} new`} aria-expanded={notifOpen} aria-haspopup="true"
          className="aapp-focus aapp-icon-btn relative w-10 h-10 rounded-full inline-flex items-center justify-center" style={{ background: notifOpen ? "var(--color-navy-50)" : undefined, color: "var(--color-text-secondary)" }}>
          <Bell size={19} strokeWidth={2} />
          <span aria-hidden="true" className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: "var(--color-danger)", color: "#fff" }}>{notifications.length}</span>
        </button>
        {notifOpen && (
          <>
            <div className="fixed inset-0 z-[95]" onClick={() => setNotifOpen(false)} />
            <div className="absolute -right-12 sm:right-0 top-14 w-[calc(100vw-24px)] max-w-[340px] bg-white rounded-2xl shadow-2xl z-[96] aapp-animate-in overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
              <div className="px-4 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--color-border)" }}>
                <p className="text-sm font-bold">Notifications</p>
                <span className="text-xs font-semibold" style={{ color: "var(--color-text-tertiary)" }}>{notifications.length} new</span>
              </div>
              <div className="max-h-80 overflow-y-auto aapp-scrollbar">
                {notifications.slice(0, 5).map((n, i) => {
                  const meta = NOTIF_TYPE_META[n.type] || NOTIF_TYPE_META.System;
                  return (
                    <div key={i} className="flex gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: NOTIF_TONE_BG[meta.tone] }}>
                        <meta.icon size={14} aria-hidden="true" style={{ color: NOTIF_TONE_FG[meta.tone] }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold leading-snug">{n.message}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>{n.type} · {n.sent}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => { onNavigate("communication.notifications"); setNotifOpen(false); }}
                className="aapp-focus aapp-icon-btn w-full text-center px-4 py-3 text-sm font-bold"
                style={{ color: "var(--color-navy-700)" }}
              >
                View all notifications
              </button>
            </div>
          </>
        )}
      </div>
      <div className="relative ml-1">
        <button onClick={() => { setUserMenuOpen((o) => !o); setNotifOpen(false); }} aria-label={`Account menu for ${ADMIN.name}`} aria-expanded={userMenuOpen} aria-haspopup="true"
          className="aapp-focus aapp-icon-btn flex items-center gap-2 pl-1 pr-1 sm:pr-2 py-1 rounded-full" style={{ background: userMenuOpen ? "var(--color-navy-50)" : undefined }}>
          <Avatar initials={ADMIN.initials} size={32} />
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold leading-tight">{ADMIN.name}</p>
            <p className="text-[11px] leading-tight" style={{ color: "var(--color-text-tertiary)" }}>{ADMIN.role}</p>
          </div>
          <ChevronDown size={14} className="hidden sm:block" style={{ color: "var(--color-text-tertiary)" }} />
        </button>
        {userMenuOpen && (
          <>
            <div className="fixed inset-0 z-[95]" onClick={() => setUserMenuOpen(false)} />
            <div className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-2xl z-[96] aapp-animate-in overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
              <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
                <Avatar initials={ADMIN.initials} size={40} />
                <div className="min-w-0"><p className="text-sm font-semibold truncate">{ADMIN.name}</p><p className="text-xs truncate" style={{ color: "var(--color-text-secondary)" }}>{ADMIN.email}</p></div>
              </div>
              <button onClick={() => { setUserMenuOpen(false); onNavigate("settings"); }} className="aapp-focus aapp-icon-btn w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold"><Settings size={16} aria-hidden="true" />Community settings</button>
              <button onClick={onLogout} className="aapp-focus aapp-icon-btn w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold" style={{ color: "var(--color-danger-fg)", borderTop: "1px solid var(--color-border)" }}><LogOut size={16} aria-hidden="true" />Log out</button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

/* ============================================================================
   DASHBOARD (PHASE 1)
   ============================================================================ */

function AttentionItem({ icon: Icon, tone, title, detail, actionLabel, onClick }) {
  const fg = `var(--color-${tone}-fg)`;
  return (
    <button type="button" onClick={onClick} className="aapp-focus aapp-stat-link flex items-start gap-3 rounded-xl bg-white p-3.5 text-left w-full" style={{ border: "1px solid var(--color-border)" }}>
      <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `var(--color-${tone}-bg)` }}><Icon size={17} aria-hidden="true" style={{ color: fg }} /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">{title}</span>
        <span className="block text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{detail}</span>
      </span>
      <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold shrink-0 self-center" style={{ color: "var(--color-navy-700)" }}>{actionLabel}<ArrowRight size={13} aria-hidden="true" /></span>
    </button>
  );
}

function Dashboard({ onNavigate, users }) {
  const { community, security, finance, operations } = DASHBOARD_STATS;
  const pendingApprovals = users.filter((u) => u.status === "Pending").length;
  return (
    <div className="max-w-[1280px] mx-auto">
      <PageHeader title={`${greeting()}, ${ADMIN.name.split(" ")[0]}`} blurb="Here's how RUhome is doing today." />

      {/* NEEDS ATTENTION — the things an admin should act on first */}
      <section aria-labelledby="attention-heading" className="mb-7">
        <h2 id="attention-heading" className="aapp-heading font-bold text-[15px] mb-3">Needs your attention</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <AttentionItem icon={Siren} tone="danger" title={`${security.sosAlerts} SOS alert`} detail="Review the response and close it out" actionLabel="Review" onClick={() => onNavigate("security.sos")} />
          <AttentionItem icon={Clock} tone="danger" title={`${operations.slaBreaches} SLA breaches`} detail={`${operations.openRequests} service requests still open`} actionLabel="Assign" onClick={() => onNavigate("operations.requests")} />
          <AttentionItem icon={Wallet} tone="warning" title={`${formatINR(finance.outstanding)} outstanding`} detail="Overdue and pending maintenance bills" actionLabel="Follow up" onClick={() => onNavigate("finance.maintenance")} />
          <AttentionItem icon={UserCheck} tone="info" title={`${pendingApprovals} pending approval${pendingApprovals === 1 ? "" : "s"}`} detail="New accounts waiting to be activated" actionLabel="Review" onClick={() => onNavigate("users.all")} />
        </div>
      </section>

      {/* COMMUNITY */}
      <SectionHeader title="Community" action={<SectionLink onClick={() => onNavigate("users.all")}>View users</SectionLink>} />
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-7">
        <StatCard label="Total Users" value={community.totalUsers} icon={Users} onClick={() => onNavigate("users.all")} />
        <StatCard label="Residents" value={community.residents} icon={Home} onClick={() => onNavigate("users.residents")} />
        <StatCard label="Flats" value={community.flats} icon={Building2} sub={`${community.occupancy}% occupied`} onClick={() => onNavigate("community.flats")} />
        <StatCard label="Guards" value={community.guards} icon={Shield} onClick={() => onNavigate("users.guards")} />
        <StatCard label="Staff" value={community.staff} icon={Briefcase} onClick={() => onNavigate("users.staff")} />
        <StatCard label="Vendors" value={community.vendors} icon={Store} onClick={() => onNavigate("operations.vendors")} />
      </div>

      {/* SECURITY */}
      <SectionHeader title="Security" action={<SectionLink onClick={() => onNavigate("security.guards")}>View security</SectionLink>} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-7">
        <div className="grid grid-cols-2 gap-3 lg:col-span-2">
          <StatCard label="Visitors Today" value={security.visitorsToday} icon={UserPlus} onClick={() => onNavigate("visitors")} />
          <StatCard label="Active Visitors" value={security.activeVisitors} icon={UserCheck} sub="Inside the community now" onClick={() => onNavigate("visitors")} />
          <StatCard label="Incidents" value={security.incidents} icon={AlertTriangle} tone="var(--color-warning)" onClick={() => onNavigate("security.incidents")} />
          <StatCard label="SOS Alerts" value={security.sosAlerts} icon={Siren} tone="var(--color-danger)" onClick={() => onNavigate("security.sos")} />
        </div>
        <Card>
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--color-text-tertiary)" }}>Visitor activity (7 days)</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={VISITOR_TREND}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip cursor={{ fill: "var(--color-bg)" }} />
              <Bar dataKey="visitors" fill="var(--color-navy-800)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* FINANCE */}
      <SectionHeader title="Finance" action={<SectionLink onClick={() => onNavigate("finance.payments")}>View finance</SectionLink>} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-7">
        <div className="grid grid-cols-2 gap-3 lg:col-span-1">
          <StatCard label="Collected" value={formatINR(finance.collected)} icon={Wallet} tone="var(--color-success)" onClick={() => onNavigate("finance.payments")} />
          <StatCard label="Outstanding" value={formatINR(finance.outstanding)} icon={AlertTriangle} tone="var(--color-warning)" onClick={() => onNavigate("finance.maintenance")} />
          <StatCard label="Utility Billed" value={formatINR(finance.utilityBilled)} icon={Receipt} onClick={() => onNavigate("finance.utilities")} />
          <StatCard label="Recent Payments" value={finance.recentPayments} icon={CheckCircle2} tone="var(--color-success)" onClick={() => onNavigate("finance.payments")} />
        </div>
        <Card className="lg:col-span-2">
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--color-text-tertiary)" }}>Maintenance collection trend</p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={COLLECTION_TREND}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v) => formatINR(v)} />
              <Line type="monotone" dataKey="collected" stroke="var(--color-marigold-500)" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* OPERATIONS + ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SectionHeader title="Operations" action={<SectionLink onClick={() => onNavigate("operations.requests")}>View requests</SectionLink>} />
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatCard label="Open Requests" value={operations.openRequests} icon={Wrench} onClick={() => onNavigate("operations.requests")} />
            <StatCard label="SLA Breaches" value={operations.slaBreaches} icon={AlertTriangle} tone="var(--color-danger)" onClick={() => onNavigate("operations.requests")} />
            <StatCard label="Amenity Bookings" value={operations.amenityBookings} icon={CalendarCheck} onClick={() => onNavigate("community.amenities")} />
            <StatCard label="Marketplace Orders" value={operations.marketplaceOrders} icon={Store} onClick={() => onNavigate("marketplace.orders")} />
          </div>
          <Card>
            <p className="text-xs font-semibold mb-3" style={{ color: "var(--color-text-tertiary)" }}>Requests by category</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={REQUEST_CATEGORY} dataKey="value" nameKey="name" innerRadius={40} outerRadius={65} paddingAngle={2}>
                  {REQUEST_CATEGORY.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip /><Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
        <div>
          <SectionHeader title="Recent activity" />
          <Card padded={false}>
            <div className="flex flex-col divide-y" style={{ borderColor: "var(--color-border)" }}>
              {RECENT_ACTIVITY.map((a) => (
                <div key={a.id} className="flex items-start gap-3 px-4 py-3.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--color-navy-50)" }}><a.icon size={14} aria-hidden="true" style={{ color: "var(--color-navy-700)" }} /></div>
                  <div className="min-w-0"><p className="text-sm leading-snug">{a.text}</p><p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>{a.time}</p></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   ROLE-SPECIFIC FORM FIELD SETS (Create/Edit User)
   ============================================================================ */

function ResidentFields({ form, setForm, errors = {} }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Full name" required error={errors.name}><TextInput invalid={!!errors.name} autoFocus placeholder="e.g. Ananya Rao" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Mobile number" required error={errors.phone}><TextInput type="tel" inputMode="tel" invalid={!!errors.phone} placeholder="98450 12345" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
      </div>
      <Field label="Email" error={errors.email}><TextInput type="email" invalid={!!errors.email} placeholder="name@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tower / Building">
          <Select value={form.tower} onChange={(e) => setForm({ ...form, tower: e.target.value })}>
            <option value="">Select tower</option>{TOWERS.map((t) => <option key={t}>{t}</option>)}
          </Select>
        </Field>
        <Field label="Flat / Unit">
          <Select value={form.flat} onChange={(e) => setForm({ ...form, flat: e.target.value })}>
            <option value="">Select flat</option>{FLATS_LIST.map((f) => <option key={f}>{f}</option>)}
          </Select>
        </Field>
      </div>
      <Field label="Resident type">
        <div className="flex gap-2">
          {["Owner", "Tenant"].map((t) => (
            <button key={t} type="button" onClick={() => setForm({ ...form, residentType: t })} className="aapp-focus flex-1 rounded-lg py-2.5 text-sm font-semibold"
              style={{ background: form.residentType === t ? "var(--color-navy-800)" : "#fff", color: form.residentType === t ? "#fff" : "var(--color-text-primary)", border: `1px solid ${form.residentType === t ? "var(--color-navy-800)" : "var(--color-border)"}` }}>
              {t}
            </button>
          ))}
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Family members" hint="Number of additional occupants"><TextInput type="number" min="0" value={form.family} onChange={(e) => setForm({ ...form, family: e.target.value })} /></Field>
        <Field label="Vehicles" hint="Number of registered vehicles"><TextInput type="number" min="0" value={form.vehicles} onChange={(e) => setForm({ ...form, vehicles: e.target.value })} /></Field>
      </div>
    </>
  );
}

function GuardFields({ form, setForm, errors = {} }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Full name" required error={errors.name}><TextInput invalid={!!errors.name} autoFocus placeholder="e.g. Suresh Kumar" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Employee ID"><TextInput placeholder="SEC-1044" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Mobile number" required error={errors.phone}><TextInput type="tel" inputMode="tel" invalid={!!errors.phone} placeholder="90000 55123" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
        <Field label="Email (optional)" error={errors.email}><TextInput type="email" invalid={!!errors.email} placeholder="name@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Assigned gate">
          <Select value={form.gate} onChange={(e) => setForm({ ...form, gate: e.target.value })}><option value="">Select gate</option>{GATES.map((g) => <option key={g}>{g}</option>)}</Select>
        </Field>
        <Field label="Shift">
          <Select value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })}><option value="">Select shift</option>{SHIFTS.map((s) => <option key={s}>{s}</option>)}</Select>
        </Field>
      </div>
    </>
  );
}

function StaffFields({ form, setForm, errors = {} }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Full name" required error={errors.name}><TextInput invalid={!!errors.name} autoFocus placeholder="e.g. Lakshmi Devi" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Mobile number" required error={errors.phone}><TextInput type="tel" inputMode="tel" invalid={!!errors.phone} placeholder="98765 11223" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Worker type">
          <Select value={form.workerType} onChange={(e) => setForm({ ...form, workerType: e.target.value })}><option value="">Select type</option>{WORKER_TYPES.map((w) => <option key={w}>{w}</option>)}</Select>
        </Field>
        <Field label="Skill / service"><TextInput placeholder="e.g. Housekeeping" value={form.skill} onChange={(e) => setForm({ ...form, skill: e.target.value })} /></Field>
      </div>
      <Field label="Associated flat (optional)">
        <Select value={form.associatedFlat} onChange={(e) => setForm({ ...form, associatedFlat: e.target.value })}><option value="">Not flat-specific</option>{FLATS_LIST.map((f) => <option key={f}>{f}</option>)}</Select>
      </Field>
      <Field label="Availability"><TextInput placeholder="e.g. Mon–Sat, 7–11 AM" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} /></Field>
      <Field label="Verification status">
        <div className="flex gap-2">
          {["Verified", "Pending"].map((v) => (
            <button key={v} type="button" onClick={() => setForm({ ...form, verification: v })} className="aapp-focus flex-1 rounded-lg py-2.5 text-sm font-semibold"
              style={{ background: form.verification === v ? "var(--color-navy-800)" : "#fff", color: form.verification === v ? "#fff" : "var(--color-text-primary)", border: `1px solid ${form.verification === v ? "var(--color-navy-800)" : "var(--color-border)"}` }}>
              {v}
            </button>
          ))}
        </div>
      </Field>
    </>
  );
}

function VendorFields({ form, setForm, errors = {} }) {
  return (
    <>
      <Field label="Vendor name" required error={errors.name}><TextInput invalid={!!errors.name} autoFocus placeholder="e.g. Fresh Mart Grocery" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Contact person"><TextInput placeholder="e.g. Anil Gupta" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} /></Field>
        <Field label="Mobile number" required error={errors.phone}><TextInput type="tel" inputMode="tel" invalid={!!errors.phone} placeholder="90111 22334" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Email" error={errors.email}><TextInput type="email" invalid={!!errors.email} placeholder="contact@vendor.in" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Category">
          <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="">Select category</option>{VENDOR_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select>
        </Field>
      </div>
      <Field label="Services / products offered"><TextInput placeholder="e.g. Fruits, vegetables, daily essentials" value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} /></Field>
    </>
  );
}

function AdminRoleFields({ form, setForm, errors = {} }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Full name" required error={errors.name}><TextInput invalid={!!errors.name} autoFocus placeholder="e.g. Deepak Verma" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Mobile number" required error={errors.phone}><TextInput type="tel" inputMode="tel" invalid={!!errors.phone} placeholder="99887 76655" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Email" error={errors.email}><TextInput type="email" invalid={!!errors.email} placeholder="name@ruhome.in" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Department / title"><TextInput placeholder="e.g. Operations" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></Field>
      </div>
    </>
  );
}

function PermissionMatrix({ permissions, setPermissions }) {
  const toggle = (moduleKey, action) => {
    setPermissions((prev) => {
      const current = prev[moduleKey] || [];
      const has = current.includes(action);
      return { ...prev, [moduleKey]: has ? current.filter((a) => a !== action) : [...current, action] };
    });
  };
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
      {PERMISSION_MODULES.map((m, i) => (
        <div key={m.key} className="flex items-center gap-4 px-4 py-3" style={{ borderTop: i > 0 ? "1px solid var(--color-border)" : "none", background: i % 2 ? "#FBFBFD" : "#fff" }}>
          <span className="text-sm font-semibold w-40 shrink-0">{m.label}</span>
          <div className="flex gap-4 flex-wrap">
            {m.actions.map((a) => (
              <Checkbox key={a} checked={(permissions[m.key] || []).includes(a)} onChange={() => toggle(m.key, a)} label={a} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================================
   CREATE USER WIZARD
   ============================================================================ */

const WIZARD_STEPS = ["Role", "Information", "Community Info", "Permissions", "Review"];

function CreateUserWizard({ open, onClose, onCreate }) {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState(null);
  const [form, setForm] = useState({});
  const [permissions, setPermissions] = useState({});
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);
  const [resent, setResent] = useState(false);
  const [errors, setErrors] = useState({});

  const isAdminRole = role && ADMIN_ROLE_KEYS.includes(role);
  const steps = isAdminRole ? WIZARD_STEPS : WIZARD_STEPS.filter((s) => s !== "Permissions");

  const reset = () => { setStep(0); setRole(null); setForm({}); setPermissions({}); setCreated(null); setCopied(false); setResent(false); setErrors({}); };

  // Validate the Information step before letting the admin move on.
  const validateInfo = () => {
    const e = {};
    if (!form.name?.trim()) e.name = role === "Vendor" ? "Enter the vendor's name" : "Enter the person's full name";
    const digits = (form.phone || "").replace(/\D/g, "");
    if (!digits) e.phone = "Enter a mobile number — the invite is sent here";
    else if (digits.length < 10) e.phone = "Mobile number should have at least 10 digits";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address, e.g. name@example.com";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const updateForm = (next) => {
    setForm(next);
    // Clear an error as soon as the admin edits that field.
    if (Object.keys(errors).length) setErrors((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => next[k] === form[k])));
  };
  const goNext = () => {
    if (step === 1 && !validateInfo()) return;
    setStep((s) => s + 1);
  };
  const handleClose = () => { onClose(); reset(); };

  const selectRole = (r) => {
    setRole(r);
    setForm({ name: "", phone: "", email: "", status: "Active" });
    if (ADMIN_ROLE_KEYS.includes(r)) setPermissions(defaultPermissionsFor(r));
    setStep(1);
  };

  const handleCreate = () => {
    const newUser = {
      id: nextId(), role, status: form.status || "Active", createdOn: "Just now",
      name: form.name || "Unnamed", phone: form.phone || "—", email: form.email || "",
      ...form,
      ...(isAdminRole ? { permissions } : {}),
      tempPassword: generateTempPassword(),
    };
    onCreate(newUser);
    setCreated(newUser);
    setStep(steps.length);
  };

  const stepIndex = (label) => steps.indexOf(label);
  const isReviewStep = step === stepIndex("Review");
  const isSuccessStep = step === steps.length;

  return (
    <Modal open={open} onClose={handleClose} title={isSuccessStep ? "User created" : "Create New User"} width="max-w-2xl"
      subtitle={!isSuccessStep && role ? `${role} · Step ${step + 1} of ${steps.length}` : undefined}
      footer={
        isSuccessStep ? <Button variant="primary" className="w-full" onClick={handleClose}>Done</Button> :
        step === 0 ? <Button variant="secondary" onClick={handleClose}>Cancel</Button> :
        <>
          <Button variant="secondary" icon={ArrowLeft} onClick={() => { setErrors({}); setStep((s) => s - 1); }}>Back</Button>
          {isReviewStep ? (
            <Button variant="primary" icon={CheckCircle2} onClick={handleCreate}>Create User</Button>
          ) : (
            <Button variant="primary" iconRight={ArrowRight} onClick={goNext}>
              {step === stepIndex("Permissions") || (step === stepIndex("Community Info") && !isAdminRole) ? "Review" : "Next"}
            </Button>
          )}
        </>
      }
    >
      {/* Step indicator */}
      {!isSuccessStep && (
        <ol aria-label="Progress" className="flex items-center gap-1.5 mb-6">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <li aria-current={i === step ? "step" : undefined} className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: i <= step ? "var(--color-navy-800)" : "var(--color-border)", color: i <= step ? "#fff" : "var(--color-text-secondary)", boxShadow: i === step ? "0 0 0 3px var(--color-navy-50)" : "none" }}>
                  {i < step ? <Check size={13} aria-hidden="true" /> : i + 1}
                </div>
                <span className={`text-[11px] font-semibold ${i === step ? "" : "hidden sm:block"}`} style={{ color: i <= step ? "var(--color-text-primary)" : "var(--color-text-secondary)" }}>{s}</span>
              </li>
              {i < steps.length - 1 && <div aria-hidden="true" className="flex-1 h-0.5 mb-4" style={{ background: i < step ? "var(--color-navy-800)" : "var(--color-border)" }} />}
            </React.Fragment>
          ))}
        </ol>
      )}

      {/* STEP: Role select */}
      {step === 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ROLES.map((r) => (
            <button key={r.key} onClick={() => selectRole(r.key)} className="aapp-focus aapp-stat-link flex flex-col items-start gap-2 rounded-xl p-4 text-left" style={{ border: "1px solid var(--color-border)" }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--color-navy-50)" }}><r.icon size={17} style={{ color: "var(--color-navy-700)" }} /></div>
              <span className="text-sm font-bold">{r.label}</span>
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{r.desc}</span>
            </button>
          ))}
        </div>
      )}

      {/* STEP: Information (role-dependent) */}
      {step === 1 && <p className="text-xs mb-4" style={{ color: "var(--color-text-secondary)" }}>Fields marked <span style={{ color: "var(--color-danger)" }}>*</span> are required.</p>}
      {step === 1 && role === "Resident" && <ResidentFields form={form} setForm={updateForm} errors={errors} />}
      {step === 1 && role === "Guard" && <GuardFields form={form} setForm={updateForm} errors={errors} />}
      {step === 1 && role === "Staff" && <StaffFields form={form} setForm={updateForm} errors={errors} />}
      {step === 1 && role === "Vendor" && <VendorFields form={form} setForm={updateForm} errors={errors} />}
      {step === 1 && isAdminRole && <AdminRoleFields form={form} setForm={updateForm} errors={errors} />}

      {/* STEP: Community Info */}
      {step === 2 && (
        <div>
          <Field label="Account status">
            <div className="flex gap-2">
              {["Active", "Pending", "Inactive"].map((s) => (
                <button key={s} type="button" onClick={() => setForm({ ...form, status: s })} className="aapp-focus flex-1 rounded-lg py-2.5 text-sm font-semibold"
                  style={{ background: form.status === s ? "var(--color-navy-800)" : "#fff", color: form.status === s ? "#fff" : "var(--color-text-primary)", border: `1px solid ${form.status === s ? "var(--color-navy-800)" : "var(--color-border)"}` }}>
                  {s}
                </button>
              ))}
            </div>
          </Field>
          <div className="flex items-center gap-2 rounded-xl p-3.5" style={{ background: "var(--color-info-bg)" }}>
            <ShieldCheck size={16} style={{ color: "var(--color-info)" }} />
            <span className="text-xs font-semibold" style={{ color: "#1E4A99" }}>{ADMIN.community} will be automatically associated with this account.</span>
          </div>
        </div>
      )}

      {/* STEP: Permissions (admin roles only) */}
      {step === stepIndex("Permissions") && isAdminRole && (
        <div>
          <p className="text-xs mb-3" style={{ color: "var(--color-text-secondary)" }}>Default permissions for <span className="font-semibold">{role}</span> — adjust as needed.</p>
          <PermissionMatrix permissions={permissions} setPermissions={setPermissions} />
        </div>
      )}

      {/* STEP: Review */}
      {isReviewStep && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Avatar initials={initialsOf(form.name || "??")} size={44} />
            <div><p className="font-bold text-sm">{form.name || "Unnamed"}</p><Badge tone="info">{role}</Badge></div>
          </div>
          <div className="rounded-xl p-4 mb-3" style={{ background: "var(--color-bg)" }}>
            {Object.entries(form).filter(([k]) => !["name", "status"].includes(k)).map(([k, v]) => v ? (
              <div key={k} className="flex justify-between text-sm py-1"><span style={{ color: "var(--color-text-secondary)" }} className="capitalize">{k.replace(/([A-Z])/g, " $1")}</span><span className="font-semibold">{String(v)}</span></div>
            ) : null)}
            <div className="flex justify-between text-sm py-1"><span style={{ color: "var(--color-text-secondary)" }}>Status</span><StatusBadge status={form.status || "Active"} /></div>
          </div>
          {isAdminRole && (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-tertiary)" }}>PERMISSIONS</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(permissions).filter(([, actions]) => actions.length).map(([k, actions]) => (
                  <Badge key={k} tone="neutral">{PERMISSION_MODULES.find((m) => m.key === k)?.label}: {actions.join(", ")}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUCCESS */}
      {isSuccessStep && created && (
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 rounded-full mb-4 flex items-center justify-center" style={{ background: "var(--color-success-bg)" }}><CheckCircle2 size={30} style={{ color: "var(--color-success)" }} /></div>
          <h3 className="aapp-heading text-lg font-bold mb-1">{created.role} created successfully</h3>
          <p className="text-sm mb-1 font-semibold">{created.name}</p>
          <p className="text-xs mb-5" style={{ color: "var(--color-text-secondary)" }}>Now visible in Users{created.role === "Resident" ? " and Residents" : created.role === "Guard" ? " and Guards / Security" : created.role === "Staff" ? " and Staff / Service Workers" : ""}.</p>

          <Card className="w-full text-left">
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--color-text-tertiary)" }}>How {created.name.split(" ")[0]} gets access</p>
            <div className="flex items-start gap-2.5 mb-3">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0" style={{ color: "var(--color-success)" }} />
              <p className="text-xs leading-relaxed">
                An invite with login instructions has been sent
                {created.phone && created.phone !== "—" ? <> by SMS to <span className="font-semibold">{created.phone}</span></> : null}
                {created.email ? <> and by email to <span className="font-semibold">{created.email}</span></> : null}
                {!created.phone && !created.email ? " to the contact on file" : ""}.
              </p>
            </div>
            <div className="rounded-xl p-3.5 flex items-center justify-between gap-3 mb-3" style={{ background: "var(--color-bg)" }}>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-tertiary)" }}>Temporary password</p>
                <p className="text-base font-bold tracking-wider" style={{ fontFamily: "monospace" }}>{created.tempPassword}</p>
              </div>
              <Button
                variant="secondary" size="sm"
                onClick={() => { navigator.clipboard?.writeText(created.tempPassword).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
              >
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <p className="text-[11px] mb-3" style={{ color: "var(--color-text-tertiary)" }}>
              {created.name.split(" ")[0]} will be asked to set a new password on first login to the {created.role === "Resident" ? "Resident app" : created.role === "Guard" ? "Guard app" : created.role === "Vendor" ? "Vendor portal" : ADMIN_ROLE_KEYS.includes(created.role) ? "Admin Portal" : "Staff app"}.
            </p>
            <Button variant="ghost" size="sm" className="!px-0" onClick={() => { setResent(true); setTimeout(() => setResent(false), 1800); }}>
              {resent ? <><Check size={13} /> Invite resent</> : "Resend invite"}
            </Button>
          </Card>
        </div>
      )}
    </Modal>
  );
}

/* ============================================================================
   USER DETAILS DRAWER
   ============================================================================ */

function UserDetailsDrawer({ user, onClose, onActivate, onDeactivate, onSuspend, onResetAccess }) {
  // Hook must run on every render (before the early return) — calling it only
  // when a user is selected breaks React's hook ordering.
  const [confirmAction, setConfirmAction] = useState(null);
  if (!user) return null;
  const roleFields = {
    Resident: [["Tower", user.tower], ["Flat", user.flat], ["Resident type", user.residentType], ["Family members", user.family], ["Vehicles", user.vehicles], ["Outstanding", user.outstanding != null ? formatINR(user.outstanding) : null]],
    Guard: [["Employee ID", user.employeeId], ["Gate", user.gate], ["Shift", user.shift]],
    Staff: [["Worker type", user.workerType], ["Skill", user.skill], ["Associated flat", user.associatedFlat], ["Verification", user.verification], ["Availability", user.availability], ["Rating", user.rating]],
    Vendor: [["Contact person", user.contactPerson], ["Category", user.category], ["Services", user.services]],
  }[user.role] || [["Department", user.department]];

  return (
    <>
      <Drawer open={!!user} onClose={onClose} title={user.name} subtitle={user.role}
        footer={
          <div className="flex flex-wrap gap-2 w-full">
            <Button variant="secondary" icon={KeyRound} size="sm" onClick={() => onResetAccess(user)}>Reset access</Button>
            {user.status !== "Active" && <Button variant="primary" icon={Power} size="sm" onClick={() => setConfirmAction("activate")}>Activate</Button>}
            {user.status === "Active" && <Button variant="secondary" icon={Ban} size="sm" onClick={() => setConfirmAction("deactivate")} style={{ color: "var(--color-warning-fg)" }}>Deactivate</Button>}
            <div className="flex-1" />
            {user.status !== "Suspended" && <Button variant="ghost" icon={UserX} size="sm" onClick={() => setConfirmAction("suspend")} style={{ color: "var(--color-danger-fg)" }}>Suspend</Button>}
          </div>
        }
      >
        <div className="flex items-center gap-4 mb-6">
          <Avatar initials={initialsOf(user.name)} size={56} />
          <div><StatusBadge status={user.status} /><p className="text-xs mt-1.5" style={{ color: "var(--color-text-tertiary)" }}>Created {user.createdOn} · {user.id}</p></div>
        </div>
        <div className="flex gap-2 mb-4">
          {user.phone && user.phone !== "—" && <a href={`tel:${user.phone.replace(/\s/g, "")}`} className="aapp-focus aapp-btn flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm" style={{ border: "1px solid var(--color-border)" }}><Phone size={15} aria-hidden="true" />Call</a>}
          {user.email && <a href={`mailto:${user.email}`} className="aapp-focus aapp-btn flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm" style={{ border: "1px solid var(--color-border)" }}><Mail size={15} aria-hidden="true" />Email</a>}
        </div>
        <Card className="mb-4">
          <div className="flex justify-between gap-4 text-sm py-1.5"><span style={{ color: "var(--color-text-secondary)" }}>Phone</span><span className="font-semibold text-right">{user.phone}</span></div>
          {user.email && <div className="flex justify-between gap-4 text-sm py-1.5"><span style={{ color: "var(--color-text-secondary)" }}>Email</span><span className="font-semibold text-right break-all">{user.email}</span></div>}
          {roleFields.map(([label, val]) => val != null && val !== "" ? (
            <div key={label} className="flex justify-between gap-4 text-sm py-1.5"><span style={{ color: "var(--color-text-secondary)" }}>{label}</span><span className="font-semibold text-right">{String(val)}</span></div>
          ) : null)}
        </Card>
        {ADMIN_ROLE_KEYS.includes(user.role) && user.permissions && (
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-tertiary)" }}>PERMISSIONS</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {Object.entries(user.permissions).filter(([, a]) => a.length).map(([k, a]) => <Badge key={k} tone="neutral">{PERMISSION_MODULES.find((m) => m.key === k)?.label}: {a.join(", ")}</Badge>)}
            </div>
          </div>
        )}
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-tertiary)" }}>ACTIVITY</p>
          <div className="flex items-center gap-2 text-xs py-2" style={{ color: "var(--color-text-secondary)" }}><Clock size={13} /> Account created — {user.createdOn}</div>
          <div className="flex items-center gap-2 text-xs py-2" style={{ color: "var(--color-text-secondary)" }}><CheckCircle2 size={13} /> Last login — 2 days ago</div>
        </div>
      </Drawer>
      <ConfirmDialog
        open={!!confirmAction} onClose={() => setConfirmAction(null)}
        title={confirmAction === "activate" ? "Activate this user?" : confirmAction === "deactivate" ? "Deactivate this user?" : "Suspend this user?"}
        body={`${user.name} will ${confirmAction === "activate" ? "regain" : "lose"} access to the platform immediately.`}
        confirmLabel={confirmAction === "activate" ? "Activate" : confirmAction === "deactivate" ? "Deactivate" : "Suspend"}
        tone={confirmAction === "activate" ? "primary" : "danger"}
        onConfirm={() => { if (confirmAction === "activate") onActivate(user); if (confirmAction === "deactivate") onDeactivate(user); if (confirmAction === "suspend") onSuspend(user); setConfirmAction(null); }}
      />
    </>
  );
}

/* ============================================================================
   USERS PAGES
   ============================================================================ */

function useUserFilters(users) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const filtered = users.filter((u) =>
    (roleFilter === "All" || u.role === roleFilter) &&
    (statusFilter === "All" || u.status === statusFilter) &&
    (search === "" || u.name.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search))
  );
  return { search, setSearch, roleFilter, setRoleFilter, statusFilter, setStatusFilter, filtered };
}

function AllUsersPage({ users, onCreateClick, onRowClick }) {
  const { search, setSearch, roleFilter, setRoleFilter, statusFilter, setStatusFilter, filtered } = useUserFilters(users);
  const columns = [
    { key: "name", label: "Name", render: (u) => <div className="flex items-center gap-2.5"><Avatar initials={initialsOf(u.name)} size={30} /><div><p className="font-semibold text-sm">{u.name}</p><p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{u.id}</p></div></div> },
    { key: "role", label: "Role", render: (u) => <Badge tone="info">{u.role}</Badge> },
    { key: "phone", label: "Phone" },
    { key: "detail", label: "Detail", render: (u) => u.flat || u.gate || u.workerType || u.category || u.department || "—" },
    { key: "status", label: "Status", render: (u) => <StatusBadge status={u.status} /> },
    { key: "createdOn", label: "Created" },
  ];
  return (
    <div>
      <PageHeader title="All Users" blurb={`${users.length} users across the platform`} action={<Button variant="primary" icon={Plus} onClick={onCreateClick}>Create User</Button>} />
      <Card padded={false}>
        <div className="p-4 pb-0">
          <TableToolbar search={search} onSearch={setSearch} placeholder="Search by name or phone…" filters={
            <>
              <div className="grid grid-cols-2 sm:flex gap-3">
                <Select aria-label="Filter by role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}><option value="All">All roles</option>{ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}</Select>
                <Select aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="All">All statuses</option><option>Active</option><option>Inactive</option><option>Suspended</option><option>Pending</option></Select>
              </div>
              {(roleFilter !== "All" || statusFilter !== "All" || search) && (
                <Button variant="ghost" size="sm" icon={X} onClick={() => { setRoleFilter("All"); setStatusFilter("All"); setSearch(""); }}>Clear filters</Button>
              )}
            </>
          } />
        </div>
        <DataTable columns={columns} rows={filtered} onRowClick={onRowClick} emptyIcon={Users} emptyTitle="No users found" emptyBody="Try adjusting your search or filters." />
        <div className="px-4 py-3 text-xs" style={{ color: "var(--color-text-tertiary)", borderTop: "1px solid var(--color-border)" }}>Showing {filtered.length} of {users.length} users</div>
      </Card>
    </div>
  );
}

function RoleListPage({ title, blurb, users, role, columns, onCreateClick, onRowClick, emptyIcon }) {
  const list = users.filter((u) => u.role === role);
  const [search, setSearch] = useState("");
  const filtered = list.filter((u) => search === "" || u.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <PageHeader title={title} blurb={blurb} action={<Button variant="primary" icon={Plus} onClick={onCreateClick}>Create {role}</Button>} />
      <Card padded={false}>
        <div className="p-4 pb-0"><TableToolbar search={search} onSearch={setSearch} placeholder={`Search ${role.toLowerCase()}s…`} /></div>
        <DataTable columns={columns} rows={filtered} onRowClick={onRowClick} emptyIcon={emptyIcon} emptyTitle={`No ${role.toLowerCase()}s yet`} emptyBody={`Created ${role.toLowerCase()}s will appear here.`} />
        <div className="px-4 py-3 text-xs" style={{ color: "var(--color-text-tertiary)", borderTop: "1px solid var(--color-border)" }}>Showing {filtered.length} of {list.length}</div>
      </Card>
    </div>
  );
}

function RolesPermissionsPage({ users }) {
  const [expanded, setExpanded] = useState(ADMIN_ROLE_KEYS[0]);
  return (
    <div>
      <PageHeader title="Roles & Permissions" blurb="View default permissions for each administrative role." />
      <div className="flex flex-col gap-3">
        {ROLES.map((r) => {
          const perms = defaultPermissionsFor(r.key);
          const count = users.filter((u) => u.role === r.key).length;
          const isOpen = expanded === r.key;
          return (
            <Card key={r.key} padded={false}>
              <button onClick={() => setExpanded(isOpen ? null : r.key)} className="w-full flex items-center gap-3 px-5 py-4 text-left">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--color-navy-50)" }}><r.icon size={17} style={{ color: "var(--color-navy-700)" }} /></div>
                <div className="flex-1 min-w-0"><p className="font-bold text-sm">{r.label}</p><p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{count} user{count !== 1 ? "s" : ""} · {r.desc}</p></div>
                <ChevronDown size={16} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .15s", color: "var(--color-text-tertiary)" }} />
              </button>
              {isOpen && (
                <div className="px-5 pb-5">
                  {ADMIN_ROLE_KEYS.includes(r.key) ? (
                    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
                      {PERMISSION_MODULES.map((m, i) => (
                        <div key={m.key} className="flex items-center gap-4 px-4 py-2.5" style={{ borderTop: i > 0 ? "1px solid var(--color-border)" : "none", background: i % 2 ? "#FBFBFD" : "#fff" }}>
                          <span className="text-sm font-semibold w-40 shrink-0">{m.label}</span>
                          <div className="flex gap-3 flex-wrap">
                            {m.actions.map((a) => {
                              const has = (perms[m.key] || []).includes(a);
                              return <Badge key={a} tone={has ? "success" : "neutral"}>{has ? <Check size={10} /> : <X size={10} />} {a}</Badge>;
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>This role uses application-level access (Resident, Guard, Staff or Vendor apps) rather than portal permissions.</p>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================================
   GENERIC MODULE PAGE (data-backed list/table screen for every module)
   ============================================================================ */

function renderCell(row, col) {
  const value = row[col.key];
  if (col.type === "badge") return <Badge tone={toneForValue(value)}>{value}</Badge>;
  if (col.type === "currency") return <span className="font-semibold">{formatINR(Number(value) || 0)}</span>;
  if (col.type === "rating") return value ? <span className="flex items-center gap-1"><Star size={12} fill="var(--color-marigold-500)" style={{ color: "var(--color-marigold-500)" }} />{value}</span> : "—";
  return value;
}

function GenericTablePage({ routeKey }) {
  const meta = PLACEHOLDER_META[routeKey];
  const addLabel = ADD_LABELS[routeKey] || meta.title;
  const blankForm = () => Object.fromEntries(meta.columns.map((c) => [c.key, ""]));

  const [rows, setRows] = useState(meta.rows);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(blankForm);
  const [detailRow, setDetailRow] = useState(null);

  const [addError, setAddError] = useState("");

  const columns = meta.columns.map((c) => ({ ...c, render: (row) => renderCell(row, c) }));
  const searchKey = meta.columns[0].key;
  const filtered = search
    ? rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(search.toLowerCase())))
    : rows;

  const closeAdd = () => { setAddOpen(false); setAddError(""); };
  const handleAdd = (e) => {
    e?.preventDefault();
    if (!String(addForm[searchKey] || "").trim()) { setAddError(`${meta.columns[0].label} is required`); return; }
    setRows((prev) => [{ ...addForm }, ...prev]);
    setAddForm(blankForm());
    closeAdd();
  };

  return (
    <div>
      <PageHeader title={meta.title} blurb={meta.blurb} action={<Button variant="primary" icon={Plus} onClick={() => setAddOpen(true)}>Add {addLabel}</Button>} />
      <Card padded={false}>
        <div className="p-4 pb-0">
          <TableToolbar search={search} onSearch={setSearch} placeholder={`Search ${meta.title.toLowerCase()}…`} />
        </div>
        <DataTable columns={columns} rows={filtered} onRowClick={setDetailRow} emptyIcon={meta.icon} emptyTitle={`No ${meta.title.toLowerCase()} found`} emptyBody="Try adjusting your search." />
        <div className="px-4 py-3 text-xs" style={{ color: "var(--color-text-tertiary)", borderTop: "1px solid var(--color-border)" }}>
          Showing {filtered.length} of {rows.length}{searchKey ? "" : ""}
        </div>
      </Card>

      <Modal
        open={addOpen}
        onClose={closeAdd}
        title={`Add ${addLabel}`}
        subtitle={`Create a new ${addLabel.toLowerCase()} record.`}
        footer={<>
          <Button variant="secondary" onClick={closeAdd}>Cancel</Button>
          <Button variant="primary" type="submit" form="aapp-add-form">Add {addLabel}</Button>
        </>}
      >
        <form id="aapp-add-form" onSubmit={handleAdd} noValidate>
          {meta.columns.map((c, i) => (
            <Field key={c.key} label={c.label} required={i === 0} error={i === 0 ? addError : undefined}>
              <TextInput
                autoFocus={i === 0}
                invalid={i === 0 && !!addError}
                type={c.type === "currency" ? "number" : "text"}
                inputMode={c.type === "currency" ? "decimal" : undefined}
                value={addForm[c.key] || ""}
                onChange={(e) => { setAddForm((f) => ({ ...f, [c.key]: e.target.value })); if (i === 0) setAddError(""); }}
                placeholder={c.type === "currency" ? "Amount in ₹" : `Enter ${c.label.toLowerCase()}`}
              />
            </Field>
          ))}
        </form>
      </Modal>

      <Drawer open={!!detailRow} onClose={() => setDetailRow(null)} title={detailRow ? String(detailRow[searchKey] ?? meta.title) : ""} subtitle={meta.title}>
        {detailRow && meta.columns.map((c) => (
          <InfoRow key={c.key} label={c.label} value={detailRow[c.key] ?? "—"} />
        ))}
      </Drawer>
    </div>
  );
}

/* ============================================================================
   REPORTS & ANALYTICS
   ============================================================================ */

function ReportsPage() {
  const { finance, security, operations } = DASHBOARD_STATS;
  return (
    <div>
      <PageHeader title="Reports & Analytics" blurb="Security, financial and operations reports for RUhome." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Collection Rate" value={`${Math.round((finance.collected / (finance.collected + finance.outstanding)) * 100)}%`} icon={TrendingUp} tone="var(--color-success)" />
        <StatCard label="Patrol Compliance" value={`${security.patrolCompliance}%`} icon={MapPinned} />
        <StatCard label="SLA Breaches (30d)" value={operations.slaBreaches} icon={AlertTriangle} tone="var(--color-danger)" />
        <StatCard label="Vendor Orders (30d)" value={operations.marketplaceOrders} icon={Truck} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--color-text-tertiary)" }}>Visitor activity (7 days)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={VISITOR_TREND}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "var(--color-bg)" }} />
              <Bar dataKey="visitors" fill="var(--color-navy-800)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--color-text-tertiary)" }}>Maintenance collection trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={COLLECTION_TREND}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v) => formatINR(v)} />
              <Line type="monotone" dataKey="collected" stroke="var(--color-marigold-500)" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card>
        <p className="text-xs font-semibold mb-3" style={{ color: "var(--color-text-tertiary)" }}>Service requests by category</p>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={REQUEST_CATEGORY} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
              {REQUEST_CATEGORY.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip /><Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

/* ============================================================================
   COMMUNITY SETTINGS
   ============================================================================ */

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm py-2" style={{ borderBottom: "1px solid var(--color-border)" }}>
      <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
      <span className="font-semibold text-right">{value}</span>
    </div>
  );
}

function SettingsPage() {
  return (
    <div>
      <PageHeader title="Community Settings" blurb="Community info, buildings, gates, amenities and billing configuration." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <SectionHeader title="Community Information" />
          <InfoRow label="Community name" value={ADMIN.community} />
          <InfoRow label="Address" value="Sarjapur Road, Bengaluru, KA 560035" />
          <InfoRow label="Total towers" value={TOWERS.length} />
          <InfoRow label="Total flats" value="180" />
          <InfoRow label="RWA registration no." value="RWA/BLR/2019/04471" />
          <InfoRow label="Support contact" value="+91 80 4890 1100" />
        </Card>
        <Card>
          <SectionHeader title="Gates" />
          {GATES.map((g) => <InfoRow key={g} label={g} value="Operational" />)}
        </Card>
        <Card>
          <SectionHeader title="Billing Configuration" />
          <InfoRow label="Maintenance rate" value="₹3.50 / sq. ft. / month" />
          <InfoRow label="Late payment fee" value="2% per month" />
          <InfoRow label="Billing cycle" value="1st of every month" />
          <InfoRow label="Payment due day" value="10th of every month" />
        </Card>
        <Card>
          <SectionHeader title="Towers & Blocks" />
          {TOWERS.map((t) => <InfoRow key={t} label={t} value="45 flats" />)}
        </Card>
      </div>
    </div>
  );
}

/* ============================================================================
   PLACEHOLDER PAGE (fallback for any unmapped route)
   ============================================================================ */

function PlaceholderPage({ routeKey }) {
  const meta = PLACEHOLDER_META[routeKey] || { title: "Coming soon", icon: Clock, blurb: "" };
  return (
    <div>
      <PageHeader title={meta.title} blurb={meta.blurb} />
      <Card><EmptyState icon={meta.icon} title={`${meta.title} is coming in a later phase`} body="This module will be built next, following the approved implementation plan." /></Card>
    </div>
  );
}

/* ============================================================================
   ROOT APP
   ============================================================================ */

export default function AdminApp({ onExitToPortal }) {
  const [session, setSession] = useState(ADMIN);
  const [route, setRoute] = useState("dashboard");
  const [users, setUsers] = useState(SEED_USERS);
  const [toasts, setToasts] = useState([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [detailUser, setDetailUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [jumpOpen, setJumpOpen] = useState(false);

  // Ctrl/⌘ + K opens the quick jump from anywhere.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setJumpOpen((o) => !o); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // New page → start at the top, like a real navigation.
  useEffect(() => { window.scrollTo(0, 0); }, [route]);

  const pushToast = (t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((p) => [...p, { id, ...t }]);
    setTimeout(() => setToasts((p) => p.filter((x) => x.id !== id)), 3200);
  };

  const handleCreateUser = (newUser) => {
    setUsers((prev) => [newUser, ...prev]);
    pushToast({ title: `${newUser.role} created`, body: `${newUser.name} added successfully`, tone: "success" });
  };
  const setStatus = (user, status, label) => {
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status } : u)));
    setDetailUser((d) => (d ? { ...d, status } : d));
    pushToast({ title: label, body: user.name, tone: status === "Suspended" ? "danger" : "success" });
  };

  if (!session) {
    return <div className="aapp-root"><GlobalStyles /><AdminLogin onLogin={() => setSession(ADMIN)} /></div>;
  }

  const breadcrumbFor = (r) => {
    for (const item of NAV) {
      if (item.key === r) return item.label;
      if (item.children) { const c = item.children.find((c) => c.key === r); if (c) return `${item.label} / ${c.label}`; }
    }
    return "Dashboard";
  };

  const PAGES = {
    dashboard: <Dashboard onNavigate={setRoute} users={users} />,
    "users.all": <AllUsersPage users={users} onCreateClick={() => setWizardOpen(true)} onRowClick={setDetailUser} />,
    "users.residents": <RoleListPage title="Residents" blurb="Manage resident accounts and their flat association." users={users} role="Resident" onCreateClick={() => setWizardOpen(true)} onRowClick={setDetailUser} emptyIcon={Home}
      columns={[
        { key: "name", label: "Name", render: (u) => <div className="flex items-center gap-2.5"><Avatar initials={initialsOf(u.name)} size={30} /><span className="font-semibold text-sm">{u.name}</span></div> },
        { key: "flat", label: "Flat" }, { key: "tower", label: "Tower" }, { key: "residentType", label: "Type" },
        { key: "outstanding", label: "Outstanding", render: (u) => u.outstanding ? <span style={{ color: "var(--color-warning)" }} className="font-semibold">{formatINR(u.outstanding)}</span> : <span style={{ color: "var(--color-success)" }}>Paid up</span> },
        { key: "status", label: "Status", render: (u) => <StatusBadge status={u.status} /> },
      ]} />,
    "users.guards": <RoleListPage title="Guards" blurb="Manage guard accounts, gate and shift assignment." users={users} role="Guard" onCreateClick={() => setWizardOpen(true)} onRowClick={setDetailUser} emptyIcon={Shield}
      columns={[
        { key: "name", label: "Name", render: (u) => <div className="flex items-center gap-2.5"><Avatar initials={initialsOf(u.name)} size={30} /><span className="font-semibold text-sm">{u.name}</span></div> },
        { key: "employeeId", label: "Employee ID" }, { key: "gate", label: "Gate" }, { key: "shift", label: "Shift" },
        { key: "status", label: "Status", render: (u) => <StatusBadge status={u.status} /> },
      ]} />,
    "users.staff": <RoleListPage title="Staff / Service Workers" blurb="Manage maids, cooks, drivers, technicians and other workers." users={users} role="Staff" onCreateClick={() => setWizardOpen(true)} onRowClick={setDetailUser} emptyIcon={Briefcase}
      columns={[
        { key: "name", label: "Name", render: (u) => <div className="flex items-center gap-2.5"><Avatar initials={initialsOf(u.name)} size={30} /><span className="font-semibold text-sm">{u.name}</span></div> },
        { key: "workerType", label: "Type" }, { key: "associatedFlat", label: "Flat" },
        { key: "verification", label: "Verification", render: (u) => <Badge tone={u.verification === "Verified" ? "success" : "warning"}>{u.verification}</Badge> },
        { key: "rating", label: "Rating", render: (u) => u.rating ? <span className="flex items-center gap-1"><Star size={12} fill="var(--color-marigold-500)" style={{ color: "var(--color-marigold-500)" }} />{u.rating}</span> : "—" },
        { key: "status", label: "Status", render: (u) => <StatusBadge status={u.status} /> },
      ]} />,
    "users.roles": <RolesPermissionsPage users={users} />,
    "security.guards": <RoleListPage title="Guards" blurb="Manage guard accounts, gate and shift assignment." users={users} role="Guard" onCreateClick={() => setWizardOpen(true)} onRowClick={setDetailUser} emptyIcon={Shield}
      columns={[
        { key: "name", label: "Name", render: (u) => <div className="flex items-center gap-2.5"><Avatar initials={initialsOf(u.name)} size={30} /><span className="font-semibold text-sm">{u.name}</span></div> },
        { key: "employeeId", label: "Employee ID" }, { key: "gate", label: "Gate" }, { key: "shift", label: "Shift" },
        { key: "status", label: "Status", render: (u) => <StatusBadge status={u.status} /> },
      ]} />,
    "reports": <ReportsPage />,
    "settings": <SettingsPage />,
  };

  const page = PAGES[route] || (PLACEHOLDER_META[route]?.rows ? <GenericTablePage key={route} routeKey={route} /> : <PlaceholderPage routeKey={route} />);

  return (
    <div className="aapp-root">
      <GlobalStyles />
      <div className="min-h-screen flex" style={{ background: "var(--color-bg)" }}>
        <a href="#aapp-main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[400] focus:rounded-lg focus:px-4 focus:py-2 focus:bg-white focus:shadow-lg text-sm font-semibold">Skip to content</a>
        <Sidebar route={route} onNavigate={setRoute} collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />
        <div className="flex-1 min-w-0 flex flex-col">
          <TopBar onOpenMobileNav={() => setMobileNavOpen(true)} onOpenJump={() => setJumpOpen(true)} breadcrumb={breadcrumbFor(route)} onNavigate={setRoute} onLogout={() => { pushToast({ title: "Logged out", body: "You have been signed out safely.", tone: "success" }); setTimeout(() => onExitToPortal?.(), 300); }} />
          <main id="aapp-main" key={route} tabIndex={-1} className="flex-1 p-4 md:p-7 aapp-animate-in max-w-full overflow-x-hidden outline-none">{page}</main>
        </div>
      </div>

      <QuickJump open={jumpOpen} onClose={() => setJumpOpen(false)} onNavigate={setRoute} />

      <CreateUserWizard open={wizardOpen} onClose={() => setWizardOpen(false)} onCreate={handleCreateUser} />
      <UserDetailsDrawer
        user={detailUser} onClose={() => setDetailUser(null)}
        onActivate={(u) => setStatus(u, "Active", "User activated")}
        onDeactivate={(u) => setStatus(u, "Inactive", "User deactivated")}
        onSuspend={(u) => setStatus(u, "Suspended", "User suspended")}
        onResetAccess={(u) => pushToast({ title: "Access reset", body: `New temporary password ${generateTempPassword()} sent to ${u.phone !== "—" ? u.phone : u.email || "the contact on file"}.`, tone: "success" })}
      />
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((x) => x.id !== id))} />
    </div>
  );
}
