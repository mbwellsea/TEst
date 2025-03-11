import { Switch, Route } from "wouter";
import BookingPage from "./pages/booking";
import DashboardPage from "./pages/dashboard";
import ReservationsPage from "./pages/reservations";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <Switch>
      <Route path="/" component={BookingPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/reservations" component={ReservationsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;