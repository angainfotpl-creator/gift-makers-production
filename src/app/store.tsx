import { createContext, useContext, useState, ReactNode } from "react";

export type Employee = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  department: string;
  status: "active" | "inactive";
};

export type WorkflowStep = {
  id: string;
  name: string;
  minTime: number;
  maxTime: number;
};

export type Category = {
  id: string;
  name: string;
  code: string;
  description: string;
  employeeIds: string[];
  workflow: WorkflowStep[];
  active: boolean;
};

export type Order = {
  id: string;
  orderDate: string;
  itemName: string;
  buyer: string;
  quantity: number;
  price: number;
  total: number;
  shipName: string;
  shipAddress: string;
  shipCity: string;
  shipState: string;
  shipZip: string;
  shipCountry: string;
  transactionId: string;
  variations: string;
  status: "pending" | "work_order_generated" | "in_production" | "qc_done" | "dispatched";
};

export type WorkOrder = {
  id: string;
  orderId: string;
  categoryId: string;
  approver1Id: string;
  approver2Id: string;
  generatedDate: string;
  currentStep: number;
  stepStatuses: ("pending" | "in_progress" | "completed")[];
};

export type Batch = {
  id: string;
  name: string;
  orderIds: string[];
  agentName: string;
  area: string;
  dispatchDate: string;
};

type Store = {
  employees: Employee[];
  setEmployees: (e: Employee[]) => void;
  categories: Category[];
  setCategories: (c: Category[]) => void;
  orders: Order[];
  setOrders: (o: Order[]) => void;
  workOrders: WorkOrder[];
  setWorkOrders: (w: WorkOrder[]) => void;
  batches: Batch[];
  setBatches: (b: Batch[]) => void;
};

const StoreContext = createContext<Store | null>(null);

const SEED_EMPLOYEES: Employee[] = [
  { id: "e1", name: "Arjun Mehta", role: "Designer", email: "arjun@printflow.in", phone: "9876543210", department: "Design", status: "active" },
  { id: "e2", name: "Priya Sharma", role: "Operator", email: "priya@printflow.in", phone: "9123456789", department: "Production", status: "active" },
  { id: "e3", name: "Ravi Kumar", role: "QC Inspector", email: "ravi@printflow.in", phone: "9000112233", department: "Quality", status: "active" },
  { id: "e4", name: "Sunita Patel", role: "Cutter", email: "sunita@printflow.in", phone: "9988776655", department: "Production", status: "active" },
  { id: "e5", name: "Deepak Nair", role: "Finisher", email: "deepak@printflow.in", phone: "9776655443", department: "Production", status: "inactive" },
];

const SEED_CATEGORIES: Category[] = [
  {
    id: "c1", name: "Laser Printing", code: "LSR", description: "High precision laser cut and print products",
    employeeIds: ["e1", "e2", "e3", "e4"], active: true,
    workflow: [
      { id: "w1", name: "Designing", minTime: 1, maxTime: 3 },
      { id: "w2", name: "Cutting", minTime: 0.5, maxTime: 2 },
      { id: "w3", name: "Buffing", minTime: 0.5, maxTime: 1 },
      { id: "w4", name: "QC", minTime: 0.5, maxTime: 1 },
    ],
  },
  {
    id: "c2", name: "Cloth Printing", code: "CLT", description: "Screen and digital printing on fabric",
    employeeIds: ["e1", "e2", "e5"], active: true,
    workflow: [
      { id: "w5", name: "Designing", minTime: 2, maxTime: 4 },
      { id: "w6", name: "Printing", minTime: 1, maxTime: 3 },
      { id: "w7", name: "QC", minTime: 0.5, maxTime: 1 },
    ],
  },
  {
    id: "c3", name: "Cup / Bottle Printing", code: "CBP", description: "Sublimation printing on mugs, bottles, and drinkware",
    employeeIds: ["e2", "e3", "e4"], active: true,
    workflow: [
      { id: "w8", name: "Designing", minTime: 1, maxTime: 2 },
      { id: "w9", name: "Heat Press", minTime: 0.5, maxTime: 1 },
      { id: "w10", name: "QC", minTime: 0.25, maxTime: 0.5 },
    ],
  },
];

