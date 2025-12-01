require('dotenv').config();
const admin = require('firebase-admin');

let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // EN LA NUBE: Leemos la variable de entorno (Texto JSON)
    // Railway a veces escapa los saltos de línea, intentamos parsear
    const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT;
    serviceAccount = JSON.parse(rawKey);
  } else {
    // EN LOCAL: Buscamos el archivo físico
    const path = require('path');
    serviceAccount = require(path.join(__dirname, '../../firebase-service-account-key.json'));
  }

  // Inicializar solo si no existe ya
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("🔥 Firebase Admin SDK inicializado correctamente");
  }
} catch (error) {
  console.error("❌ Error CRÍTICO inicializando Firebase:", error.message);
  // En producción esto debería detener el deploy si falla, pero por ahora solo logueamos
}

module.exports = admin;