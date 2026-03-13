"use client"

import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

export type StopType = "deliver" | "pickup" | "cash" | "return" | "mixed"
export type StopStatus = "pending" | "done" | "partial" | "issue" | "skipped"
export type DriverStatus = "offline" | "online" | "loading" | "in_route" | "completed"
export type VanStatus = "pending" | "assigned" | "loading" | "in_route" | "completed" | "issue"

export interface StopItem {
  id: string
  name: string
  qty: number
  unit: string
  price: number
  delivered?: number
  returned?: number
  weightKg?: number // New capacity fields
  volumeCbm?: number
  pallets?: number
}

export interface Stop {
  id: string
  sequence: number
  type: StopType
  customerName: string
  address: string
  phone: string
  items: StopItem[]
  expectedCash?: number
  collectedCash?: number
  status: StopStatus
  issueNote?: string
  completedAt?: string
  lat?: number
  lng?: number
  podPhoto?: string
  podSignature?: string
}

export type LoadType = "ftl" | "ptl"

export interface DeliveryNote {
  id: string
  driverId: string
  vanId: string
  warehouse: string
  date: string
  priority: "normal" | "high" | "urgent"
  loadType: LoadType
  stops: Stop[]
  notes: string
  status: "draft" | "sent" | "acknowledged" | "in_progress" | "completed"
  sentAt?: string
  region?: string
}

export interface Driver {
  id: string
  name: string
  phone: string
  initials: string
  vanId: string
  status: DriverStatus
  rating: number
  trips: number
  acceptance: number
}

export interface Van {
  id: string
  plate: string
  model: string
  year: string
  driverId?: string
  status: VanStatus
  loadingPercent?: number
  stopProgress?: string
  maxWeightKg?: number // New capacity fields
  maxVolumeCbm?: number
  maxPallets?: number
  isRefrigerated?: boolean
  allowHazardous?: boolean
  lat?: number
  lng?: number
}

export interface VanInventoryItem {
  id: string
  name: string
  qty: number
  unit: string
  price: number
  category: string
  loadedDate: string
  noteId?: string
}

export interface Invoice {
  id: string
  customerName: string
  sub: string // e.g. "Inv #1024 · 2 mins ago"
  amount: number
  status: "Paid" | "Credit"
  icon: string
  date: string
}

export interface ActivityLog {
  id: string
  driverName: string
  time: string
  loc: string
  amount: number
  icon: string
  type: "cash" | "digital"
  date: string
}

export interface AppState {
  screen: string
  prevScreen: string
  navDirection: "forward" | "back" | "root" | "fade"
  drivers: Driver[]
  vans: Van[]
  deliveryNotes: DeliveryNote[]
  activeNoteId: string | null
  currentStopIndex: number
  cashCollected: number
  totalSales: number
  invoices: Invoice[]
  activityLogs: ActivityLog[]
  vanInventory: VanInventoryItem[]
  driverStatus: DriverStatus
  ptlAvailable: DeliveryNote[]
  isSynced: boolean
  ludicrousMode: boolean
  marsTokens: number
  surgeMultiplier: number
  deadMilesKm: number
  idleTimeMins: number
}

// ─── Initial seed data ────────────────────────────────────────────────────────

const CATALOG_ITEMS: Omit<StopItem, "qty" | "delivered" | "returned">[] = [
  { id: "P001", name: "Water Bottles 500ml (x24)", unit: "case", price: 180 },
  { id: "P002", name: "Cleaning Supplies Kit", unit: "kit", price: 70 },
  { id: "P003", name: "Paper Towels Bulk", unit: "pack", price: 12 },
  { id: "P004", name: "Oil Filter XJ-900", unit: "unit", price: 45 },
  { id: "P005", name: "Brake Pad Set (Ceramic)", unit: "set", price: 220 },
  { id: "P006", name: "Synthetic Motor Oil 5W-30", unit: "litre", price: 35 },
  { id: "P007", name: "Air Freshener (x12)", unit: "box", price: 60 },
  { id: "P008", name: "Wiper Blades Set", unit: "set", price: 85 },
]

