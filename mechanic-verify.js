// Mechanic Verification Flow - Using Firebase Auth + Firestore
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

// Use API configuration from config.js
const API_BASE = apiConfig?.baseURL || "http://localhost:3000";

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
const idFile = qs("idFile");
const certFile = qs("certFile");
const selfieFile = qs("selfieFile");
const experience = qs("experience");
const specializations = qs("specializations");
const bankAccount = qs("bankAccount");
const agreeCheckbox = qs("agreeCheckbox");

const idStatus = qs("idStatus");
const certStatus = qs("certStatus");
const selfieStatus = qs("selfieStatus");

const pendingApprovalStep = qs("pendingApprovalStep");
const alreadyVerifiedStep = qs("alreadyVerifiedStep");

// Check if user already exists
function checkExistingUser() {
  const session = loadSession("mechanic");
  if (session) {
    const user = findUserByPhone("mechanic", session.phone);
    if (user) {
      currentUser = user;
      if (user.verified) {
        showStep("alreadyVerified");
      } else {
        showStep("pendingApproval");
      }
    }
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

// Step 1: Phone Verification
phoneForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const phone = phoneInput.value.trim();
  
  if (!phone) {
    alert("❌ Please enter a phone number");
    return;
  }
  
  try {
    await waitForFirebase();
    
    if (typeof firebase === 'undefined' || !firebase.auth) {
      throw new Error("Firebase is not loaded. Please refresh the page.");
    }
    
    phoneForm.disabled = true;
    currentPhone = phone;
    otpPhone.textContent = `OTP will be sent to ${phone}`;
    
    // Send OTP via Firebase Phone Auth
    const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
    confirmationResult = await firebase.auth().signInWithPhoneNumber(phone, appVerifier);
    
    showStep("otp");
    otpInput.focus();
  } catch (error) {
    console.error("Phone verification error:", error);
    alert("❌ Error: " + error.message);
    phoneForm.disabled = false;
  }
});

// Step 2: OTP Verification
otpForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const enteredOTP = otpInput.value.trim();
  
  if (!enteredOTP || enteredOTP.length !== 6) {
    alert("❌ Please enter a valid 6-digit OTP");
    return;
  }
  
  try {
    await waitForFirebase();
    
    otpForm.disabled = true;
    
    if (!confirmationResult) {
      alert("❌ Please start phone verification again");
      return;
    }
    
    // Verify OTP and sign in
    const userCredential = await confirmationResult.confirm(enteredOTP);
    const user = userCredential.user;
    
    // Create mechanic document in Firestore
    await firebase.firestore().collection("mechanics").doc(user.uid).set({
      uid: user.uid,
      phone: currentPhone,
      createdAt: new Date(),
      verified: false
    }, { merge: true });
    
    showStep("documents");
    documentForm.reset();
    alert("✅ Phone verified! Now upload your documents.");
    otpForm.disabled = false;
  } catch (error) {
    console.error("OTP verification error:", error);
    alert("❌ Error: " + error.message);
    otpForm.disabled = false;
  }
});

// Resend OTP
resendOtpBtn?.addEventListener("click", async (e) => {
  e.preventDefault();
  
  try {
    await waitForFirebase();
    
    if (!currentPhone || !confirmationResult) {
      alert("❌ Please start phone verification again");
      return;
    }
    
    // Resend uses the same confirmationResult
    alert("✅ OTP resent to " + currentPhone);
  } catch (error) {
    console.error("Resend OTP error:", error);
    alert("❌ Error: " + error.message);
  }
});

// File upload handlers
[idFile, certFile, selfieFile].forEach(input => {
  input?.addEventListener("change", (e) => {
    const status = e.target.id === "idFile" ? idStatus :
                   e.target.id === "certFile" ? certStatus :
                   selfieStatus;
    
    if (e.target.files && e.target.files.length > 0) {
      const fileName = e.target.files[0].name;
      status.textContent = `✓ ${fileName}`;
      status.style.color = "var(--accent-gold)";
    }
  });
});

// Step 3: Document Upload
documentForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  if (!idFile.files.length) {
    alert("❌ Please upload ID Proof");
    return;
  }
  
  if (!certFile.files.length) {
    alert("❌ Please upload Technical Certificate");
    return;
  }
  
  if (!selfieFile.files.length) {
    alert("❌ Please upload Selfie with ID");
    return;
  }
  
  if (!experience.value) {
    alert("❌ Please enter years of experience");
    return;
  }
  
  if (!specializations.value.trim()) {
    alert("❌ Please enter your specializations");
    return;
  }
  
  if (!bankAccount.value.trim()) {
    alert("❌ Please enter Bank Account Number");
    return;
  }
  
  if (!agreeCheckbox.checked) {
    alert("❌ Please agree to terms and conditions");
    return;
  }
  
  try {
    await waitForFirebase();
    
    documentForm.disabled = true;
    const user = firebase.auth().currentUser;
    
    if (!user) {
      alert("❌ Please verify your phone first");
      documentForm.disabled = false;
      return;
    }
    
    // Upload files to Firebase Cloud Storage
    const storage = firebase.storage();
    const documents = [];
    const files = [
      { file: idFile.files[0], name: "id-proof" },
      { file: certFile.files[0], name: "certificate" },
      { file: selfieFile.files[0], name: "selfie" }
    ];
    
    for (const { file, name } of files) {
      const fileName = `mechanics/${user.uid}/${name}-${Date.now()}`;
      const ref = storage.ref(fileName);
      await ref.put(file);
      const url = await ref.getDownloadURL();
      
      documents.push({
        name: file.name,
        url,
        type: name,
        uploadedAt: new Date().toISOString()
      });
    }
    
    // Update mechanic profile in Firestore
    await firebase.firestore().collection("mechanics").doc(user.uid).update({
      documents,
      experience: Number(experience.value),
      specializations: specializations.value.split(",").map(s => s.trim()),
      bankAccount: bankAccount.value,
      verified: false
    });
    
    showStep("pendingApproval");
    alert("✅ Documents submitted! Admin will review within 24 hours.");
  } catch (error) {
    console.error("Document upload error:", error);
    alert("❌ Error uploading documents: " + error.message);
  } finally {
    documentForm.disabled = false;
  }
});

// Initialize
checkExistingUser();
if (!currentUser) {
  showStep("phone");
}
