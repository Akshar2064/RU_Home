// Mock data for the Guard App UI prototype.
// No backend — every "action" mutates local component state only.

export const COMMUNITY = "RUhome";

export const GATES = ["Main Gate", "Tower B Gate", "Service Gate", "Clubhouse Gate"];

export const GUARD = {
  name: "Suresh Kumar",
  employeeId: "GRD-1042",
  phone: "+91 98450 55210",
  photoInitials: "SK",
  gate: "Main Gate",
  shiftLabel: "Morning Shift",
  shiftWindow: "08:00 AM – 04:00 PM",
};

// ---------------------------------------------------------------------------
// Visitors
// ---------------------------------------------------------------------------

export const EXPECTED_VISITORS = [
  {
    id: "vis-1",
    name: "Rahul Sharma",
    type: "Guest",
    resident: "Ananya Rao",
    flat: "B-1204",
    tower: "Tower B",
    date: "Today",
    window: "11:00 AM – 1:00 PM",
    purpose: "Personal visit",
    vehicle: "TS09AB1234",
    people: 2,
    recurring: false,
  },
  {
    id: "vis-2",
    name: "Priya Reddy",
    type: "Delivery",
    resident: "Karthik Iyer",
    flat: "A-1204",
    tower: "Tower A",
    date: "Today",
    window: "12:00 PM – 12:30 PM",
    purpose: "Food delivery",
    vehicle: "—",
    people: 1,
    recurring: false,
  },
  {
    id: "vis-3",
    name: "Arjun Mehta",
    type: "Cab / Taxi",
    resident: "Meera Nair",
    flat: "C-1502",
    tower: "Tower C",
    date: "Today",
    window: "2:00 PM – 2:30 PM",
    purpose: "Airport drop",
    vehicle: "KA05MN7821",
    people: 1,
    recurring: false,
  },
];

export const RECURRING_VISITORS = [
  {
    id: "rec-1",
    name: "Lakshmi Devi",
    type: "Maid",
    resident: "Ananya Rao",
    flat: "B-1204",
    tower: "Tower B",
    schedule: "Mon–Sat · 7:00 AM – 11:00 AM",
    lastVerified: "Yesterday, 7:04 AM",
    verifiedBy: "GRD-1042 · Suresh Kumar",
    vehicle: "—",
  },
  {
    id: "rec-2",
    name: "Bhaskar Rao",
    type: "Driver",
    resident: "Karthik Iyer",
    flat: "A-1204",
    tower: "Tower A",
    schedule: "Daily · 8:30 AM & 6:30 PM",
    lastVerified: "Today, 8:31 AM",
    verifiedBy: "GRD-1042 · Suresh Kumar",
    vehicle: "TS10CD5566",
  },
];

export const ACTIVE_VISITORS = [
  {
    id: "act-1",
    name: "Sneha Kulkarni",
    type: "Guest",
    resident: "Vikram Malhotra",
    flat: "A-903",
    tower: "Tower A",
    entryTime: "10:12 AM",
    vehicle: "—",
    verificationMethod: "QR",
    parkingSlot: null,
  },
  {
    id: "act-2",
    name: "Zomato Delivery",
    type: "Delivery",
    resident: "Ritu Sharma",
    flat: "B-604",
    tower: "Tower B",
    entryTime: "11:48 AM",
    vehicle: "TS07XY9090",
    verificationMethod: "OTP",
    parkingSlot: null,
  },
  {
    id: "act-3",
    name: "Bhaskar Rao",
    type: "Driver",
    resident: "Karthik Iyer",
    flat: "A-1204",
    tower: "Tower A",
    entryTime: "8:31 AM",
    vehicle: "TS10CD5566",
    verificationMethod: "Recurring",
    parkingSlot: "V-04",
  },
];

export const VISITOR_HISTORY = [
  { id: "hist-1", name: "Meena Iyer", type: "Guest", flat: "C-1104", entryTime: "9:02 AM", exitTime: "9:45 AM", date: "Today", status: "Exited" },
  { id: "hist-2", name: "Swiggy Delivery", type: "Delivery", flat: "B-803", entryTime: "8:15 AM", exitTime: "8:22 AM", date: "Today", status: "Exited" },
  { id: "hist-3", name: "Rohit Verma", type: "Guest", flat: "A-1204", entryTime: "Yesterday, 6:40 PM", exitTime: "Yesterday, 9:10 PM", date: "Yesterday", status: "Exited" },
  { id: "hist-4", name: "Unknown Visitor", type: "Guest", flat: "—", entryTime: "Yesterday, 3:20 PM", exitTime: "—", date: "Yesterday", status: "Denied" },
];