export { CATALOG_ITEMS }

const initialDrivers: Driver[] = [
  {
    id: "D001",
    name: "Ahmed Al-Sudairi",
    phone: "+966 50 123 4567",
    initials: "AS",
    vanId: "V001",
    status: "offline",
    rating: 4.9,
    trips: 1247,
    acceptance: 94,
  },
  {
    id: "D002",
    name: "Fahad Al-Rashid",
    phone: "+966 55 987 6543",
    initials: "FA",
    vanId: "V002",
    status: "in_route",
    rating: 4.7,
    trips: 856,
    acceptance: 91,
  },
]

const initialVans: Van[] = [
  { id: "V001", plate: "VAN-402", model: "Mercedes Sprinter", year: "2022", driverId: "D001", status: "pending", maxWeightKg: 1500, maxVolumeCbm: 12, maxPallets: 4, isRefrigerated: true, allowHazardous: false, lat: 24.7136, lng: 46.6753 },
  { id: "V002", plate: "VAN-315", model: "Ford Transit", year: "2023", driverId: "D002", status: "in_route", stopProgress: "Stop 4/12", maxWeightKg: 1200, maxVolumeCbm: 10, maxPallets: 3, isRefrigerated: false, allowHazardous: false, lat: 24.6900, lng: 46.6800 },
]

// A realistic pre-built delivery note so the app is immediately alive
const sampleNote: DeliveryNote = {
  id: "DN-2401",
  driverId: "D001",
  vanId: "V001",
  warehouse: "Riyadh Central Hub — Gate 4",
  date: "2026-02-27",
  priority: "high",
  loadType: "ptl",
  notes: "Call customer 5 min before arrival. Handle Fragile items carefully.",
  status: "sent",
  sentAt: new Date().toISOString(),
  stops: [
    {
      id: "S001",
      sequence: 1,
      type: "deliver",
      customerName: "Al-Farsi Supermarket",
      address: "King Fahd Road, Al-Olaya, Riyadh",
      phone: "+966 11 234 5678",
      items: [
        { id: "P001", name: "Water Bottles 500ml (x24)", qty: 6, unit: "case", price: 180, delivered: 0, weightKg: 12, volumeCbm: 0.05, pallets: 0 },
        { id: "P003", name: "Paper Towels Bulk", qty: 12, unit: "pack", price: 12, delivered: 0, weightKg: 2, volumeCbm: 0.1, pallets: 0 },
      ],
      status: "pending",
      lat: 24.7001, lng: 46.6811
    },
    {
      id: "S002",
      sequence: 2,
      type: "mixed",
      customerName: "Bin Dawood Store — Olaya",
      address: "Olaya St, Riyadh 12211",
      phone: "+966 11 345 6789",
      items: [
        { id: "P002", name: "Cleaning Supplies Kit", qty: 4, unit: "kit", price: 70, delivered: 0, weightKg: 5, volumeCbm: 0.02, pallets: 0 },
        { id: "P007", name: "Air Freshener (x12)", qty: 3, unit: "box", price: 60, delivered: 0, weightKg: 1, volumeCbm: 0.01, pallets: 0 },
      ],
      expectedCash: 450,
      collectedCash: 0,
      status: "pending",
      lat: 24.6933, lng: 46.6853
    },
    {
      id: "S003",
      sequence: 3,
      type: "pickup",
      customerName: "Auto Parts Hub",
      address: "Industrial Area, Riyadh",
      phone: "+966 11 456 7890",
      items: [
        { id: "P004", name: "Oil Filter XJ-900", qty: 20, unit: "unit", price: 45, delivered: 0, weightKg: 0.5, volumeCbm: 0.005, pallets: 0 },
        { id: "P005", name: "Brake Pad Set (Ceramic)", qty: 4, unit: "set", price: 220, delivered: 0, weightKg: 2.5, volumeCbm: 0.01, pallets: 0 },
      ],
      status: "pending",
      lat: 24.6433, lng: 46.7153
    },
    {
      id: "S004",
      sequence: 4,
      type: "cash",
      customerName: "Tamimi Markets",
      address: "Prince Mohammed bin Abdulaziz Rd, Riyadh",
      phone: "+966 11 567 8901",
      items: [],
      expectedCash: 1200,
      collectedCash: 0,
      status: "pending",
      lat: 24.7113, lng: 46.6663
    },
  ],
}

