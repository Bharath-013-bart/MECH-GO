# 🔗 Firebase Integration Guide

This guide will help you integrate Firebase into your existing dashboard pages.

## Overview

Your app uses three layers:
1. **Firebase SDK** (CDN) - Already added to all HTML files ✅
2. **Firebase Service Wrapper** (`firebase-service.js`) - Provides clean API ✅
3. **Dashboard Logic** (driver.js, mechanic.js, etc.) - Needs updates ⏳

---

## How firebase-service.js Works

### Three Main Services:

#### 1. **SMSService** - Handle OTP
```javascript
// Send OTP
await SMSService.sendOTP(phoneNumber);

// Verify OTP
const result = await SMSService.verifyOTP(phoneNumber, otp);
```

#### 2. **AuthService** - Handle Users
```javascript
// Register new user
await AuthService.registerUser({
  phone: "+919876543210",
  role: "driver" // or "mechanic" 
});

// Find user
const user = await AuthService.findUserByPhone(phoneNumber);

// Update verification status
await AuthService.updateUserVerification(uid, { verified: true });

// Logout
await AuthService.logout();
```

#### 3. **FirestoreService** - Handle Data
```javascript
// Orders
await FirestoreService.createOrder(orderData);
await FirestoreService.getOrders(customerId);
await FirestoreService.updateOrder(orderId, { status: "completed" });

// Messages
await FirestoreService.saveMessage(jobId, messageData);
await FirestoreService.getMessages(jobId);

// Mechanic Requests
await FirestoreService.createMechanicRequest(requestData);
await FirestoreService.getAvailableJobs();
await FirestoreService.acceptJob(jobId, mechanicUid);
```

---

## Integration Steps

### Step 1: Update driver-verify.js

Find the phone verification section and replace with:

```javascript
// In driver-verify.js

// When user clicks "Send OTP"
document.getElementById('sendOtpBtn').addEventListener('click', async (e) => {
  e.preventDefault();
  const phone = document.getElementById('phoneInput').value;
  
  try {
    // Initialize reCAPTCHA
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
    
    // Send OTP
    await SMSService.sendOTP(phone);
    alert('OTP sent! Check your SMS');
    showOTPStep(); // Show OTP input
  } catch (error) {
    alert('Error: ' + error.message);
  }
});

// When user enters OTP
document.getElementById('verifyOtpBtn').addEventListener('click', async (e) => {
  e.preventDefault();
  const phone = document.getElementById('phoneInput').value;
  const otp = document.getElementById('otpInput').value;
  
  try {
    const credential = await SMSService.verifyOTP(phone, otp);
    
    // Now register user
    const userData = {
      phone: phone,
      role: 'driver',
      licenseNumber: document.getElementById('licenseNumber').value,
      vehicleType: document.getElementById('vehicleType').value,
    };
    
    await AuthService.registerUser(userData);
    
    alert('Registered! Now upload documents for approval.');
    showDocumentStep();
  } catch (error) {
    alert('Invalid OTP: ' + error.message);
  }
});

// When user uploads documents
document.getElementById('licenseUpload').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const uid = firebase.auth().currentUser.uid;
  
  try {
    await FirestoreService.uploadDocument(uid, 'license', file);
    alert('License uploaded! Waiting for admin approval.');
  } catch (error) {
    alert('Upload failed: ' + error.message);
  }
});
```

---

### Step 2: Update driver.js

Replace the dummy order loading with real Firebase:

```javascript
// In driver.js

// Load available orders (was: loadStorage())
async function loadAvailableOrders() {
  try {
    const orders = await FirestoreService.getAvailableJobs(); // Returns all un-accepted orders
    
    const ordersList = document.getElementById('availableOrdersList');
    ordersList.innerHTML = '';
    
    orders.forEach(order => {
      const card = document.createElement('div');
      card.className = 'order-card';
      card.innerHTML = `
        <div class="order-header">
          <h3>₹${order.estimatedCost} - ${order.fuelType}</h3>
          <span class="status-badge waiting">${order.quantity}L</span>
        </div>
        <p><strong>Location:</strong> ${order.location}</p>
        <p><strong>Vehicle:</strong> ${order.vehicle}</p>
        <button onclick="acceptOrder('${order.id}')">Accept Order</button>
      `;
      ordersList.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading orders:', error);
  }
}

// Accept an order (was: updateStorage())
async function acceptOrder(orderId) {
  try {
    const driverUid = firebase.auth().currentUser.uid;
    await FirestoreService.updateOrder(orderId, {
      acceptedBy: driverUid,
      status: 'accepted'
    });
    
    // Refresh list
    loadAvailableOrders();
    loadActiveOrders();
    
    alert('Order accepted!');
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// Load active orders for this driver
async function loadActiveOrders() {
  try {
    const driverUid = firebase.auth().currentUser.uid;
    const orders = await FirestoreService.getOrders(driverUid);
    
    const activeOrders = orders.filter(o => o.acceptedBy === driverUid);
    
    // Render active orders...
  } catch (error) {
    console.error('Error:', error);
  }
}

// Load on page
window.addEventListener('load', () => {
  loadAvailableOrders();
  loadActiveOrders();
  
  // Refresh every 10 seconds
  setInterval(() => {
    loadAvailableOrders();
    loadActiveOrders();
  }, 10000);
});
```

---

### Step 3: Update mechanic.js

Similar to driver.js:

