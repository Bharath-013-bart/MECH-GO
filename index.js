// MECH-GO Landing Page Logic
const quickRequestForm = qs("quickRequestForm");
const primaryBookNow = qs("primaryBookNow");
const secondaryFleetBtn = qs("secondaryFleetBtn");
const loginDriverBtn = qs("loginDriverBtn");
const loginMechanicBtn = qs("loginMechanicBtn");
const loginCustomerBtn = qs("loginCustomerBtn");
const loginAdminBtn = qs("loginAdminBtn");

// Quick request form
quickRequestForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = qs("qrName").value.trim();
  const loc = qs("qrLocation").value.trim();
  const fuel = qs("qrFuelType").value;
  const qty = Number(qs("qrQuantity").value);

  if (!name || !loc || !qty) return;

  // Save quick request to orders
  const orders = loadOrders();
  const newOrder = {
    id: Date.now(),
    type: "fuel",
    createdAt: new Date(),
    customerName: name,
    customerPhone: "Not provided",
    vehicle: "From quick request",
    location: loc,
    fuelType: fuel,
    quantity: qty,
    notes: "",
    status: "waiting",
    acceptedBy: null,
    estimatedCost: qty * 100 + 50,
  };

  orders.push(newOrder);
  saveOrders(orders);

  // Create a customer session
  const sessionData = { username: name, role: "customer", loginTime: new Date().toISOString() };
  saveSession("customer", sessionData);

  // Redirect to customer page
  setTimeout(() => {
    navigateTo("customer.html");
  }, 300);
});

secondaryFleetBtn?.addEventListener("click", () => {
  alert("For fleet inquiries, contact: fleet@mech-go.com");
});

loginDriverBtn?.addEventListener("click", () => {
  navigateTo("driver-verify.html");
});

loginMechanicBtn?.addEventListener("click", () => {
  navigateTo("mechanic-verify.html");
});

loginCustomerBtn?.addEventListener("click", () => {
  navigateTo("customer.html");
});

loginAdminBtn?.addEventListener("click", () => {
  // For demo, set admin session
  const sessionData = { username: "admin", role: "admin", loginTime: new Date().toISOString() };
  saveSession("admin", sessionData);
  navigateTo("admin.html");
});

primaryBookNow?.addEventListener("click", () => {
  qs("qrName").focus();
});

// Contact form demo
const contactForm = qs("contactForm");
contactForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  contactForm.reset();
  alert("Thank you! Our MECH-GO team will get back to you shortly.");
});

// Mechanic form from landing page
const mechanicForm = qs("mechanicForm");
mechanicForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = qs("mName").value.trim();
  const phone = qs("mPhone").value.trim();
  const vehicle = qs("mVehicle").value.trim();
  const problem = qs("mProblem").value || "Other";
  const location = qs("mLocation").value.trim();
  const description = qs("mDescription").value.trim();

  if (!name || !phone || !vehicle || !location) return;

  // Create a mechanic request
  const requests = loadMechanicRequests();
  const newReq = {
    id: Date.now(),
    customerName: name,
    customerPhone: phone,
    vehicleType: vehicle.split(" - ")[0] || "Vehicle",
    problemType: problem,
    problemDesc: description || "Not specified",
    location: location,
    createdAt: new Date(),
    status: "waiting",
    acceptedBy: null,
  };

  requests.push(newReq);
  saveMechanicRequests(requests);

  mechanicForm.reset();
  alert("✅ Your mechanic request has been received. The MECH-GO team will contact you soon.");
});
