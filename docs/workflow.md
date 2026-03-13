# Detailed Delivery Fleet Workflow (Low-Level & High-Level)

This document outlines the complete operational workflow from registering a new employee (driver) and van, all the way to the van setting off for delivery, capturing minute interaction details for optimization analysis.

## Phase 1: Registration and Setup (Company Portal)

### 1. Employee (Driver) Registration
The company administrator or fleet manager logs into the **Company Portal** to onboard a new driver.
- **Navigation:** Click on the "Drivers" icon (bottom nav) or navigate to `DriverProfile` / Registration.
- **Screen:** `Register Driver` (3-Step Wizard)
  - **Step 1: Personal Details**
    - **Photo:** (Optional) Click the dashed circle to upload a photo (shows "add_a_photo" icon).
    - **Full Name:** Text input (e.g., "Ahmed Al-Sudairi").
    - **Phone Number:** Telephone input (e.g., "+966 5X XXX XXXX").
    - **Nationality:** Text input (e.g., "Saudi Arabian").
    - **Emergency Contact:** Telephone input.
    - **Action:** Click the black "Continue" button.
  - **Step 2: ID & License**
    - **National ID / Iqama:** Text input (e.g., "1098765432").
    - **Driving License Number:** Text input (e.g., "LIC-2024-00234").
    - **Blood Group:** Text input (e.g., "O+, A-, B+").
    - **Login Password:** Password input (Min 8 characters).
    - **Documents:** Click dashed boxes to upload "ID Front", "ID Back", "License", and "Selfie".
    - **Action:** Click the black "Continue" button.
  - **Step 3: Assign Van (Optional)**
    - **Selection:** List of available vans. Click a van card (shows ✅) or click "No van (assign later)".
    - **Action:** Click the green "Register Driver" button with the person_add icon.
  - **Outcome:** Success screen appears. Driver is added to the shared `AppContext` (`REGISTER_DRIVER`) and can now be seen on the Fleet Board. Click "Fleet Board" to continue or "Add Another".

### 2. Van (Vehicle) Registration
The administrator registers a new delivery vehicle.
- **Navigation:** Navigate to Vehicle Registration.
- **Screen:** `Register Van`
  - **Fields:**
    - **Plate number:** Text input (e.g., "1234 ABC").
    - **VIN Number:** Text input.
    - **Insurance Expiry:** Date picker.
    - **Permit Expiry:** Date picker.
    - **Make & model:** Text input (e.g., "Toyota HiAce").
    - **Year:** Number input.
    - **Max Weight (kg):** Number input (e.g., "3000").
    - **Max Volume (m³):** Number input (e.g., "14").
    - **Pallet Slots:** Number input.
  - **Toggles:** Checkboxes for "Refrigerated" and "Hazmat Allowed".
  - **Driver Assignment:** Search bar to find an unassigned driver. Click a driver card to assign, or select "No driver".
  - **Documents:** Click dashed boxes to upload "Insurance" and "Permits" (PDF/JPG).
  - **Action:** Click the green "ADD VAN" button at the bottom.
  - **Outcome:** Success screen appears. Van is saved to state (`REGISTER_VAN`). Click "Fleet Board" to continue.

## Phase 2: Task Assignment (Company Portal)

### 3. Delivery Note Creation & Dispatch
The dispatcher prepares the day's tasks using the live Kanban board.
- **Navigation:** Click on "Board" (Kanban Dashboard).
- **Screen:** `Fleet Board`
  - **Layout:** Columns for Pending, Assigned, Loading, In Route, Completed, Issue.
  - **Action:** Locate a Van in the "Pending" column. Click the green "Assign" button on the van card or column header.
  - **Routing Details:** (Delivery Note Screen) Enter stops, drop-offs, pickups, and cash collection expectations.
  - **Outcome:** Delivery Note is saved (`status="sent"`). The Van column status updates. The Dispatch notes are pushed directly to the driver's device via `AppContext`.

## Phase 3: Driver Preparation (Driver Portal)

### 4. Going Online & Inbox Check
The driver opens the App to review assigned routes.
- **Navigation:** Open `DeliveryInbox` (Inbox icon on bottom nav).
- **Screen:** `Inbox` (Tabs: Active, Completed)
  - **Active Tab:** Shows new delivery notes. The card displays priority (e.g., Urgent/High), status ("New"), Customer Name/Route, Stop Count, Total Items, and Total Cash to collect.
  - **PTL (Partial Truck Load):** Driver may see "Nearby Pickups" recommendations. Driver checks their capacity vs. item weight. Can click "Take It" (green button) or "Skip" (gray button).
  - **Action:** Driver clicks the green "Start route" button on their assigned Note Card.
  - **State Changes:** Triggers `SET_ACTIVE_NOTE`, `ACKNOWLEDGE_NOTE`, and `LOAD_VAN_FROM_NOTE`. System navigates to the pre-trip or loading screen.

### 5. Pre-Trip Vehicle Check (Optional step in full flow before Loading)
- **Screen:** `PreTripCheck`
  - **Action:** Driver verifies tire pressure, oil levels, and lights by tapping checkboxes.
  - **Inputs:** Driver types in the current odometer reading and selects fuel level.
  - **Submit:** Taps "Condition Safe" button. 

### 6. Warehouse Loading
Driver proceeds to the warehouse (e.g., Jeddah Central, Gate 4) to verify loaded inventory.
- **Screen:** `Warehouse Loading`
  - **Top Area:** Shows a dark map backdrop with the warehouse location and a large loading percentage indicator (e.g., 0% Loaded).
  - **Manifest List:** Scrollable list of items to load (displays Customer Name, Qty, Unit).
  - **Action 1 (Manual Check):** Tap each item row to mark it as loaded. The icon changes from a gray package to a green checkmark, and the progress bar fills up.
  - **Action 2 (Bulk Check):** Alternately, tap the "Confirm all" button at the top of the manifest to load everything.
  - **Bottom Footer:** Shows total weight and volume. The gray "DEPART" button disabled constraint unlocks and turns into a bright green "DEPART" button ONLY when the load is at 100%.
  - **Action:** Driver taps "DEPART" (triggers heavy haptic feedback).
  - **State Change:** Triggers `SET_DRIVER_STATUS: in_route`.

## Phase 4: Dispatch

### 7. Van Sets Off (Route Navigation)
The driver leaves the warehouse, navigating to the first stop.
- **Screen:** `Route Navigation`
  - **Map UI:** Full-screen 3D Mapbox/Maplibre integration. Shows current driver GPS location, glowing green route line, alternative routes, numbered stop pins, speed cameras, and 3D buildings.
  - **Top HUD:** Displays the immediate next turn (e.g., "Turn right onto King Fahd Rd") with distance.
  - **Metrics Bar:** Shows Live Speed (km/h), Distance to next stop (e.g., 5.2 km), and ETA (e.g., 12m).
  - **Bottom Sheet:** Displays the next Customer Name, address, expected cash to collect (with a yellow warning box), and items to deliver.
  - **Actions:** Driver has quick-action circle buttons to "Call" or "Chat" with the customer.
  - **Next Step:** Upon arriving at the GPS pin, driver taps the large black "I'M HERE" button to proceed to the Stop Action/Proof of Delivery screen.
