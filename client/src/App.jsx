import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { store } from './store';
import { useSelector, useDispatch } from 'react-redux';
import { getMe } from './store/slices/authSlice';

// Layout components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import CartDrawer from './components/shop/CartDrawer';
import PageLoader from './components/common/PageLoader';
import ScrollToTop from './components/common/ScrollToTop';
import SearchModal from './components/common/SearchModal';


// Lazy-load all pages
const Home         = lazy(() => import('./pages/public/Home'));
const Shop         = lazy(() => import('./pages/public/Shop'));
const ProductPage  = lazy(() => import('./pages/public/ProductPage'));
const Collections  = lazy(() => import('./pages/public/Collections'));
const CollectionPage = lazy(() => import('./pages/public/CollectionPage'));
const About        = lazy(() => import('./pages/public/About'));
const Contact      = lazy(() => import('./pages/public/Contact'));
const TrackOrder   = lazy(() => import('./pages/public/TrackOrder'));

// Auth pages
const Login         = lazy(() => import('./pages/auth/Login'));
const Register      = lazy(() => import('./pages/auth/Register'));
const VerifyOTP     = lazy(() => import('./pages/auth/VerifyOTP'));
const ForgotPass    = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPass     = lazy(() => import('./pages/auth/ResetPassword'));

// Customer pages
const CustomerDashboard = lazy(() => import('./pages/customer/Dashboard'));
const MyOrders          = lazy(() => import('./pages/customer/MyOrders'));
const OrderDetail       = lazy(() => import('./pages/customer/OrderDetail'));
const MyProfile         = lazy(() => import('./pages/customer/Profile'));
const Wishlist          = lazy(() => import('./pages/customer/Wishlist'));
const Checkout          = lazy(() => import('./pages/customer/Checkout'));
const OrderSuccess      = lazy(() => import('./pages/customer/OrderSuccess'));
const ContactSupport    = lazy(() => import('./pages/customer/ContactSupport'));
const MyTickets         = lazy(() => import('./pages/customer/MyTickets'));

// Admin pages
const AdminOverview      = lazy(() => import('./pages/admin/Overview'));
const AdminOrders        = lazy(() => import('./pages/admin/Orders'));
const AdminProducts      = lazy(() => import('./pages/admin/Products'));
const AdminCollections   = lazy(() => import('./pages/admin/Collections'));
const AdminUsers         = lazy(() => import('./pages/admin/Users'));
const AdminStaff         = lazy(() => import('./pages/admin/Staff'));
const AdminSuppliers     = lazy(() => import('./pages/admin/Suppliers'));
const AdminCoupons       = lazy(() => import('./pages/admin/Coupons'));
const AdminReviews       = lazy(() => import('./pages/admin/Reviews'));
const AdminReports       = lazy(() => import('./pages/admin/Reports'));
const AdminSettings      = lazy(() => import('./pages/admin/Settings'));

// Finance pages
const FinanceOverview     = lazy(() => import('./pages/finance/Overview'));
const FinancePayments     = lazy(() => import('./pages/finance/Payments'));
const FinanceOrders       = lazy(() => import('./pages/finance/Orders'));
const FinanceReports      = lazy(() => import('./pages/finance/Reports'));

// Staff pages
const StaffOverview   = lazy(() => import('./pages/staff/Overview'));
const StaffOrders     = lazy(() => import('./pages/staff/Orders'));
const StaffInventory  = lazy(() => import('./pages/staff/Inventory'));
const StaffPortal     = lazy(() => import('./pages/staff/MyPortal'));

// Support pages
const SupportOverview = lazy(() => import('./pages/support/Overview'));
const SupportTickets  = lazy(() => import('./pages/support/Tickets'));
const TicketDetail    = lazy(() => import('./pages/support/TicketDetail'));
const SupportReviews  = lazy(() => import('./pages/support/Reviews'));

// Route guards
const PrivateRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useSelector(s => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector(s => s.auth);
  if (!isAuthenticated) return children;
  const roleRoutes = { admin: '/admin', finance: '/finance', staff: '/staff/portal', support: '/support' };
  return <Navigate to={roleRoutes[user?.role] || '/dashboard'} replace />;
};