```javascript
// In mechanic.js

// Load available repair requests
async function loadAvailableJobs() {
  try {
    const jobs = await FirestoreService.getAvailableJobs('mechanic');
    
    // Group by status
    const waitingJobs = jobs.filter(j => j.status === 'waiting');
    const inProgressJobs = jobs.filter(j => j.status === 'in-progress');
    
    renderWaitingJobs(waitingJobs);
    renderInProgressJobs(inProgressJobs);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Accept a mechanic job
async function acceptJob(jobId) {
  try {
    const mechanicUid = firebase.auth().currentUser.uid;
    await FirestoreService.acceptJob(jobId, mechanicUid);
    
    loadAvailableJobs();
    alert('Job accepted!');
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// Submit cost quote
async function submitQuote(jobId, partsCost, laborCost, additionalCost) {
  try {
    const totalCost = partsCost + laborCost + additionalCost;
    
    await FirestoreService.updateOrder(jobId, {
      quote: {
        partsCost,
        laborCost,
        additionalCost,
        totalCost,
        status: 'pending' // Waiting for customer approval
      }
    });
    
    alert('Quote submitted!');
  } catch (error) {
    alert('Error: ' + error.message);
  }
}
```

---

### Step 4: Update customer.js

```javascript
// In customer.js

// Place new fuel order
async function placeOrder(formData) {
  try {
    const customerId = firebase.auth().currentUser.uid;
    
    const orderData = {
      customerUid: customerId,
      vehicle: formData.vehicle,
      fuelType: formData.fuelType,
      quantity: formData.quantity,
      location: formData.location,
      notes: formData.notes,
      status: 'waiting',
      estimatedCost: formData.quantity * 100, // ₹100 per liter (example)
      createdAt: new Date()
    };
    
    const orderId = await FirestoreService.createOrder(orderData);
    
    alert('Order placed! Drivers will accept soon.');
    loadActiveOrders();
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// Load active orders
async function loadActiveOrders() {
  try {
    const customerId = firebase.auth().currentUser.uid;
    const orders = await FirestoreService.getOrders(customerId);
    
    // Show only non-completed orders
    const active = orders.filter(o => o.status !== 'completed');
    renderOrders(active);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Send message to driver
async function sendMessage(orderId, message) {
  try {
    const customerId = firebase.auth().currentUser.uid;
    
    await FirestoreService.saveMessage(orderId, {
      jobId: orderId,
      senderRole: 'customer',
      senderUid: customerId,
      text: message,
      createdAt: new Date()
    });
    
    loadMessages(orderId);
  } catch (error) {
    alert('Error sending message');
  }
}
```

---

### Step 5: Update admin.js

```javascript
// In admin.js

// Load pending verifications
async function loadPendingVerifications() {
  try {
    const pending = await FirestoreService.getPendingVerifications();
    
    const driversList = document.getElementById('pendingDriversList');
    const mechanicsList = document.getElementById('pendingMechanicsList');
    
    pending.forEach(user => {
      if (user.role === 'driver') {
        // Render driver approval card
      } else if (user.role === 'mechanic') {
        // Render mechanic approval card
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

// Approve user
async function approveUser(uid, role) {
  try {
    await AuthService.updateUserVerification(uid, { 
      verified: true,
      verifiedAt: new Date()
    });
    
    loadPendingVerifications();
    alert('User approved!');
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// Reject user
async function rejectUser(uid, reason) {
  try {
    await AuthService.updateUserVerification(uid, { 
      verified: false,
      rejectionReason: reason,
      verifiedAt: new Date()
    });
    
    loadPendingVerifications();
    alert('User rejected');
  } catch (error) {
    alert('Error: ' + error.message);
  }
}
```

---

## Quick Reference: Firebase Service Methods

### SMSService
```javascript
await SMSService.sendOTP(phoneNumber)
await SMSService.verifyOTP(phoneNumber, otp)
await SMSService.setupRecaptcha('recaptcha-container')
```

### AuthService
```javascript
await AuthService.registerUser(userData)
await AuthService.findUserByPhone(phoneNumber)
await AuthService.getCurrentUser()
await AuthService.logout()
await AuthService.updateUserVerification(uid, verificationData)
```

### FirestoreService
```javascript
await FirestoreService.createOrder(orderData)
await FirestoreService.getOrders(userId)
await FirestoreService.updateOrder(orderId, updates)
await FirestoreService.createMechanicRequest(requestData)
await FirestoreService.getAvailableJobs(type)
await FirestoreService.acceptJob(jobId, userUid)
await FirestoreService.saveMessage(jobId, messageData)
await FirestoreService.getMessages(jobId)
await FirestoreService.uploadDocument(uid, docType, file)
await FirestoreService.getPendingVerifications()
```

---

## Testing Without Backend

All services work without backend server for:
- ✅ OTP verification (Firebase Phone Auth)
- ✅ Document upload (Firebase Storage)
- ✅ Order/job management (Firestore)
- ✅ Chat/messaging (Firestore)

You only need backend for:
- ☐ SMS relay via Twilio (if Firebase Phone Auth unavailable)
- ☐ Admin verification endpoints

---

## Next Steps

1. Update driver.js with FirestoreService calls
2. Update mechanic.js with FirestoreService calls
3. Update customer.js with FirestoreService calls
4. Update admin.js with admin endpoints
5. Test order flow end-to-end
6. Deploy backend when ready for production

Good luck! 🚀
