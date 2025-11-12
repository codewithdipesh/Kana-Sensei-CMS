// Firebase modular SDK helpers
import { initializeApp } from "firebase/app"
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth"
import {
  getFirestore,
  collection as collectionRef,
  doc as docRef,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query as queryRef,
  orderBy as orderByRef,
  limit as limitRef,
  getDocs,
  getDoc,
  runTransaction,
} from "firebase/firestore"

let app
let auth
let db

function initIfNeeded() {
  if (typeof window === "undefined") return
  if (app) return
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }

  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
}

initIfNeeded()

// ----- Auth helpers -----
export async function signUpWithEmail(email, password) {
  initIfNeeded()
  const res = await createUserWithEmailAndPassword(auth, email, password)
  return res.user
}

export async function signInWithEmail(email, password) {
  initIfNeeded()
  const res = await signInWithEmailAndPassword(auth, email, password)
  return res.user
}

export async function signOutUser() {
  initIfNeeded()
  return signOut(auth)
}

export function onAuthChange(cb) {
  initIfNeeded()
  return onAuthStateChanged(auth, cb)
}

// ----- Firestore helpers -----
function _collection(name) {
  initIfNeeded()
  return collectionRef(db, name)
}

export async function addDocument(collection, data) {
  initIfNeeded()
  const col = _collection(collection)
  const ref = await addDoc(col, data)
  await updateDoc(ref, { id: ref.id })
  return { id: ref.id }
}

export async function setDocument(collection, id, data, merge = true) {
  initIfNeeded()
  const ref = docRef(db, collection, String(id))
  await setDoc(ref, data, { merge })
}

export async function updateDocument(collection, id, partial) {
  initIfNeeded()
  const ref = docRef(db, collection, String(id))
  await updateDoc(ref, partial)
}

export async function deleteDocument(collection, id) {
  initIfNeeded()
  const ref = docRef(db, collection, String(id))
  await deleteDoc(ref)
}

export function subscribeCollection(collection, onSnapshotCallback, options = {}) {
  initIfNeeded()
  let q = _collection(collection)
  const clauses = []
  if (options.orderBy) {
    const { field, direction = "asc" } = options.orderBy
    clauses.push(orderByRef(field, direction))
  }
  if (options.limit) clauses.push(limitRef(options.limit))
  if (clauses.length) q = queryRef(_collection(collection), ...clauses)
  const unsub = onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    onSnapshotCallback(items)
  })
  return unsub
}

export async function getCollectionOnce(collection, options = {}) {
  initIfNeeded()
  let q = _collection(collection)
  const clauses = []
  if (options.orderBy) {
    const { field, direction = "asc" } = options.orderBy
    clauses.push(orderByRef(field, direction))
  }
  if (options.limit) clauses.push(limitRef(options.limit))
  if (clauses.length) q = queryRef(_collection(collection), ...clauses)
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getDocumentOnce(collection, id) {
  initIfNeeded()
  const ref = docRef(db, collection, String(id))
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

// swap order fields atomically using transaction
export async function swapOrder(collection, idA, idB, field = "order") {
  initIfNeeded()
  const refA = docRef(db, collection, String(idA))
  const refB = docRef(db, collection, String(idB))
  await runTransaction(db, async (tx) => {
    const a = await tx.get(refA)
    const b = await tx.get(refB)
    if (!a.exists() || !b.exists()) throw new Error("Document not found for swapping order")
    const orderA = a.get(field)
    const orderB = b.get(field)
    tx.update(refA, { [field]: orderB })
    tx.update(refB, { [field]: orderA })
  })
}

export { db }