function AppContent() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(s => s.auth);

  useEffect(() => {
    if (isAuthenticated) dispatch(getMe());
  }, []);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Layout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:slug" element={<ProductPage />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/collections/:slug" element={<CollectionPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/track-order" element={<TrackOrder />} />
              <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
              <Route path="/order-success" element={<PrivateRoute><OrderSuccess /></PrivateRoute>} />
              <Route path="/contact-support" element={<ContactSupport />} />
            </Route>

            {/* Auth Pages */}
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPass /></PublicOnlyRoute>} />
            <Route path="/reset-password/:token" element={<ResetPass />} />

            {/* Customer Dashboard */}
            <Route path="/dashboard" element={<PrivateRoute><CustomerDashboard /></PrivateRoute>} />
            <Route path="/orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
            <Route path="/orders/:id" element={<PrivateRoute><OrderDetail /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><MyProfile /></PrivateRoute>} />
            <Route path="/wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />
            <Route path="/my-tickets" element={<PrivateRoute><MyTickets /></PrivateRoute>} />
            <Route path="/my-tickets/:id" element={<PrivateRoute><TicketDetail /></PrivateRoute>} />

            {/* Admin Dashboard */}
            <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminOverview /></PrivateRoute>} />
            <Route path="/admin/orders" element={<PrivateRoute roles={['admin']}><AdminOrders /></PrivateRoute>} />
            <Route path="/admin/products" element={<PrivateRoute roles={['admin']}><AdminProducts /></PrivateRoute>} />
            <Route path="/admin/collections" element={<PrivateRoute roles={['admin']}><AdminCollections /></PrivateRoute>} />
            <Route path="/admin/users" element={<PrivateRoute roles={['admin']}><AdminUsers /></PrivateRoute>} />
            <Route path="/admin/staff" element={<PrivateRoute roles={['admin']}><AdminStaff /></PrivateRoute>} />
            <Route path="/admin/suppliers" element={<PrivateRoute roles={['admin']}><AdminSuppliers /></PrivateRoute>} />
            <Route path="/admin/coupons" element={<PrivateRoute roles={['admin']}><AdminCoupons /></PrivateRoute>} />
            <Route path="/admin/reviews" element={<PrivateRoute roles={['admin']}><AdminReviews /></PrivateRoute>} />
            <Route path="/admin/reports" element={<PrivateRoute roles={['admin']}><AdminReports /></PrivateRoute>} />
            <Route path="/admin/settings" element={<PrivateRoute roles={['admin']}><AdminSettings /></PrivateRoute>} />

            {/* Finance Dashboard */}
            <Route path="/finance" element={<PrivateRoute roles={['finance','admin']}><FinanceOverview /></PrivateRoute>} />
            <Route path="/finance/payments" element={<PrivateRoute roles={['finance','admin']}><FinancePayments /></PrivateRoute>} />
            <Route path="/finance/orders" element={<PrivateRoute roles={['finance','admin']}><FinanceOrders /></PrivateRoute>} />
            <Route path="/finance/reports" element={<PrivateRoute roles={['finance','admin']}><FinanceReports /></PrivateRoute>} />

            {/* Staff Dashboard */}
            <Route path="/staff" element={<PrivateRoute roles={['staff','admin']}><StaffOverview /></PrivateRoute>} />
            <Route path="/staff/portal" element={<PrivateRoute roles={['staff','admin']}><StaffPortal /></PrivateRoute>} />
            <Route path="/staff/orders" element={<PrivateRoute roles={['staff','admin']}><StaffOrders /></PrivateRoute>} />
            <Route path="/staff/inventory" element={<PrivateRoute roles={['staff','admin']}><StaffInventory /></PrivateRoute>} />

            {/* Support Dashboard */}
            <Route path="/support" element={<PrivateRoute roles={['support','admin']}><SupportOverview /></PrivateRoute>} />
            <Route path="/support/tickets" element={<PrivateRoute roles={['support','admin']}><SupportTickets /></PrivateRoute>} />
            <Route path="/support/tickets/:id" element={<PrivateRoute roles={['support','admin']}><TicketDetail /></PrivateRoute>} />
            <Route path="/support/reviews" element={<PrivateRoute roles={['support','admin']}><SupportReviews /></PrivateRoute>} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </BrowserRouter>
  );
}

// Public Layout wrapper
function PublicLayout() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <SearchModal />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <HelmetProvider>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
              padding: '12px 16px',
              borderRadius: '12px',
            },
            success: {
              iconTheme: { primary: '#FF2D7A', secondary: '#fff' },
              style: { background: '#FFF0F5', color: '#3D001F', border: '1px solid #FFD6E7' }
            },
            error: {
              style: { background: '#FEE2E2', color: '#991B1B' }
            }
          }}
        />
      </HelmetProvider>
    </Provider>
  );
}

export default App;
