/* ===================== FIREBASE INIT ===================== */
// Konfiguracija projekta "banjalukakrozrazglednice"
const firebaseConfig = {
  apiKey: "AIzaSyBvKoVPgQgLJu1wkdh2ti_mKR3bUaP9HWA",
  authDomain: "banjalukakrozrazglednice.firebaseapp.com",
  projectId: "banjalukakrozrazglednice",
  storageBucket: "banjalukakrozrazglednice.firebasestorage.app",
  messagingSenderId: "380298426608",
  appId: "1:380298426608:web:0312b95b4eaa0f9233aa35",
  measurementId: "G-52MTQYENL2"
};

firebase.initializeApp(firebaseConfig);

// Firestore — čuva podatke o razglednicama (bez slika, one idu na ImgBB)
const db = firebase.firestore();
const POSTCARDS_COLLECTION = 'postcards';

// Auth — samo prijavljeni korisnik (ti) može mijenjati podatke
const auth = firebase.auth();