// QR pass samples keyed by simulated scan outcome
export const QR_SAMPLES = {
  valid: {
    status: "VALID",
    name: "Rahul Sharma",
    type: "Guest",
    resident: "Ananya Rao",
    flat: "B-1204",
    tower: "Tower B",
    window: "11:00 AM – 1:00 PM",
    purpose: "Personal visit",
    vehicle: "TS09AB1234",
    people: 2,
    passId: "RUH-QR-88213",
  },
  expired: {
    status: "EXPIRED",
    name: "Farhan Khan",
    type: "Guest",
    resident: "Divya Shah",
    flat: "C-702",
    tower: "Tower C",
    window: "Yesterday · 5:00 PM – 7:00 PM",
    purpose: "Personal visit",
    vehicle: "—",
    people: 1,
    passId: "RUH-QR-87990",
  },
  used: {
    status: "ALREADY_USED",
    name: "Ritika Bose",
    type: "Guest",
    resident: "Anand Krishnan",
    flat: "B-1101",
    tower: "Tower B",
    window: "Today · 9:00 AM – 11:00 AM",
    purpose: "Personal visit",
    vehicle: "—",
    people: 1,
    passId: "RUH-QR-88104",
    usedAt: "Today, 9:12 AM",
  },
  revoked: {
    status: "REVOKED",
    name: "Sanjay Gupta",
    type: "Guest",
    resident: "Neha Joshi",
    flat: "A-501",
    tower: "Tower A",
    window: "Today · 1:00 PM – 3:00 PM",
    purpose: "Personal visit",
    vehicle: "—",
    people: 1,
    passId: "RUH-QR-88250",
    revokedReason: "Cancelled by resident",
  },
  invalid: {
    status: "INVALID",
    passId: null,
  },
};

// ---------------------------------------------------------------------------
// OTP samples
// ---------------------------------------------------------------------------

export const OTP_SAMPLES = {
  valid: {
    outcome: "VALID",
    name: "Arjun Mehta",
    type: "Cab / Taxi",
    resident: "Meera Nair",
    flat: "C-1502",
    tower: "Tower C",
    window: "2:00 PM – 2:30 PM",
    purpose: "Airport drop",
    vehicle: "KA05MN7821",
  },
  invalid: { outcome: "INVALID" },
  expired: { outcome: "EXPIRED", name: "Kabir Singh", flat: "B-1004", resident: "Simran Kaur" },
  used: { outcome: "ALREADY_USED", name: "Vivek Rao", flat: "A-802", resident: "Pooja Rao", usedAt: "Today, 10:05 AM" },
};

// ---------------------------------------------------------------------------
// Parking
// ---------------------------------------------------------------------------

export const PARKING_SLOTS = [
  { id: "V-01", status: "occupied", vehicle: "TS09AB1234", visitor: "Rahul Sharma", flat: "B-1204" },
  { id: "V-02", status: "available" },
  { id: "V-03", status: "available" },
  { id: "V-04", status: "occupied", vehicle: "TS10CD5566", visitor: "Bhaskar Rao (Driver)", flat: "A-1204" },
  { id: "V-05", status: "reserved", note: "Reserved · Clubhouse event" },
  { id: "V-06", status: "available" },
  { id: "V-07", status: "occupied", vehicle: "TS07XY9090", visitor: "Zomato Delivery", flat: "B-604" },
  { id: "V-08", status: "available" },
];

// ---------------------------------------------------------------------------
// Vehicle / ANPR
// ---------------------------------------------------------------------------

export const ANPR_SAMPLES = {
  matched: {
    result: "MATCHED",
    plate: "TS09AB1234",
    visitor: "Rahul Sharma",
    resident: "Ananya Rao",
    flat: "B-1204",
    expected: "11:00 AM – 1:00 PM",
  },
  unmatched: {
    result: "UNMATCHED",
    plate: "AP29BZ4410",
  },
  unknown: {
    result: "UNKNOWN",
    plate: "KA41Q9981",
  },
};

// ---------------------------------------------------------------------------
// Staff / service workers
// ---------------------------------------------------------------------------

export const STAFF_WORKERS = [
  { id: "stf-1", name: "Lakshmi Devi", category: "Maid", flat: "B-1204", resident: "Ananya Rao", verified: true, accessMethod: "RFID card", status: "Outside" },
  { id: "stf-2", name: "Bhaskar Rao", category: "Driver", flat: "A-1204", resident: "Karthik Iyer", verified: true, accessMethod: "QR", status: "Inside", entryTime: "8:31 AM" },
  { id: "stf-3", name: "Ramesh Electric Works", category: "Technician", flat: "C-1502", resident: "Meera Nair", verified: true, accessMethod: "Manual + ID", status: "Outside" },
  { id: "stf-4", name: "Suman Kumari", category: "Cook", flat: "A-903", resident: "Vikram Malhotra", verified: false, accessMethod: "Pending verification", status: "Outside" },
  { id: "stf-5", name: "Ganesh Auto Clean", category: "Car cleaner", flat: "B-803", resident: "Ritu Sharma", verified: true, accessMethod: "RFID card", status: "Inside", entryTime: "7:15 AM" },
];

// ---------------------------------------------------------------------------
// Patrol
// ---------------------------------------------------------------------------

