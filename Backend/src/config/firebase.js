require('dotenv').config();
const admin = require('firebase-admin');

// La variable GOOGLE_APPLICATION_CREDENTIALS ya debería estar cargada por dotenv
// Firebase Admin SDK la buscará automáticamente si está definida.
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // Opcional: Si tienes Realtime Database o Storage, añade sus URLs aquí
    // databaseURL: "https://<DATABASE_NAME>.firebaseio.com",
    // storageBucket: "<BUCKET_NAME>.appspot.com"
  });
  console.log('Firebase Admin SDK initialized successfully!');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1); // Salir si Firebase no se inicializa
}

module.exports = admin;