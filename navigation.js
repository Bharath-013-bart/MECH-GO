// MECH-GO Navigation & Routing System
// Handles session checks, redirects, and page navigation

const PAGES = {
  LANDING: 'index.html',
  CUSTOMER_DASHBOARD: 'customer.html',
  DRIVER_DASHBOARD: 'driver.html',
  MECHANIC_DASHBOARD: 'mechanic.html',
  ADMIN_DASHBOARD: 'admin.html',
  DRIVER_VERIFY: 'driver-verify.html',
  MECHANIC_VERIFY: 'mechanic-verify.html',
};

// Get current page
function getCurrentPage() {
  return window.location.pathname.split('/').pop() || 'index.html';
}

// Check if user has an active session
function hasActiveSession(role) {
  const key = role === "customer" ? "mechgo_customer_session" :
              role === "driver" ? "mechgo_driver_session" :
              role === "mechanic" ? "mechgo_mechanic_session" :
              role === "admin" ? "mechgo_admin_session" : null;
  
  if (!key) return false;
  try {
    const session = localStorage.getItem(key);
    return !!session;
  } catch {
    return false;
  }
}

// Get current session
function getCurrentSession() {
  const customerSess = localStorage.getItem("mechgo_customer_session");
  const driverSess = localStorage.getItem("mechgo_driver_session");
  const mechanicSess = localStorage.getItem("mechgo_mechanic_session");
  const adminSess = localStorage.getItem("mechgo_admin_session");
  
  if (customerSess) return { role: "customer", data: JSON.parse(customerSess) };
  if (driverSess) return { role: "driver", data: JSON.parse(driverSess) };
  if (mechanicSess) return { role: "mechanic", data: JSON.parse(mechanicSess) };
  if (adminSess) return { role: "admin", data: JSON.parse(adminSess) };
  return null;
}

// Protect dashboard pages
function protectPage(requiredRole = null) {
  const currentPage = getCurrentPage();
  const dashboardPages = {
    "customer.html": "customer",
    "driver.html": "driver",
    "mechanic.html": "mechanic",
    "admin.html": "admin",
  };
  
  // Check if this is a protected page
  if (dashboardPages[currentPage]) {
    const session = getCurrentSession();
    const expectedRole = dashboardPages[currentPage];
    
    // Redirect to landing if no session or wrong role
    if (!session || (requiredRole && session.role !== requiredRole && session.role !== expectedRole)) {
      window.location.href = PAGES.LANDING;
      return false;
    }
    return true;
  }
  
  return true;
}

// Navigate to page
function navigateTo(page, queryParams = {}) {
  console.log("[nav] navigateTo called with:", { page, typeOfPage: typeof page, queryParams });
  let url = page;
  const params = new URLSearchParams(queryParams);
  if (Object.keys(queryParams).length > 0) {
    url += "?" + params.toString();
  }
  console.log("[nav] Final URL:", url);
  window.location.href = url;
}

// Navigate to appropriate dashboard based on role
function navigateToDashboard() {
  const session = getCurrentSession();
  if (!session) {
    navigateTo(PAGES.LANDING);
    return;
  }
  
  const dashboards = {
    "customer": PAGES.CUSTOMER_DASHBOARD,
    "driver": PAGES.DRIVER_DASHBOARD,
    "mechanic": PAGES.MECHANIC_DASHBOARD,
    "admin": PAGES.ADMIN_DASHBOARD,
  };
  
  navigateTo(dashboards[session.role] || PAGES.LANDING);
}

// Logout
function logout() {
  try {
    localStorage.removeItem("mechgo_customer_session");
    localStorage.removeItem("mechgo_driver_session");
    localStorage.removeItem("mechgo_mechanic_session");
    localStorage.removeItem("mechgo_admin_session");
  } catch (e) {
    console.error("Error clearing sessions:", e);
  }
  navigateTo(PAGES.LANDING);
}

// Setup logout buttons
function setupLogoutButtons() {
  const logoutBtns = document.querySelectorAll("#logoutBtn");
  logoutBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Are you sure you want to logout?")) {
        logout();
      }
    });
  });
}

// Setup navigation
function setupNavigation() {
  setupLogoutButtons();
  
  // Update year in footers
  const yearSpans = document.querySelectorAll("#year");
  yearSpans.forEach(span => {
    span.textContent = new Date().getFullYear();
  });
  
  // Setup "Go to Dashboard" links
  setupDashboardLinks();
}

// Setup dashboard navigation links
function setupDashboardLinks() {
  // Driver verification successful redirect
  const driverDashboardLink = document.querySelector('a[href="driver.html"]');
  if (driverDashboardLink) {
    driverDashboardLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (hasActiveSession("driver")) {
        navigateTo(PAGES.DRIVER_DASHBOARD);
      } else {
        navigateTo(PAGES.DRIVER_VERIFY);
      }
    });
  }
  
  // Mechanic verification successful redirect
  const mechanicDashboardLink = document.querySelector('a[href="mechanic.html"]');
  if (mechanicDashboardLink) {
    mechanicDashboardLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (hasActiveSession("mechanic")) {
        navigateTo(PAGES.MECHANIC_DASHBOARD);
      } else {
        navigateTo(PAGES.MECHANIC_VERIFY);
      }
    });
  }
}

// Initialize navigation on page load
document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
});
