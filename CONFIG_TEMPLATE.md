# Firebase Configuration Template

## 🔧 This file contains ALL credentials needed for MECH-GO

### Step 1: Get Firebase Config
```
Go to: console.firebase.google.com
→ Click on your project
→ Go to: ⚙️ Settings → Your apps → Web app
→ Copy the config object below
```

### Step 2: Get Twilio Config
```
Go to: console.twilio.com
→ Account Info (left sidebar)
→ Copy: Account SID, Auth Token
→ Go to: Phone Numbers → Active Numbers
→ Copy: Your Twilio phone number
```

### Step 3: Paste Values Below

```javascript
// ============================================
// FIREBASE CONFIGURATION
// ============================================
const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",           // ← from Firebase
  authDomain: "mech-go-xxxxx.firebaseapp.com",              // ← Your Project
  projectId: "mech-go-xxxxx",                                // ← Your Project
  storageBucket: "mech-go-xxxxx.appspot.com",               // ← Your Project
  messagingSenderId: "123456789012",                         // ← from Firebase
  appId: "1:123456789012:web:abcdef1234567890"              // ← from Firebase
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// ============================================
// TWILIO CONFIGURATION (SMS OTP)
// ============================================
const twilioConfig = {
  // From: https://console.twilio.com
  accountSid: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",          // ← Your Account SID
  authToken: "your_actual_auth_token_here",                 // ← Your Auth Token
  phoneNumber: "+1234567890",                               // ← Your Twilio Phone Number
  
  // For frontend (when using backend relay)
  smsEndpoint: "http://localhost:3001/api/send-otp",       // Local backend
  // OR production
  smsEndpoint: "https://mech-go-backend.herokuapp.com/api/send-otp" // Heroku
};

// ============================================
// OPTIONAL: ADMIN PIN FOR DEMO
// ============================================
// Set this temporarily for testing admin panel
// Remove before production!
const ADMIN_PIN = "0000"; // Change this!

// ============================================
// OPTIONAL: FEATURE FLAGS
// ============================================
const featureFlags = {
  enableRealSMS: true,           // Set to false to disable SMS (demo mode)
  enableDocumentUpload: true,    // Firebase Cloud Storage
  enableRealTimeChat: true,      // Firestore listeners
  enablePayments: false,         // Not yet implemented
  demoMode: false               // Set to true to use hardcoded dummy data
};

// ============================================
// OPTIONAL: PRICING CONFIGURATION
// ============================================
const pricing = {
  fuelCostPerLiter: 100,         // ₹ per liter
  driverCommissionPercent: 15,   // 15% commission to MECH-GO
  mechanicCommissionPercent: 20, // 20% commission to MECH-GO
  
  // Mechanic service type pricing (to show customer estimates)
  estimatedMechanicCosts: {
    'basic-repairs': { minCost: 500, maxCost: 1500 },
    'engine-work': { minCost: 2000, maxCost: 5000 },
    'transmission': { minCost: 3000, maxCost: 8000 },
    'electrical': { minCost: 500, maxCost: 2000 },
    'other': { minCost: 500, maxCost: 3000 }
  }
};

// ============================================
// OPTIONAL: MAP CONFIGURATION (For Future)
// ============================================
const mapConfig = {
  googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY",
  defaultZoom: 15,
  mapCenter: { lat: 28.6139, lng: 77.2090 } // Delhi, India (example)
};

// ============================================
// OPTIONAL: EMAIL CONFIGURATION (For Future)
// ============================================
// Used when backend sends confirmation emails
const emailConfig = {
  smtpHost: "smtp.gmail.com",
  smtpPort: 587,
  senderEmail: "mech-go@example.com",
  senderPassword: "app_password_here"
};

// ============================================
// OPTIONAL: RAZORPAY CONFIGURATION (For Future)
// ============================================
const razorpayConfig = {
  keyId: "rzp_live_xxxxxxxxx",
  keySecret: "key_secret_here", // Never expose in frontend!
  webhookSecret: "whsec_xxxxx"
};

// ============================================
// VERIFICATION REQUIREMENTS
// ============================================
// What documents drivers/mechanics must upload
const verificationRequirements = {
  driver: [
    { type: 'license', label: 'Driving License', required: true },
    { type: 'aadhaar', label: 'Aadhaar Card', required: false },
    { type: 'registration', label: 'Vehicle Registration', required: true }
  ],
  mechanic: [
    { type: 'license', label: 'Mechanic License', required: true },
    { type: 'certificate', label: 'Certification/Training', required: true },
    { type: 'aadhaar', label: 'Aadhaar Card', required: false }
  ]
};

// ============================================
// EXPORT FOR USE IN OTHER FILES
// ============================================
// This allows other JS files to access config:
// Usage: firebaseConfig, twilioConfig, pricing, etc.

console.log('✅ Config loaded successfully!');
console.log('Firebase Project:', firebaseConfig.projectId);
console.log('Twilio Account:', twilioConfig.accountSid?.substring(0, 5) + '...');
```

