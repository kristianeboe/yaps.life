import firebase from 'firebase'

const config = {
  apiKey: "AIzaSyDiWTmnNX_jffjr2ubjUx2UJx1QAO504TY",
  authDomain: "yaps-1496498804190.firebaseapp.com",
  databaseURL: "https://yaps-1496498804190.firebaseio.com",
  projectId: "yaps-1496498804190",
  storageBucket: "yaps-1496498804190.appspot.com",
  messagingSenderId: "569081698642"
};

firebase.initializeApp(config);

export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();
export default firebase;