// PTL nearby pickup opportunities for driver
const ptlPickupNotes: DeliveryNote[] = [
  {
    id: "DN-PTL-01",
    driverId: "",
    vanId: "",
    warehouse: "Riyadh East Depot",
    date: "2026-02-27",
    priority: "normal",
    loadType: "ptl",
    notes: "Same region as current route. Quick pickup.",
    status: "sent",
    region: "Al-Olaya, Riyadh",
    stops: [
      {
        id: "SPTL01",
        sequence: 1,
        type: "pickup",
        customerName: "Electronics World",
        address: "Olaya St, near Tamimi, Riyadh",
        phone: "+966 11 678 1234",
        items: [
          { id: "P009", name: "Laptop Chargers (x10)", qty: 5, unit: "box", price: 150, weightKg: 3, volumeCbm: 0.01, pallets: 0 },
          { id: "P010", name: "USB-C Cables (x50)", qty: 2, unit: "pack", price: 80, weightKg: 1, volumeCbm: 0.005, pallets: 0 },
        ],
        status: "pending",
        lat: 24.6990, lng: 46.6820
      },
    ],
  },
  {
    id: "DN-PTL-02",
    driverId: "",
    vanId: "",
    warehouse: "Riyadh South Hub",
    date: "2026-02-27",
    priority: "high",
    loadType: "ptl",
    notes: "Urgent — customer waiting.",
    status: "sent",
    region: "Industrial Area, Riyadh",
    stops: [
      {
        id: "SPTL02",
        sequence: 1,
        type: "deliver",
        customerName: "BuildMart Supplies",
        address: "Industrial Area 2, Riyadh",
        phone: "+966 11 789 2345",
        items: [
          { id: "P011", name: "Safety Helmets (x20)", qty: 10, unit: "case", price: 95, weightKg: 15, volumeCbm: 0.1, pallets: 1 },
        ],
        status: "pending",
        lat: 24.6400, lng: 46.7110
      },
    ],
  },
]

const initialInvoices: Invoice[] = [
  { id: "INV-1024", customerName: "Al-Baik Restaurant", sub: "Inv #1024 · 2 mins ago", amount: 450, status: "Paid", icon: "receipt_long", date: new Date().toISOString() },
  { id: "INV-1023", customerName: "Panda Retail", sub: "Inv #1023 · 15 mins ago", amount: 1200, status: "Credit", icon: "storefront", date: new Date().toISOString() },
  { id: "INV-1022", customerName: "Barn's Cafe", sub: "Inv #1022 · 42 mins ago", amount: 210, status: "Paid", icon: "local_cafe", date: new Date().toISOString() },
]

const initialLogs: ActivityLog[] = [
  { id: "L001", driverName: "Ahmed Al-Sudairi", time: "10:30 AM", loc: "Riyadh", amount: 450, icon: "person", type: "cash", date: new Date().toISOString() },
  { id: "L002", driverName: "Ahmed Al-Sudairi", time: "09:15 AM", loc: "Olaya", amount: 120, icon: "local_shipping", type: "digital", date: new Date().toISOString() },
]