const SEED_ORDERS: Order[] = [
  // =========================
  // PENDING ORDERS
  // =========================
  {
    id: "ORD-001",
    orderDate: "08/18/26",
    itemName: "Personalized Winnie the Pooh Birthday Bag",
    buyer: "Dana Maiorino",
    quantity: 1,
    price: 56.98,
    total: 56.98,
    shipName: "Dana Maiorino",
    shipAddress: "4 Horton St",
    shipCity: "Norwalk",
    shipState: "CT",
    shipZip: "06851",
    shipCountry: "United States",
    transactionId: "5185544811",
    variations: "Size:10*12 Set of 10 Bags",
    status: "pending",
  },
  {
    id: "ORD-002",
    orderDate: "08/17/26",
    itemName: "Personalized K-Pop Huntrix Birthday Party Favor Bags",
    buyer: "Emilia Dussault",
    quantity: 1,
    price: 45.98,
    total: 45.98,
    shipName: "Emilia Dussault",
    shipAddress: "4097 Mississauga Road",
    shipCity: "Mississauga",
    shipState: "ON",
    shipZip: "L5L2S5",
    shipCountry: "Canada",
    transactionId: "5185112023",
    variations: "Size:8*10 Set of 10 Bags, Kpop Girls",
    status: "pending",
  },
  {
    id: "ORD-007",
    orderDate: "08/21/26",
    itemName: "Personalized Barbie Birthday Party Bags",
    buyer: "Sophia Williams",
    quantity: 25,
    price: 3.25,
    total: 81.25,
    shipName: "Sophia Williams",
    shipAddress: "125 Maple Street",
    shipCity: "Dallas",
    shipState: "TX",
    shipZip: "75201",
    shipCountry: "United States",
    transactionId: "5187124501",
    variations: "Size:6*8 Inches, Barbie Pink Design",
    status: "pending",
  },
  {
    id: "ORD-008",
    orderDate: "08/21/26",
    itemName: "Custom Paw Patrol Birthday Favor Bags",
    buyer: "Michael Johnson",
    quantity: 40,
    price: 2.45,
    total: 98.00,
    shipName: "Michael Johnson",
    shipAddress: "782 Oak Avenue",
    shipCity: "Austin",
    shipState: "TX",
    shipZip: "78701",
    shipCountry: "United States",
    transactionId: "5187127842",
    variations: "Size:4*6 Inches, Paw Patrol Characters",
    status: "pending",
  },
  {
    id: "ORD-009",
    orderDate: "08/20/26",
    itemName: "Personalized Frozen Elsa Birthday Bags",
    buyer: "Rachel Miller",
    quantity: 20,
    price: 3.10,
    total: 62.00,
    shipName: "Rachel Miller",
    shipAddress: "54 Lake View Drive",
    shipCity: "Orlando",
    shipState: "FL",
    shipZip: "32801",
    shipCountry: "United States",
    transactionId: "5186983217",
    variations: "Size:6*8 Inches, Elsa Design",
    status: "pending",
  },

  // =========================
  // WORK ORDER GENERATED
  // =========================
  {
    id: "ORD-003",
    orderDate: "08/17/26",
    itemName: "Personalized Mickey and Friends Birthday Bags",
    buyer: "Novia Osburn",
    quantity: 2,
    price: 5.78,
    total: 11.56,
    shipName: "Kailyn Osburn",
    shipAddress: "22025 Avalon Landing Ln",
    shipCity: "CYPRESS",
    shipState: "TX",
    shipZip: "77433",
    shipCountry: "United States",
    transactionId: "5184573211",
    variations: "Size:10*12 Inches",
    status: "work_order_generated",
  },
  {
    id: "ORD-010",
    orderDate: "08/19/26",
    itemName: "Custom Superhero Birthday Treat Bags",
    buyer: "Kevin Parker",
    quantity: 50,
    price: 2.75,
    total: 137.50,
    shipName: "Kevin Parker",
    shipAddress: "87 Green Street",
    shipCity: "Houston",
    shipState: "TX",
    shipZip: "77002",
    shipCountry: "United States",
    transactionId: "5186234198",
    variations: "Size:4*6 Inches, Superhero Mix",
    status: "work_order_generated",
  },

  // =========================
  // IN PROGRESS
  // =========================
  {
    id: "ORD-004",
    orderDate: "08/14/26",
    itemName: "Personalized Mickey Minnie Birthday Bags",
    buyer: "Matania Germain",
    quantity: 30,
    price: 2.38,
    total: 71.40,
    shipName: "Matania Germain",
    shipAddress: "4821 NW 10th Ave",
    shipCity: "Miami",
    shipState: "FL",
    shipZip: "33127",
    shipCountry: "United States",
    transactionId: "5178107664",
    variations: "Size:4*6 Inches, Minnie Design",
    status: "in_production",
  },
  {
    id: "ORD-011",
    orderDate: "08/16/26",
    itemName: "Customized Bluey Birthday Party Bags",
    buyer: "Emily Carter",
    quantity: 35,
    price: 2.60,
    total: 91.00,
    shipName: "Emily Carter",
    shipAddress: "312 Sunset Boulevard",
    shipCity: "Phoenix",
    shipState: "AZ",
    shipZip: "85001",
    shipCountry: "United States",
    transactionId: "5182415632",
    variations: "Size:6*8 Inches, Bluey & Bingo",
    status: "in_production",
  },
  {
    id: "ORD-012",
    orderDate: "08/15/26",
    itemName: "Personalized Hello Kitty Party Favor Bags",
    buyer: "Amanda Wilson",
    quantity: 60,
    price: 2.20,
    total: 132.00,
    shipName: "Amanda Wilson",
    shipAddress: "45 Rosewood Lane",
    shipCity: "Atlanta",
    shipState: "GA",
    shipZip: "30303",
    shipCountry: "United States",
    transactionId: "5181029845",
    variations: "Size:4*6 Inches, Hello Kitty Pink",
    status: "in_production",
  },
  {
    id: "ORD-013",
    orderDate: "08/14/26",
    itemName: "Custom Dinosaur Birthday Treat Bags",
    buyer: "James Anderson",
    quantity: 45,
    price: 2.50,
    total: 112.50,
    shipName: "James Anderson",
    shipAddress: "201 Forest Avenue",
    shipCity: "Chicago",
    shipState: "IL",
    shipZip: "60601",
    shipCountry: "United States",
    transactionId: "5179126384",
    variations: "Size:6*8 Inches, Dinosaur Theme",
    status: "in_production",
  },

  // =========================
  // QC DONE
  // =========================
  {
    id: "ORD-005",
    orderDate: "08/13/26",
    itemName: "Customized Bluey Dog Bingo Birthday Favor Bags",
    buyer: "Dora Seelye",
    quantity: 2,
    price: 36.98,
    total: 73.96,
    shipName: "Dora Seelye",
    shipAddress: "PO Box 441",
    shipCity: "Normangee",
    shipState: "TX",
    shipZip: "77871",
    shipCountry: "United States",
    transactionId: "5180622989",
    variations: "Size:6*8 Set of 10 Bags",
    status: "qc_done",
  },
  {
    id: "ORD-006",
    orderDate: "08/12/26",
    itemName: "Custom Mischief Managed Drawstring Treat Bag",
    buyer: "Daisy Nieto",
    quantity: 30,
    price: 2.38,
    total: 71.40,
    shipName: "Daisy Nieto",
    shipAddress: "366 Morning Star Dr",
    shipCity: "El Paso",
    shipState: "TX",
    shipZip: "79912",
    shipCountry: "United States",
    transactionId: "5179174073",
    variations: "Size:4*6 Inches",
    status: "qc_done",
  },
  {
    id: "ORD-014",
    orderDate: "08/11/26",
    itemName: "Personalized Minnie Mouse Party Bags",
    buyer: "Laura Thompson",
    quantity: 25,
    price: 3.15,
    total: 78.75,
    shipName: "Laura Thompson",
    shipAddress: "78 Palm Street",
    shipCity: "Tampa",
    shipState: "FL",
    shipZip: "33602",
    shipCountry: "United States",
    transactionId: "5178012946",
    variations: "Size:6*8 Inches, Minnie Pink",
    status: "qc_done",
  },

  // =========================
  // COMPLETED
  // =========================
  {
    id: "ORD-015",
    orderDate: "08/08/26",
    itemName: "Custom Wedding Favor Gift Bags",
    buyer: "Olivia Brown",
    quantity: 100,
    price: 1.85,
    total: 185.00,
    shipName: "Olivia Brown",
    shipAddress: "22 Garden Road",
    shipCity: "Boston",
    shipState: "MA",
    shipZip: "02108",
    shipCountry: "United States",
    transactionId: "5174219082",
    variations: "Size:6*8 Inches, Gold Wedding Design",
    status: "completed",
  },
  {
    id: "ORD-016",
    orderDate: "08/07/26",
    itemName: "Personalized Baby Shower Favor Bags",
    buyer: "Jennifer Davis",
    quantity: 75,
    price: 2.10,
    total: 157.50,
    shipName: "Jennifer Davis",
    shipAddress: "19 Willow Street",
    shipCity: "Charlotte",
    shipState: "NC",
    shipZip: "28202",
    shipCountry: "United States",
    transactionId: "5173826419",
    variations: "Size:4*6 Inches, Baby Blue Theme",
    status: "completed",
  },
  {
    id: "ORD-017",
    orderDate: "08/06/26",
    itemName: "Personalized Graduation Party Bags",
    buyer: "Robert Harris",
    quantity: 80,
    price: 2.35,
    total: 188.00,
    shipName: "Robert Harris",
    shipAddress: "501 College Avenue",
    shipCity: "Nashville",
    shipState: "TN",
    shipZip: "37203",
    shipCountry: "United States",
    transactionId: "5172948175",
    variations: "Size:6*8 Inches, Graduation 2026",
    status: "completed",
  },

  // =========================
  // DISPATCHED
  // =========================
  {
    id: "ORD-018",
    orderDate: "08/05/26",
    itemName: "Custom Christmas Gift Treat Bags",
    buyer: "Sarah Martin",
    quantity: 50,
    price: 2.40,
    total: 120.00,
    shipName: "Sarah Martin",
    shipAddress: "12 Oak Lane",
    shipCity: "Denver",
    shipState: "CO",
    shipZip: "80202",
    shipCountry: "United States",
    transactionId: "5171029483",
    variations: "Size:6*8 Inches, Christmas Design",
    status: "dispatched",
  },
  {
    id: "ORD-019",
    orderDate: "08/04/26",
    itemName: "Personalized Halloween Party Bags",
    buyer: "Jessica Moore",
    quantity: 40,
    price: 2.55,
    total: 102.00,
    shipName: "Jessica Moore",
    shipAddress: "88 Maple Avenue",
    shipCity: "Portland",
    shipState: "OR",
    shipZip: "97205",
    shipCountry: "United States",
    transactionId: "5170216348",
    variations: "Size:4*6 Inches, Halloween Mix",
    status: "dispatched",
  },
];
const SEED_WORKORDERS: WorkOrder[] = [
  { id: "WO-001", orderId: "ORD-003", categoryId: "c1", approver1Id: "e3", approver2Id: "e1", generatedDate: "08/17/26", currentStep: 3, stepStatuses: ["completed", "completed", "completed", "in_progress"] },
  { id: "WO-002", orderId: "ORD-004", categoryId: "c1", approver1Id: "e3", approver2Id: "e2", generatedDate: "08/14/26", currentStep: 1, stepStatuses: ["completed", "in_progress", "pending", "pending"] },
  { id: "WO-003", orderId: "ORD-005", categoryId: "c2", approver1Id: "e3", approver2Id: "e1", generatedDate: "08/13/26", currentStep: 2, stepStatuses: ["completed", "completed", "completed"] },
  { id: "WO-004", orderId: "ORD-006", categoryId: "c1", approver1Id: "e3", approver2Id: "e2", generatedDate: "08/12/26", currentStep: 3, stepStatuses: ["completed", "completed", "completed", "completed"] },
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(SEED_EMPLOYEES);
  const [categories, setCategories] = useState<Category[]>(SEED_CATEGORIES);
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(SEED_WORKORDERS);
  const [batches, setBatches] = useState<Batch[]>([]);

  return (
    <StoreContext.Provider value={{ employees, setEmployees, categories, setCategories, orders, setOrders, workOrders, setWorkOrders, batches, setBatches }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
}
