import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/auth';
import 'firebase/database';

// const firebaseApp = window.firebase;
var firebaseConfig = {
    apiKey: "AIzaSyAEz6HgZu1mhIJ5J9erxd2RXmOLqyrGrxY",
    authDomain: "sahara-375a9.firebaseapp.com",
    databaseURL: "https://sahara-375a9.firebaseio.com",
    projectId: "sahara-375a9",
    storageBucket: "sahara-375a9.appspot.com",
    messagingSenderId: "816244831538",
    appId: "1:816244831538:web:9a060306abf89dc3db132b",
    measurementId: "G-0855VZ9BG3"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// firebase.analytics();

export default firebase;