const initialState: AppState = {
  screen: "launcher",
  prevScreen: "",
  navDirection: "root",
  drivers: initialDrivers,
  vans: initialVans,
  deliveryNotes: [sampleNote],
  activeNoteId: sampleNote.id,
  currentStopIndex: 0,
  cashCollected: 0,
  totalSales: 12450,
  invoices: initialInvoices,
  activityLogs: initialLogs,
  vanInventory: [],
  driverStatus: "offline",
  ptlAvailable: ptlPickupNotes,
  isSynced: true,
  ludicrousMode: false,
  marsTokens: 0,
  surgeMultiplier: 1.0,
  deadMilesKm: 0,
  idleTimeMins: 0,
}

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: "GO_TO"; screen: string; direction?: "forward" | "back" | "root" | "fade" }
  | { type: "SET_DRIVER_STATUS"; status: DriverStatus }
  | { type: "SET_VAN_STATUS"; vanId: string; status: VanStatus; extra?: Partial<Van> }
  | { type: "SEND_DELIVERY_NOTE"; note: DeliveryNote }
  | { type: "ACKNOWLEDGE_NOTE"; noteId: string }
  | { type: "LOAD_VAN_FROM_NOTE"; noteId: string }
  | { type: "COMPLETE_STOP"; stopId: string; delivered: number[]; cash?: number; issueNote?: string; status: StopStatus }
  | { type: "NEXT_STOP" }
  | { type: "REGISTER_DRIVER"; driver: Driver }
  | { type: "REGISTER_VAN"; van: Van }
  | { type: "SET_ACTIVE_NOTE"; noteId: string }
  | { type: "SAVE_DRAFT_NOTE"; note: DeliveryNote }
  | { type: "UPDATE_NOTE_STATUS"; noteId: string; status: DeliveryNote["status"] }
  | { type: "MOVE_VAN_COLUMN"; vanId: string; newStatus: VanStatus }
  | { type: "ACCEPT_PTL_NOTE"; noteId: string; driverId: string; vanId: string }
  | { type: "DECLINE_PTL_NOTE"; noteId: string }
  | { type: "UNLOAD_VAN_ITEM"; itemId: string; qty: number }
  | { type: "ADD_CUSTOM_VAN_ITEM"; item: VanInventoryItem }
  | { type: "SET_VAN_INVENTORY"; items: VanInventoryItem[] }
  | { type: "REORDER_STOPS"; noteId: string; stops: Stop[] }
  | { type: "SET_SYNCED"; synced: boolean }
  | { type: "TOGGLE_LUDICROUS" }
  | { type: "ADD_TOKENS"; amount: number }
  | { type: "SET_SURGE"; multiplier: number }
  | { type: "LOG_EFFICIENCY"; deadMiles?: number; idleTime?: number }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "GO_TO":
      return { ...state, prevScreen: state.screen, screen: action.screen, navDirection: action.direction ?? "forward" }

    case "SET_DRIVER_STATUS":
      return { ...state, driverStatus: action.status, isSynced: false }

    case "SET_VAN_STATUS":
      return {
        ...state,
        vans: state.vans.map((v) =>
          v.id === action.vanId ? { ...v, status: action.status, ...action.extra } : v
        ),
      }

    case "SEND_DELIVERY_NOTE": {
      const updated = state.deliveryNotes.filter((n) => n.id !== action.note.id)
      return {
        ...state,
        deliveryNotes: [...updated, action.note],
        activeNoteId: action.note.id,
      }
    }

    case "ACKNOWLEDGE_NOTE":
      return {
        ...state,
        deliveryNotes: state.deliveryNotes.map((n) =>
          n.id === action.noteId ? { ...n, status: "acknowledged" } : n
        ),
      }

    case "LOAD_VAN_FROM_NOTE": {
      const note = state.deliveryNotes.find((n) => n.id === action.noteId)
      if (!note) return state
      const allItems: VanInventoryItem[] = [...state.vanInventory]
      const today = new Date().toISOString().slice(0, 10)
      note.stops.forEach((stop) => {
        if (stop.type === "deliver" || stop.type === "mixed") {
          stop.items.forEach((item) => {
            const existing = allItems.find((i) => i.id === item.id)
            if (existing) {
              existing.qty += item.qty
            } else {
              allItems.push({
                id: item.id,
                name: item.name,
                qty: item.qty,
                unit: item.unit,
                price: item.price,
                category: "General",
                loadedDate: today,
                noteId: note.id,
              })
            }
          })
        }
      })
      return { ...state, vanInventory: allItems, driverStatus: "loading", isSynced: false }
    }

    case "SET_SYNCED":
      return { ...state, isSynced: action.synced }

    case "COMPLETE_STOP": {
      const note = state.deliveryNotes.find((n) => n.id === state.activeNoteId)
      if (!note) return state

      const targetStop = note.stops.find(s => s.id === action.stopId);
      if (!targetStop) return state;

      // Calculate sale amount for this stop
      let stopAmount = action.cash ?? 0;
      if (targetStop.type === 'deliver' || targetStop.type === 'mixed') {
        targetStop.items.forEach((item, idx) => {
          const delivered = action.delivered[idx] ?? 0;
          stopAmount += delivered * item.price;
        });
      }

      const updatedStops = note.stops.map((s) => {
        if (s.id !== action.stopId) return s
        const updatedItems = s.items.map((item, idx) => ({
          ...item,
          delivered: action.delivered[idx] ?? 0,
          returned: item.qty - (action.delivered[idx] ?? 0),
        }))
        return {
          ...s,
          items: updatedItems,
          collectedCash: action.cash ?? s.collectedCash,
          issueNote: action.issueNote,
          status: action.status,
          completedAt: new Date().toISOString(),
        }
      })

      // Dynamic Invoice Generation
      const newInvoice: Invoice = {
        id: `INV-${Date.now()}`,
        customerName: targetStop.customerName,
        sub: `Inv #${Math.floor(Math.random() * 1000 + 1000)} · Just now`,
        amount: stopAmount,
        status: action.cash ? "Paid" : "Credit",
        icon: targetStop.type === 'cash' ? "payments" : "receipt_long",
        date: new Date().toISOString()
      };

      // Dynamic Activity Log Generation
      const driver = state.drivers.find(d => d.id === note.driverId);
      const newLog: ActivityLog = {
        id: `L-${Date.now()}`,
        driverName: driver?.name ?? "Unknown",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        loc: targetStop.address.split(',')[1]?.trim() ?? targetStop.address,
        amount: stopAmount,
        icon: targetStop.type === 'cash' ? "payments" : "local_shipping",
        type: action.cash ? "cash" : "digital",
        date: new Date().toISOString()
      };

      return {
        ...state,
        cashCollected: state.cashCollected + (action.cash ?? 0),
        totalSales: (state.totalSales || 0) + stopAmount,
        invoices: [newInvoice, ...(state.invoices || [])].slice(0, 20),
        activityLogs: [newLog, ...(state.activityLogs || [])].slice(0, 20),
        deliveryNotes: state.deliveryNotes.map((n) =>
          n.id === state.activeNoteId ? { ...n, stops: updatedStops } : n
        ),
        isSynced: false,
      }
    }

    case "NEXT_STOP": {
      const note = state.deliveryNotes.find((n) => n.id === state.activeNoteId)
      const total = note?.stops.length ?? 0
      const next = state.currentStopIndex + 1
      if (next >= total) {
        // All stops done
        return {
          ...state,
          currentStopIndex: 0,
          deliveryNotes: state.deliveryNotes.map((n) =>
            n.id === state.activeNoteId ? { ...n, status: "completed" } : n
          ),
          driverStatus: "completed",
        }
      }
      return { ...state, currentStopIndex: next, isSynced: false }
    }

    case "REGISTER_DRIVER":

      return { ...state, drivers: [...state.drivers, action.driver] }

    case "REGISTER_VAN":
      return { ...state, vans: [...state.vans, action.van] }

    case "SET_ACTIVE_NOTE":
      return { ...state, activeNoteId: action.noteId, currentStopIndex: 0 }

    case "SAVE_DRAFT_NOTE": {
      const existing = state.deliveryNotes.filter((n) => n.id !== action.note.id)
      return {
        ...state,
        deliveryNotes: [...existing, { ...action.note, status: "draft" }],
      }
    }

    case "UPDATE_NOTE_STATUS":
      return {
        ...state,
        deliveryNotes: state.deliveryNotes.map((n) =>
          n.id === action.noteId ? { ...n, status: action.status } : n
        ),
      }

    case "MOVE_VAN_COLUMN":
      return {
        ...state,
        vans: state.vans.map((v) =>
          v.id === action.vanId ? { ...v, status: action.newStatus } : v
        ),
      }

    case "ACCEPT_PTL_NOTE": {
      const ptlNote = state.ptlAvailable.find((n) => n.id === action.noteId)
      if (!ptlNote) return state
      const accepted: DeliveryNote = {
        ...ptlNote,
        driverId: action.driverId,
        vanId: action.vanId,
        status: "acknowledged",
      }
      return {
        ...state,
        deliveryNotes: [...state.deliveryNotes, accepted],
        ptlAvailable: state.ptlAvailable.filter((n) => n.id !== action.noteId),
      }
    }

    case "DECLINE_PTL_NOTE":
      return {
        ...state,
        ptlAvailable: state.ptlAvailable.filter((n) => n.id !== action.noteId),
      }

    case "UNLOAD_VAN_ITEM": {
      return {
        ...state,
        vanInventory: state.vanInventory
          .map((item) =>
            item.id === action.itemId
              ? { ...item, qty: item.qty - action.qty }
              : item
          )
          .filter((item) => item.qty > 0),
      }
    }

    case "ADD_CUSTOM_VAN_ITEM":
      return { ...state, vanInventory: [...state.vanInventory, action.item] }

    case "SET_VAN_INVENTORY":
      return { ...state, vanInventory: action.items }

    case "REORDER_STOPS":
      return {
        ...state,
        deliveryNotes: state.deliveryNotes.map((n) =>
          n.id === action.noteId ? { ...n, stops: action.stops } : n
        ),
      }

    case "TOGGLE_LUDICROUS":
      return { ...state, ludicrousMode: !state.ludicrousMode }

    case "ADD_TOKENS":
      return { ...state, marsTokens: state.marsTokens + action.amount }

    case "SET_SURGE":
      return { ...state, surgeMultiplier: action.multiplier }

    case "LOG_EFFICIENCY":
      return {
        ...state,
        deadMilesKm: state.deadMilesKm + (action.deadMiles ?? 0),
        idleTimeMins: state.idleTimeMins + (action.idleTime ?? 0)
      }

    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
  goTo: (screen: string, direction?: "forward" | "back" | "root" | "fade") => void
  activeNote: DeliveryNote | null
  currentStop: Stop | null
  activeDriver: Driver | null
  activeVan: Van | null
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Auto-sync simulation
  useEffect(() => {
    if (!state.isSynced) {
      const timer = setTimeout(() => {
        dispatch({ type: "SET_SYNCED", synced: true })
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [state.isSynced])

  const goTo = useCallback(
    (screen: string, direction: "forward" | "back" | "root" | "fade" = "forward") =>
      dispatch({ type: "GO_TO", screen, direction }),
    []
  )

  const activeNote = state.deliveryNotes.find((n) => n.id === state.activeNoteId) ?? null
  const currentStop = activeNote?.stops[state.currentStopIndex] ?? null
  const activeDriver = state.drivers.find((d) => d.id === activeNote?.driverId) ?? state.drivers[0] ?? null
  const activeVan = state.vans.find((v) => v.id === activeNote?.vanId) ?? state.vans[0] ?? null

  return (
    <AppContext.Provider value={{ state, dispatch, goTo, activeNote, currentStop, activeDriver, activeVan }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used inside AppProvider")
  return ctx
}
