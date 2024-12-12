const admin = require('firebase-admin');
const serviceAccount = require('./firebaseServiceAccount.json'); // Ensure correct path to your Firebase service account key

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'emotion-predictor-96406.appspot.com', // Replace with your Firebase Storage bucket name
});

// Export the bucket for use in other files
const bucket = admin.storage().bucket();
module.exports = bucket;
