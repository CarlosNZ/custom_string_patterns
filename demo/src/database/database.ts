import {
  getFirestore,
  runTransaction,
  doc,
  getDoc,
  updateDoc,
  FieldValue,
} from 'firebase/firestore'
import { initializeApp } from 'firebase/app'
import firebaseConfig from '../secrets/firebaseConfig.json'

const app = initializeApp(firebaseConfig)

const db = getFirestore(app)

// export const getCounter = async (counterName: string) => {
//   const counterRef = doc(db, 'counters', counterName)

//   // const counterRef =
//   // const counterRef = db.collection('cities').doc('DC');

//   const count = await updateDoc(counterRef, { count: 200 })
//   console.log('Count', count)
//   return count
// }

export const getCounter = async (counterName: string) => {
  const counterRef = doc(db, 'counters', counterName)

  try {
    const count = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef)
      if (!counterDoc.exists()) {
        throw new Error('Document does not exist!')
      }
      const count = counterDoc.data().count

      transaction.update(counterRef, { count: count + 1 })
      return count
    })
    return count
  } catch (e) {
    console.log('Transaction failed: ', e)
  }
  const counter = await getDoc(doc(db, 'counters', counterName))
  return counter.data()
}
