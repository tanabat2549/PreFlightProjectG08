import { Route } from 'react-router-dom';
import AdminGuard from './AdminGuard';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import AuditLogs from './pages/AuditLogs';
import Temples from './pages/Temples';
import Fortunes from './pages/Fortunes';
import Reviews from './pages/Reviews';
import Calendars from './pages/Calendars';

// วางเป็นลูกของ <Routes> ใน App.tsx:  {adminRoute}
export const adminRoute = (
  <Route path="/admin" element={<AdminGuard />}>
    <Route index element={<Dashboard />} />
    <Route path="users" element={<Users />} />
    <Route path="temples" element={<Temples />} />
    <Route path="fortunes" element={<Fortunes />} />
    <Route path="reviews" element={<Reviews />} />
    <Route path="calendars" element={<Calendars />} />
    <Route path="audit-logs" element={<AuditLogs />} />
  </Route>
);
