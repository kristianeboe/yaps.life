const functions = require('firebase-functions');
const admin = require('firebase-admin');
const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyB1wF4E4VWSxKj2dbldiERiK1bc9EABvBo'
});

const request = require('request')

admin.initializeApp(functions.config().firebase)

const nodemailer = require('nodemailer');
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword
  }
});

// Your company name to include in the emails
// TODO: Change this to your app or company name to customize the email sent.
const APP_NAME = 'YAPS.life';

// [START sendWelcomeEmail]
/**
 * Sends a welcome email to new user.
 */
// [START onCreateTrigger]
// exports.sendWelcomeEmail = functions.firestore.document('users/{userId}').onDelete(event => {
//   // [END onCreateTrigger]
//   // [START eventAttributes]
//   const user = event.data; // The Firebase user.

//   const email = user.email; // The email of the user.
//   const displayName = user.first_name; // The display name of the user.
//   // [END eventAttributes]

//   // return sendWelcomeEmail(email, displayName);
// });
// // [END sendWelcomeEmail]

// // Sends a welcome email to the given user.
// function sendWelcomeEmail(email, displayName) {
//   const mailOptions = {
//     from: `${APP_NAME} <noreply@firebase.com>`,
//     to: email
//   };

//   // The user subscribed to the newsletter.
//   mailOptions.subject = `Welcome to ${APP_NAME}!`;
//   mailOptions.text = `Hey ${displayName || ''}! Welcome to ${APP_NAME}. I hope you will enjoy our service.`;
//   return mailTransport.sendMail(mailOptions).then(() => {
//     console.log('New welcome email sent to:', email);
//   });
// }

exports.googleMapsDistance = functions.firestore.document('users/{userId}').onCreate(event => {

  // console.log(googleMapsClient.distanceMatrix())

  const googleMapsAPIkey = 'AIzaSyB1wF4E4VWSxKj2dbldiERiK1bc9EABvBo'

  const origin1 = '' //'Arnebråtveien+75D+Oslo';
  const origin2 = 'Nydalen+Oslo'
  const origin3 = '' //'Grunerløkka+Oslo'
  const destination1 = 'Netlight+AS';

  // googleMapsClient.distanceMatrix({
  //   origins: [
  //     'Nydalen Oslo'
  //   ],
  //   destinations: [
  //     destination1
  //   ]
  // })

  const origins = origin1+'|'+origin2+'|'+origin3
  const destinations = destination1
  const url = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins=' +origin2+ '&destinations=' +destinations+ '&mode=transit&key=' + googleMapsAPIkey
  console.log(url)

  request.get(url, function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred 
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
    console.log('body:', body); //Prints the response of the request. 
  });

});

function getNextDayOfWeek(date, dayOfWeek) {
  // Code to check that date and dayOfWeek are valid left as an exercise ;)
  var resultDate = new Date(date.getTime());

  resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);

  return resultDate;
}