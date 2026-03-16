# 📋 MECH-GO Deployment Checklist

Print this out and check off each step as you complete it!

---

## 🔥 Phase 1: Firebase Setup (10 minutes)

- [ ] Go to [console.firebase.google.com](https://console.firebase.google.com/)
- [ ] Click "Add Project"
- [ ] Name it: `mech-go`
- [ ] Enable Google Analytics (optional)
- [ ] Wait for project creation
- [ ] Go to **Build** → **Authentication**
- [ ] Click "Get Started"
- [ ] Enable **Phone** provider
  - [ ] Add test phone number: Your phone number
- [ ] Enable **Email/Password** provider (optional)
- [ ] Go to **Build** → **Firestore Database**
- [ ] Click "Create Database"
- [ ] Select **Production Mode**
- [ ] Choose default location
- [ ] Click "Create"
- [ ] Go to **Build** → **Storage**
- [ ] Click "Get Started"
- [ ] Accept default bucket settings
- [ ] Click "Create"
- [ ] Go to ⚙️ **Project Settings**
- [ ] Click **Your apps** tab
- [ ] If no web app, click **Add app** → Web icon
- [ ] Copy the entire `firebaseConfig` object
  ```javascript
  const firebaseConfig = {
    apiKey: "...",
    authDomain: "...",
    ...
  };
  ```
- [ ] Open `z:\MECH-GO\config.js` (not the config.js in project root, but the one we created)
- [ ] Paste your Firebase config
- [ ] **Save file**

✅ **Firebase Setup Complete!**

---

## 📱 Phase 2: Twilio Setup (10 minutes)

### Part A: Create Account
- [ ] Go to [twilio.com](https://twilio.com)
- [ ] Click "Sign up" or "Sign in"
- [ ] Create account / Log in
- [ ] Verify your email
- [ ] Add mobile phone and verify via SMS
- [ ] Verify email again if needed

### Part B: Get Credentials
- [ ] Go to [console.twilio.com](https://console.twilio.com/)
- [ ] In left sidebar, find **Account Info**
- [ ] Copy **Account SID** (starts with `AC`)
  ```
  ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  ```
- [ ] Copy **Auth Token** (long string)
  ```
  your_auth_token_here
  ```
- [ ] Write these down safely

### Part C: Get Phone Number
- [ ] Go to **Phone Numbers** in left sidebar
- [ ] Click **Buy a Number**
- [ ] Select country: India (or your country)
- [ ] Check **SMS** is enabled
- [ ] Choose a number
- [ ] Click "Buy"
- [ ] Confirm purchase
- [ ] Copy the phone number (e.g., +1234567890)

### Part D: Update Config
- [ ] Open `config.js`
- [ ] Find `const twilioConfig = {`
- [ ] Update:
  ```javascript
  twilioConfig.accountSid = "ACxxxxxx...";
  twilioConfig.authToken = "your_token...";
  twilioConfig.phoneNumber = "+1234567890";
  ```
- [ ] **Save file**

✅ **Twilio Setup Complete!**

---

## 🚀 Phase 3: Backend Deployment (15 minutes)

> **Note**: This is OPTIONAL for hackathon. You can skip to Phase 4 to test without backend.

### Option A: Deploy to Heroku (Recommended for Hackathon)

#### Part 1: Create Heroku Account
- [ ] Go to [heroku.com](https://heroku.com)
- [ ] Sign up for free account
- [ ] Verify email
- [ ] Create password
- [ ] Log in

#### Part 2: Install Heroku CLI
- [ ] Download [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
- [ ] Run installer
- [ ] Verify installation: Open terminal, type `heroku --version`
- [ ] Should show version number

#### Part 3: Create Backend Folder
```bash
# Open terminal / PowerShell in z:\MECH-GO
cd z:\MECH-GO

# Create backend folder
mkdir mech-go-backend
cd mech-go-backend

# Initialize Node project
npm init -y

# Install dependencies
npm install express cors dotenv twilio firebase-admin
```

- [ ] `mech-go-backend` folder created
- [ ] `package.json` file created
- [ ] `node_modules` folder created
- [ ] All packages installed successfully

#### Part 4: Create Server File
- [ ] Open `z:\MECH-GO\backend-setup.js` in VS Code
- [ ] Copy ALL contents (Ctrl+A → Ctrl+C)
- [ ] Create new file: `z:\MECH-GO\mech-go-backend\server.js`
- [ ] Paste contents (Ctrl+V)
- [ ] **Save file**

#### Part 5: Create .env File
- [ ] Create new file: `z:\MECH-GO\mech-go-backend\.env`
- [ ] Add these lines:
  ```
  PORT=3001
  
  # Twilio
  TWILIO_ACCOUNT_SID=ACxxxxxx...
  TWILIO_AUTH_TOKEN=your_token_here
  TWILIO_PHONE_NUMBER=+1234567890
  
  # Firebase (Get from next step)
  FIREBASE_PROJECT_ID=mech-go-xxxxx
  FIREBASE_PRIVATE_KEY="-----BEGIN..."
  FIREBASE_CLIENT_EMAIL=firebase@iam.gserviceaccount.com
  ```
- [ ] **Save file** (DO NOT commit to git!)

#### Part 6: Get Firebase Admin Key
- [ ] Go to Firebase Console → ⚙️ **Settings**
- [ ] Click **Service Accounts** tab
- [ ] Click **Generate New Private Key**
- [ ] You'll download a JSON file
- [ ] Open the JSON file in text editor
- [ ] Copy these values to `.env`:
  ```
  FIREBASE_PROJECT_ID=the_project_id_value
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
  FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@xxxxx.iam.gserviceaccount.com
  ```
- [ ] **Save .env file**

#### Part 7: Deploy to Heroku
```bash
# In terminal, inside mech-go-backend folder
heroku login

# Create app on Heroku
heroku create mech-go-backend

# Set environment variables
heroku config:set TWILIO_ACCOUNT_SID=ACxxxxxx...
heroku config:set TWILIO_AUTH_TOKEN=token_here
heroku config:set TWILIO_PHONE_NUMBER=+1234567890
heroku config:set FIREBASE_PROJECT_ID=mech-go-xxxxx
heroku config:set FIREBASE_PRIVATE_KEY="-----BEGIN..."
heroku config:set FIREBASE_CLIENT_EMAIL=firebase@iam.gserviceaccount.com

# Add Procfile
echo "web: node server.js" > Procfile

# Deploy
git init
git add .
git commit -m "initial"
git push heroku main
```

- [ ] Heroku app created
- [ ] Environment variables set
- [ ] Code deployed successfully
- [ ] You get a URL like: `https://mech-go-backend.herokuapp.com`

#### Part 8: Update Frontend Config
- [ ] Copy your Heroku URL
- [ ] Open `config.js`
- [ ] Find `twilioConfig.smsEndpoint`
- [ ] Update:
  ```javascript
  twilioConfig.smsEndpoint = "https://mech-go-backend.herokuapp.com/api/send-otp";
  ```
- [ ] **Save file**

#### Test Backend
```bash
# In terminal
curl https://mech-go-backend.herokuapp.com/api/health

# Should return: {"status":"ok"}
```

- [ ] Backend is running successfully

✅ **Backend Deployment Complete!**

---

### Option B: Local Backend (For Testing)

If you want to test locally before deploying:

```bash
cd z:\MECH-GO\mech-go-backend
node server.js

# Should show:
# ✅ Server running on http://localhost:3001
```

- [ ] Backend running locally
- [ ] Update config.js: `smsEndpoint: "http://localhost:3001/api/send-otp"`

---

## 🗄️ Phase 4: Firestore Collections Setup (5 minutes)

These are optional - they'll be created automatically when users register. But you can pre-create them:

- [ ] Go to Firebase Console → **Firestore Database**
- [ ] Click **Create Collection**
- [ ] Create collection: `drivers`
  - [ ] First document ID: `_template`
  - [ ] Fields:
    ```
    uid: string (example: "driver_123")
    phone: string
    verified: boolean (false)
    createdAt: timestamp (auto)
    verifiedAt: timestamp (null)
    ```
  - [ ] **Save**

- [ ] Create collection: `mechanics`
  - [ ] First document ID: `_template`
  - [ ] Similar fields as drivers

- [ ] Create collection: `orders`
  - [ ] First document ID: `_template`
  - [ ] Fields: see PROJECT_STATUS.md

- [ ] Create collection: `mechanic_requests`
  - [ ] First document ID: `_template`

- [ ] Create collection: `messages`
  - [ ] For chat messages

- [ ] Create collection: `otp_codes`
  - [ ] For OTP tracking

✅ **Firestore Collections Ready!**

---

## 🧪 Phase 5: Testing (15 minutes)

### Test 1: Frontend Loading
- [ ] Open `z:\MECH-GO\index.html` in browser
- [ ] Should see landing page
- [ ] See 4 buttons: Customer, Driver, Mechanic, Admin
- [ ] No console errors

### Test 2: Customer Flow
- [ ] Click "Book Fuel Delivery"
- [ ] Enter:
  - [ ] Location: `123 Main St, Delhi`
  - [ ] Fuel Type: `Petrol`
  - [ ] Quantity: `20` liters
- [ ] Click "Book Now"
- [ ] Should see "Order placed!"
- [ ] Order appears in "Active Orders"

### Test 3: Driver Verification
- [ ] Go to `driver-verify.html`
- [ ] Enter phone number: Your Twilio-verified number
- [ ] Click "Send OTP"
- [ ] Should receive **real SMS** with OTP code
- [ ] Enter OTP code
- [ ] Click "Verify"
- [ ] Should move to document upload step
- [ ] Upload test images (or use dummy files)
- [ ] Should see "⏳ Pending Verification"

### Test 4: Admin Approval
- [ ] Go to `admin.html`
- [ ] Should see pending driver application
- [ ] Click "Approve"
- [ ] Driver should now show verified

### Test 5: Driver Dashboard
- [ ] Go to `driver.html` (for the same driver who verified)
- [ ] Should see verification badge removed (if approved)
- [ ] Should see "Available Orders" from customer
- [ ] Click "Accept Order"
- [ ] Order moves to "Active Deliveries"
- [ ] Update status to "On the way"

✅ **All Tests Complete!**

---

## 📝 Sign-Off

**Setup completed by**: _________________________ (your name)  
**Date**: _____________  
**Time taken**: ________  

### What's Working
- [ ] Firebase Authentication
- [ ] SMS OTP via Twilio
- [ ] Customer order placement
- [ ] Driver verification
- [ ] Admin approval
- [ ] Order status updates

### What's Next (Optional)
- [ ] Payment integration (Razorpay)
- [ ] Real-time chat with Firestore listeners
- [ ] Push notifications
- [ ] Map integration
- [ ] Rating system
- [ ] Analytics

---

## 🎉 Deployment Complete!

Your MECH-GO hackathon app is now:
- ✅ **Live in browser** (frontend)
- ✅ **Connected to Firebase** (database)
- ✅ **Sending real SMS** (Twilio)
- ✅ **Backend running** (Heroku/local)

**Ready for hackathon submission!** 🏆

---

## 🚨 Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| Firebase not defined | Check Firebase CDN in HTML (reload page) |
| SMS not received | Verify phone number in Twilio console |
| Can't upload documents | Check Firebase Storage permissions |
| Backend connection error | Make sure Heroku/local server is running |
| reCAPTCHA container error | Make sure `<div id="recaptcha-container"></div>` is in HTML |
| Firestore permission denied | Check Security Rules allow authenticated users |

---

## 📞 Need Help?

1. Check relevant guide file:
   - Firebase issues → [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
   - Setup issues → [QUICKSTART.md](./QUICKSTART.md)
   - Code issues → [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)

2. Search in documentation (Ctrl+F your error)

3. Check console for errors (F12 → Console tab)

4. Read troubleshooting in relevant guide

---

**Good luck with your hackathon! 🚀**
