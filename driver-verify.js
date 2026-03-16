// Driver Verification Flow - Using Firebase Auth + Firestore
let currentPhone = null;
let confirmationResult = null;
let currentUser = null;

// Wait for Firebase to be available
function waitForFirebase() {
  return new Promise((resolve) => {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      resolve();
    } else {
      const checkInterval = setInterval(() => {
        if (typeof firebase !== 'undefined' && firebase.auth) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      setTimeout(() => clearInterval(checkInterval), 5000); // Timeout after 5s
    }
  });
}

const phoneForm = qs("phoneForm");
const phoneInput = qs("phoneInput");
const phoneVerificationStep = qs("phoneVerificationStep");

const otpForm = qs("otpForm");
const otpInput = qs("otpInput");
const otpVerificationStep = qs("otpVerificationStep");
const otpPhone = qs("otpPhone");
const resendOtpBtn = qs("resendOtpBtn");

const documentForm = qs("documentForm");
const documentUploadStep = qs("documentUploadStep");
const licenseFile = qs("licenseFile");
const registrationFile = qs("registrationFile");
const selfieFile = qs("selfieFile");
const bankAccount = qs("bankAccount");
const agreeCheckbox = qs("agreeCheckbox");

const licenseStatus = qs("licenseStatus");
const registrationStatus = qs("registrationStatus");
const selfieStatus = qs("selfieStatus");

const pendingApprovalStep = qs("pendingApprovalStep");
const alreadyVerifiedStep = qs("alreadyVerifiedStep");

// Check if user already exists in Firestore
async function checkExistingUser() {
  try {
    const user = firebase.auth().currentUser;
    if (user) {
      const driverDoc = await firebase.firestore().collection("drivers").doc(user.uid).get();
      if (driverDoc.exists) {
        currentUser = driverDoc.data();
        if (currentUser.verified) {
          showStep("alreadyVerified");
        } else {
          showStep("pendingApproval");
        }
      }
    }
  } catch (error) {
    console.error("Error checking existing user:", error);
  }
}

function showStep(step) {
  [phoneVerificationStep, otpVerificationStep, documentUploadStep, pendingApprovalStep, alreadyVerifiedStep].forEach(el => {
    if (el) el.classList.add("hidden");
  });
  
  if (step === "phone") phoneVerificationStep?.classList.remove("hidden");
  else if (step === "otp") otpVerificationStep?.classList.remove("hidden");
  else if (step === "documents") documentUploadStep?.classList.remove("hidden");
  else if (step === "pendingApproval") pendingApprovalStep?.classList.remove("hidden");
  else if (step === "alreadyVerified") alreadyVerifiedStep?.classList.remove("hidden");
}

// Step 1: Phone Verification with Firebase Auth
phoneForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("📱 Phone form submitted");
  
  const phone = phoneInput.value.trim();
  console.log("Phone input:", phone);
  
  if (!phone) {
    alert("Please enter a phone number");
    return;
  }
  
  try {
    console.log("⏳ Waiting for Firebase...");
    // Wait for Firebase to load
    await waitForFirebase();
    console.log("✅ Firebase loaded");
    
    if (typeof firebase === 'undefined' || !firebase.auth) {
      throw new Error("Firebase is not loaded. Please refresh the page.");
    }
    
    phoneForm.disabled = true;
    currentPhone = phone;
    otpPhone.textContent = `OTP sent to ${phone}`;
    
    console.log("🔐 Creating reCAPTCHA verifier...");
    // Send OTP via Firebase Phone Auth
    const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible',
      'callback': (response) => {
        console.log("reCAPTCHA verified:", response);
      }
    });
    
    console.log("📲 Sending OTP to:", phone);
    confirmationResult = await firebase.auth().signInWithPhoneNumber(phone, appVerifier);
    console.log("✅ OTP sent successfully");
    
    showStep("otp");
    otpInput.focus();
  } catch (error) {
    console.error("❌ Phone verification error:", error);
    alert("Error sending OTP: " + error.message);
    phoneForm.disabled = false;
  }
});