export const PATROL_ROUTE = {
  name: "Perimeter Route A",
  shift: "Morning Shift",
  checkpoints: [
    { id: "cp-1", name: "Main Gate", status: "done", time: "08:05 AM" },
    { id: "cp-2", name: "Tower A Lobby", status: "done", time: "08:22 AM" },
    { id: "cp-3", name: "Clubhouse", status: "current", time: null },
    { id: "cp-4", name: "Tower B Basement", status: "pending", time: null },
    { id: "cp-5", name: "Children's Park", status: "pending", time: null },
    { id: "cp-6", name: "Service Gate", status: "pending", time: null },
  ],
};

export const PATROL_HISTORY = [
  { id: "ph-1", route: "Night Route", date: "Yesterday", completed: 6, total: 6, missed: 0 },
  { id: "ph-2", route: "Perimeter Route A", date: "2 days ago", completed: 5, total: 6, missed: 1 },
];

// ---------------------------------------------------------------------------
// Incidents
// ---------------------------------------------------------------------------

export const INCIDENT_CATEGORIES = [
  "Suspicious Activity",
  "Vehicle Issue",
  "Visitor Issue",
  "Safety Issue",
  "Property Damage",
  "Medical Emergency",
  "Other",
];

export const INCIDENTS = [
  { id: "INC-241", category: "Vehicle Issue", location: "Visitor Parking · V-06", description: "Unattended vehicle blocking fire lane.", status: "Open", time: "Today, 9:40 AM", reportedBy: "GRD-1042" },
  { id: "INC-238", category: "Suspicious Activity", location: "Tower C Basement", description: "Unfamiliar person seen near storage area.", status: "Under Review", time: "Yesterday, 11:20 PM", reportedBy: "GRD-1009" },
  { id: "INC-230", category: "Property Damage", location: "Children's Park", description: "Damaged swing set reported.", status: "Resolved", time: "3 days ago", reportedBy: "GRD-1042" },
];

// ---------------------------------------------------------------------------
// Shift / handover / notifications
// ---------------------------------------------------------------------------

export const SHIFT_ROSTER = [
  { time: "08:00 AM – 04:00 PM", gate: "Main Gate", guard: "Suresh Kumar", isCurrentUser: true },
  { time: "04:00 PM – 12:00 AM", gate: "Main Gate", guard: "Naveen Das", isCurrentUser: false },
  { time: "12:00 AM – 08:00 AM", gate: "Main Gate", guard: "Irfan Ali", isCurrentUser: false },
];

export const HANDOVER_NOTES = [
  { id: "h-1", from: "Irfan Ali", time: "Today, 7:58 AM", note: "Visitor parking V-05 reserved for clubhouse event till 6 PM." },
  { id: "h-2", from: "Irfan Ali", time: "Today, 7:56 AM", note: "INC-241 vehicle issue still open — follow up with owner of TS-plate car in V-06." },
];

// ---------------------------------------------------------------------------
// Head Guard (Guard-tier superset — same on-post duties, plus cross-gate
// handover oversight). Scope defaults to "society-wide" pending sign-off
// on the open scope question in the updated Technical Annexure.
// ---------------------------------------------------------------------------

export const HEAD_GUARD = {
  name: "Meera Krishnan",
  employeeId: "HG-2001",
  phone: "+91 98450 12233",
  photoInitials: "MK",
  gate: "Main Gate",
  shiftLabel: "Morning Shift",
  shiftWindow: "08:00 AM – 04:00 PM",
  scope: "Society-wide",
};

// Handover notes across every gate/guard, not just the signed-in guard's own
// shift — what a Head Guard sees that a regular Guard doesn't.
export const TEAM_HANDOVER_NOTES = [
  { id: "th-1", from: "Irfan Ali", gate: "Tower B Gate", time: "Today, 7:58 AM", note: "Visitor parking V-05 reserved for clubhouse event till 6 PM." },
  { id: "th-2", from: "Suresh Kumar", gate: "Main Gate", time: "Today, 7:56 AM", note: "INC-241 vehicle issue still open — follow up with owner of TS-plate car in V-06." },
  { id: "th-3", from: "Naveen Das", gate: "Service Gate", time: "Yesterday, 11:50 PM", note: "All quiet. Delivery gate locked at 11 PM as usual." },
  { id: "th-4", from: "Arun Prasad", gate: "Clubhouse Gate", time: "Yesterday, 8:02 PM", note: "Clubhouse event wrapped early — extra visitor parking released by 7 PM." },
];

export const NOTIFICATIONS = [
  { id: "n-1", title: "VIP visitor expected", body: "RWA committee member arriving 3:00 PM at Main Gate.", time: "5 min ago", tone: "info", read: false },
  { id: "n-2", title: "Visitor arrival", body: "Priya Reddy (Delivery) expected at 12:00 PM for A-1204.", time: "20 min ago", tone: "info", read: false },
  { id: "n-3", title: "Missed patrol checkpoint", body: "Tower B Basement checkpoint was missed on the night shift.", time: "1 hr ago", tone: "warning", read: false },
  { id: "n-4", title: "Security incident logged", body: "INC-241 raised for Visitor Parking V-06.", time: "2 hr ago", tone: "danger", read: true },
  { id: "n-5", title: "Shift reminder", body: "Your shift ends at 04:00 PM. Prepare handover notes.", time: "3 hr ago", tone: "neutral", read: true },
];
