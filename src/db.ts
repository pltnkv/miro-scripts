import * as firebase from 'firebase/app'
import {firebaseConfig} from 'config'

require('firebase/firestore')

firebase.initializeApp(firebaseConfig)
const db = firebase.firestore()

export default function getDB():firebase.firestore.Firestore {
	return db
}