// Step 2: OTP Verification with Firebase
otpForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const enteredOTP = otpInput.value.trim();
  
  if (!enteredOTP || enteredOTP.length !== 6) {
    alert("Please enter a valid 6-digit OTP");
    return;
  }
  
  try {
    await waitForFirebase();
    
    otpForm.disabled = true;
    
    if (!confirmationResult) {
      alert("Please start phone verification again");
      return;
    }
    
    // Verify OTP and sign in
    const userCredential = await confirmationResult.confirm(enteredOTP);
    const user = userCredential.user;
    
    // Create driver document in Firestore
    await firebase.firestore().collection("drivers").doc(user.uid).set({
      uid: user.uid,
      phone: currentPhone,
      verified: false,
      createdAt: new Date(),
      documents: [],
      bankAccount: ""
    }, { merge: true });
    
    // OTP verified - proceed to documents
    showStep("documents");
    documentForm.reset();
  } catch (error) {
    console.error("OTP verification error:", error);
    alert("Invalid OTP. Please try again.");
    otpForm.disabled = false;
  }
});

resendOtpBtn?.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
    confirmationResult = await firebase.auth().signInWithPhoneNumber(currentPhone, appVerifier);
    alert("OTP resent!");
    otpInput.value = "";
    otpInput.focus();
  } catch (error) {
    alert("Error resending OTP: " + error.message);
  }
});

// File upload handlers
[licenseFile, registrationFile, selfieFile].forEach(input => {
  input?.addEventListener("change", (e) => {
    const status = e.target.id === "licenseFile" ? licenseStatus :
                   e.target.id === "registrationFile" ? registrationStatus :
                   selfieStatus;
    
    if (e.target.files && e.target.files.length > 0) {
      const fileName = e.target.files[0].name;
      status.textContent = `✓ ${fileName}`;
      status.style.color = "var(--accent-gold)";
    }
  });
});

// Step 3: Document Upload to Firebase Storage
documentForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  if (!licenseFile.files.length) {
    alert("Please upload Driver's License");
    return;
  }
  
  if (!registrationFile.files.length) {
    alert("Please upload Vehicle Registration");
    return;
  }
  
  if (!selfieFile.files.length) {
    alert("Please upload Selfie with ID");
    return;
  }
  
  if (!bankAccount.value.trim()) {
    alert("Please enter Bank Account Number");
    return;
  }
  
  if (!agreeCheckbox.checked) {
    alert("Please agree to terms and conditions");
    return;
  }
  
  try {
    await waitForFirebase();
    
    documentForm.disabled = true;
    const user = firebase.auth().currentUser;
    
    if (!user) {
      alert("User not authenticated. Please start over.");
      return;
    }
    
    // Upload files to Firebase Cloud Storage
    const storage = firebase.storage();
    const documents = [];
    
    const files = [
      { file: licenseFile.files[0], type: "license" },
      { file: registrationFile.files[0], type: "registration" },
      { file: selfieFile.files[0], type: "selfie" }
    ];
    
    for (const { file, type } of files) {
      const ref = storage.ref(`drivers/${user.uid}/${type}/${file.name}`);
      await ref.put(file);
      const url = await ref.getDownloadURL();
      
      documents.push({
        type: type,
        url: url,
        fileName: file.name,
        uploadedAt: new Date().toISOString()
      });
    }
    
    // Update driver in Firestore with documents and bank account
    await firebase.firestore().collection("drivers").doc(user.uid).update({
      documents: documents,
      bankAccount: bankAccount.value.trim(),
      verifiedAt: null,
      statusMessage: "Pending admin review"
    });
    
    showStep("pendingApproval");
  } catch (error) {
    console.error("Document upload error:", error);
    alert("Error uploading documents: " + error.message);
    documentForm.disabled = false;
  }
});

// Initialize
window.addEventListener("load", async () => {
  await checkExistingUser();
  if (!currentUser) {
    showStep("phone");
  }
});
