# 🔥 MECH-GO Hackathon - Firebase + SMS OTP Setup

## 🚀 Quick Start (Production Ready)

### Step 1: Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add Project"
   - Name it: `mech-go`
   - Enable Google Analytics (optional)
   - Click Create

2. **Enable Firebase Services**
   - Go to **Build** → **Authentication**
   - Click **Get Started**
   - Enable **Phone** sign-in method
   - Enable **Email/Password** sign-in method
   - Go to **Firestore Database**
   - Click **Create Database** → Select **Production Mode**
   - Click **Create**
   - Go to **Storage**
   - Click **Get Started**
   - Accept default settings

3. **Get Firebase Credentials**
   - Go to **Project Settings** (gear icon)
   - Click **Your apps** → **Web** icon
   - Copy the config object

4. **Update `config.js`**
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

---

### Step 2: Twilio Setup (SMS OTP)

1. **Create Twilio Account**
   - Go to [Twilio Console](https://www.twilio.com/console)
   - Sign up for free trial
   - Verify your phone number

2. **Get Twilio Phone Number**
   - Go to **Phone Numbers** → **Buy a Number**
   - Select your country
   - Choose a number with SMS capability
   - Purchase it

3. **Get Credentials**
   - Go to **Account Info**
   - Copy **Account SID** and **Auth Token**
   - Go to **Phone Numbers** → Copy your Twilio number

4. **Update `config.js`**
   ```javascript
   const twilioConfig = {
     accountSid: "YOUR_ACCOUNT_SID",
     authToken: "YOUR_AUTH_TOKEN",
     phoneNumber: "+1XXXXXXXXXX",
     smsEndpoint: "http://localhost:3001/api/send-otp"
   };
   ```

---

### Step 3: Backend Setup (Node.js)

1. **Create backend folder**
   ```bash
   mkdir mech-go-backend
   cd mech-go-backend
   ```

2. **Initialize Node project**
   ```bash
   npm init -y
   npm install express cors dotenv twilio firebase-admin
   ```

3. **Create `.env` file**
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
   
   FIREBASE_PROJECT_ID=mech-go
   FIREBASE_PRIVATE_KEY="your_private_key"
   FIREBASE_CLIENT_EMAIL=firebase@mech-go.iam.gserviceaccount.com
   
   PORT=3001
   ```

4. **Get Firebase Admin Key**
   - Go to **Project Settings** → **Service Accounts**
   - Click **Generate New Private Key**
   - Copy the JSON and use values in `.env`

5. **Create `server.js`**
   - Copy code from `backend-setup.js` (lines for server.js)
   - Save as `server.js` in backend folder

6. **Run backend**
   ```bash
   node server.js
   ```
   Server will run on `http://localhost:3001`

---

### Step 4: Firestore Database Schema

Set up these collections in Firestore:

**Collection: `customers`**
```
{
  uid: string,
  phone: string,
  email: string,
  verified: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Collection: `drivers`**
```
{
  uid: string,
  phone: string,
  verified: boolean,
  documents: [{ type, url, uploadedAt }],
  bankAccount: string,
  createdAt: timestamp,
  verifiedAt: timestamp (null if not verified)
}
```

**Collection: `mechanics`**
```
{
  uid: string,
  phone: string,
  verified: boolean,
  experience: number,
  specializations: [string],
  documents: [{ type, url, uploadedAt }],
  bankAccount: string,
  createdAt: timestamp,
  verifiedAt: timestamp
}
```

**Collection: `orders`**
```
{
  customerUid: string,
  acceptedBy: string (null initially),
  vehicle: string,
  location: string,
  fuelType: string,
  quantity: number,
  notes: string,
  status: string (waiting/accepted/on-the-way/arrived/completed),
  estimatedCost: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Collection: `mechanic_requests`**
```
{
  customerUid: string,
  acceptedBy: string (null initially),
  vehicleType: string,
  problemType: string,
  problemDesc: string,
  location: string,
  status: string (waiting/accepted/in-progress/completed),
  quote: {
    partsCost: number,
    laborCost: number,
    additionalCost: number,
    totalCost: number,
    status: string
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Collection: `messages`**
```
{
  jobId: string,
  senderRole: string (customer/driver/mechanic),
  senderUid: string,
  text: string,
  createdAt: timestamp
}
```

**Collection: `otp_codes`**
```
{
  code: string,
  verified: boolean,
  createdAt: timestamp,
  expiresAt: timestamp,
  verifiedAt: timestamp (null initially)
}
```

---

### Step 5: Update HTML Files

Add Firebase SDK to all HTML files (before other scripts):

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebaseapp/9.15.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebaseapp/9.15.0/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebaseapp/9.15.0/firebase-firestore.js"></script>
<script src="https://www.gstatic.com/firebaseapp/9.15.0/firebase-storage.js"></script>

<!-- Config & Services -->
<script src="config.js"></script>
<script src="firebase-service.js"></script>

<!-- reCAPTCHA for phone auth -->
<script src="https://www.gstatic.com/recaptcha/releases/latest/recaptcha.js"></script>
<div id="recaptcha-container"></div>
```

---

### Step 6: Environment Variables

Create a `.env` file in your frontend folder:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=mech-go
VITE_BACKEND_URL=http://localhost:3001
```

---

## 📱 Testing SMS OTP

1. **Use Twilio Test Credentials** (free)
   - Twilio allows SMS to verified numbers only
   - Verify your phone number in Twilio console

2. **Test Flow:**
   - Go to `driver-verify.html`
   - Enter verified phone number
   - OTP sent to your phone (real SMS!)
   - Enter OTP received
   - Continue with document upload

---

## 🔒 Security Notes

✅ **What's Secure:**
- Firebase authentication handles session management
- OTP codes expire after 10 minutes
- Documents stored in Firebase Storage with signed URLs
- Backend validates all requests
- Admin endpoints require auth token

⚠️ **Production Recommendations:**
- Use environment variables for all secrets
- Enable HTTPS only
- Add rate limiting to OTP endpoint
- Implement CSRF protection
- Add request validation on backend
- Use Firebase security rules for Firestore

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| "Firebase not configured" | Check `config.js` has correct credentials |
| SMS not sending | Verify phone number in Twilio console |
| Document upload fails | Check Firebase Storage rules allow uploads |
| Connection refused | Make sure backend is running (`node server.js`) |

---

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Twilio SMS Documentation](https://www.twilio.com/docs/sms)
- [Firebase Firestore Schema](https://firebase.google.com/docs/firestore/data-model)
- [Node.js Express Guide](https://expressjs.com/)

---

## ✅ Deployment

**Frontend (Firebase Hosting):**
```bash
npm install -g firebase-tools
firebase init hosting
firebase deploy
```

**Backend (Heroku/Railway/Render):**
```bash
git push heroku main
```

---

Good luck with your hackathon! 🚀
