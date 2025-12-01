require('dotenv').config();
const admin = require('firebase-admin');

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // EN LA NUBE: Leemos la variable de entorno (Texto JSON)
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (e) {
    console.error("❌ Error parseando FIREBASE_SERVICE_ACCOUNT");
  }
} else {
  // EN LOCAL: Buscamos el archivo físico
  const path = require('path');
  try {
    serviceAccount = require(path.join(__dirname, '../../firebase-service-account-key.json'));
  } catch (e) {
    console.warn("⚠️ No se encontró el archivo de llaves local.");
  }
}

if (serviceAccount) {
  try {
    // Evitar inicializar doble si ya existe
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("🔥 Firebase Admin SDK inicializado");
    }
  } catch (error) {
    console.error("❌ Error inicializando Firebase:", error);
  }
}

module.exports = admin;