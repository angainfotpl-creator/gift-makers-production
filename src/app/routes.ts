import { createBrowserRouter } from "react-router";
import Root from "./Root";
import Dashboard from "./pages/Dashboard";
import EmployeeManagement from "./pages/EmployeeManagement";
import CategoryProcess from "./pages/CategoryProcess";
import CreateOrder from "./pages/CreateOrder";
import GenerateWorkOrder from "./pages/GenerateWorkOrder";
import OrderTracking from "./pages/OrderTracking";
import Dispatch from "./pages/Dispatch";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: "employees", Component: EmployeeManagement },
      { path: "categories", Component: CategoryProcess },
      { path: "orders/create", Component: CreateOrder },
      { path: "orders/generate", Component: GenerateWorkOrder },
      { path: "tracking", Component: OrderTracking },
      { path: "dispatch", Component: Dispatch },
    ],
  },
]);
