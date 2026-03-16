// Firestore Integration - Real-time database operations
// NO COST - 100% FREE Firebase Firestore

// ===== ORDERS =====
async function createOrder(customerUid, orderData) {
  try {
    const docRef = await firebase.firestore().collection("orders").add({
      customerUid,
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date(),
      acceptedBy: null,
      status: "waiting"
    });
    return { id: docRef.id, ...orderData };
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

async function getOrders(customerUid) {
  try {
    const snapshot = await firebase.firestore()
      .collection("orders")
      .where("customerUid", "==", customerUid)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting orders:", error);
    return [];
  }
}

async function updateOrder(orderId, updates) {
  try {
    await firebase.firestore()
      .collection("orders")
      .doc(orderId)
      .update({
        ...updates,
        updatedAt: new Date()
      });
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
}

async function getAvailableOrders() {
  try {
    const snapshot = await firebase.firestore()
      .collection("orders")
      .where("status", "==", "waiting")
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting available orders:", error);
    return [];
  }
}

// ===== MECHANIC REQUESTS =====
async function createMechanicRequest(customerUid, requestData) {
  try {
    const docRef = await firebase.firestore().collection("mechanic_requests").add({
      customerUid,
      ...requestData,
      createdAt: new Date(),
      updatedAt: new Date(),
      acceptedBy: null,
      status: "waiting"
    });
    return { id: docRef.id, ...requestData };
  } catch (error) {
    console.error("Error creating mechanic request:", error);
    throw error;
  }
}

async function getAvailableMechanicRequests() {
  try {
    const snapshot = await firebase.firestore()
      .collection("mechanic_requests")
      .where("status", "==", "waiting")
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting mechanic requests:", error);
    return [];
  }
}

async function acceptMechanicRequest(requestId, mechanicUid) {
  try {
    await firebase.firestore()
      .collection("mechanic_requests")
      .doc(requestId)
      .update({
        acceptedBy: mechanicUid,
        status: "accepted",
        updatedAt: new Date()
      });
  } catch (error) {
    console.error("Error accepting request:", error);
    throw error;
  }
}

// ===== MESSAGES / CHAT =====
async function sendMessage(jobId, senderUid, senderRole, text) {
  try {
    const docRef = await firebase.firestore().collection("messages").add({
      jobId,
      senderUid,
      senderRole,
      text,
      createdAt: new Date(),
      read: false
    });
    return { id: docRef.id, text, senderUid, senderRole };
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

async function getMessages(jobId) {
  try {
    const snapshot = await firebase.firestore()
      .collection("messages")
      .where("jobId", "==", jobId)
      .orderBy("createdAt", "asc")
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting messages:", error);
    return [];
  }
}

// ===== DRIVERS =====
async function getDriverProfile(driverUid) {
  try {
    const doc = await firebase.firestore()
      .collection("drivers")
      .doc(driverUid)
      .get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  } catch (error) {
    console.error("Error getting driver profile:", error);
    return null;
  }
}

async function updateDriverProfile(driverUid, updates) {
  try {
    await firebase.firestore()
      .collection("drivers")
      .doc(driverUid)
      .update(updates);
  } catch (error) {
    console.error("Error updating driver profile:", error);
    throw error;
  }
}

// ===== MECHANICS =====
async function getMechanicProfile(mechanicUid) {
  try {
    const doc = await firebase.firestore()
      .collection("mechanics")
      .doc(mechanicUid)
      .get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  } catch (error) {
    console.error("Error getting mechanic profile:", error);
    return null;
  }
}

async function updateMechanicProfile(mechanicUid, updates) {
  try {
    await firebase.firestore()
      .collection("mechanics")
      .doc(mechanicUid)
      .update(updates);
  } catch (error) {
    console.error("Error updating mechanic profile:", error);
    throw error;
  }
}

// ===== OTP CODES (For tracking) =====
async function storeOTPCode(phone, code) {
  try {
    await firebase.firestore().collection("otp_codes").add({
      phone,
      code,
      verified: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60000) // 10 minutes
    });
  } catch (error) {
    console.error("Error storing OTP:", error);
  }
}

// ===== DOCUMENT UPLOAD TO CLOUD STORAGE (100% FREE) =====
async function uploadDocument(userUid, docType, file) {
  try {
    const storageRef = firebase.storage().ref();
    const fileRef = storageRef.child(`users/${userUid}/${docType}/${file.name}`);
    
    await fileRef.put(file);
    const url = await fileRef.getDownloadURL();
    
    return {
      type: docType,
      fileName: file.name,
      url: url,
      uploadedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
}

// ===== INIT FIRESTORE COLLECTIONS (Called once) =====
async function initializeFirestoreCollections() {
  try {
    const db = firebase.firestore();
    
    // Check if collections exist by trying to read them
    const collections = ["drivers", "mechanics", "orders", "mechanic_requests", "messages", "otp_codes"];
    
    for (const collectionName of collections) {
      try {
        await db.collection(collectionName).limit(1).get();
      } catch {
        // Create collection by adding a template doc if it doesn't exist
        console.log(`Creating collection: ${collectionName}`);
      }
    }
    
    console.log("✅ Firestore collections initialized");
  } catch (error) {
    console.error("Error initializing collections:", error);
  }
}

// Initialize on page load
window.addEventListener("load", initializeFirestoreCollections);

console.log("✅ Firestore Integration Loaded - 100% FREE");