---

## 📋 Checklist - What to Fill In

Starting point | Paste your credentials here
---|---
🔥 Firebase API Key | `AIzaSyDxxxxxx...`
🔥 Firebase Auth Domain | `mech-go-xxxxx.firebaseapp.com`
🔥 Firebase Project ID | `mech-go-xxxxx`
🔥 Firebase Storage Bucket | `mech-go-xxxxx.appspot.com`
🔥 Firebase Messaging Sender ID | `123456789012`
🔥 Firebase App ID | `1:123456789012:web:abc...`
📱 Twilio Account SID | `ACxxxxxx...`
📱 Twilio Auth Token | `your_token_here`
📱 Twilio Phone Number | `+1234567890`

---

## 🔍 Where to Get Each Value

### Firebase Values
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your "mech-go" project
3. Click ⚙️ **Settings** (bottom left)
4. Click **Project Settings**
5. Scroll to "Your apps"
6. Find your Web app
7. Under "SDK setup and configuration" → Copy the entire `firebaseConfig` object

### Twilio Values
1. Go to [Twilio Console](https://console.twilio.com/)
2. Under **Account Info**:
   - Copy **Account SID** and **Auth Token**
3. Under **Manage Numbers** → **Active Numbers**:
   - Click on your number
   - Copy the phone number (e.g., +1234567890)

---

## 🚀 How to Use This File

### In Your Frontend
```html
<!-- In HTML file before other scripts -->
<script src="config.js"></script>
<script src="firebase-service.js"></script>
```

### In Your Backend (.env)
```bash
# Create a .env file with:
FIREBASE_PROJECT_ID=mech-go-xxxxx
FIREBASE_PRIVATE_KEY="-----BEGIN..."  # From Service Account
FIREBASE_CLIENT_EMAIL=...@iam.gserviceaccount.com

TWILIO_ACCOUNT_SID=ACxxxxxx...
TWILIO_AUTH_TOKEN=your_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

---

## ⚠️ Security Notes

### DO ✅
- Use environment variables in backend for Twilio
- Keep `.env` file in `.gitignore`
- Rotate Twilio auth token periodically
- Use Firebase Security Rules

### DON'T ❌
- Commit `config.js` with real credentials to git
- Expose Twilio authToken in frontend code
- Use admin-only credentials in frontend
- Hardcode verification pins

---

## 🧪 Testing Without Real Credentials

### For Demo Mode
```javascript
// In config.js, set:
const featureFlags = {
  demoMode: true,  // Uses dummy data
  enableRealSMS: false  // Skips SMS, auto-verifies
};
```

### For Development
```javascript
// Use Firebase emulator
// See: https://firebase.google.com/docs/emulator-suite
```

---

## 🔄 What Happens When You Fill This In

1. **Frontend loads** → Reads firebaseConfig → Connects to Firebase
2. **User verifies phone** → Reads twilioConfig → Sends real OTP
3. **User uploads document** → Uses Firebase Storage → Files secured
4. **Admin approves user** → Firestore updates → Driver activated
5. **Customer places order** → Creates Firestore document → Driver notified

---

## ✅ Validation

After filling in your credentials, you'll know they're correct when:
- ✅ Frontend console shows no "Firebase is not defined" errors
- ✅ You can sign up with a phone number
- ✅ You receive real SMS OTP on your phone
- ✅ Firestore shows new user documents

---

Good luck! 🚀
