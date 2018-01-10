// const functions = require('firebase-functions');
// const admin = require('firebase-admin');
const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyB1wF4E4VWSxKj2dbldiERiK1bc9EABvBo'
});

const request = require('request')
const axios = require('axios')

// admin.initializeApp(functions.config().firebase)

// const nodemailer = require('nodemailer');
// // // Create and Deploy Your First Cloud Functions
// // // https://firebase.google.com/docs/functions/write-firebase-functions
// //
// // exports.helloWorld = functions.https.onRequest((request, response) => {
// //  response.send("Hello from Firebase!");
// // });

// const gmailEmail = functions.config().gmail.email;
// const gmailPassword = functions.config().gmail.password;
// const mailTransport = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: gmailEmail,
//     pass: gmailPassword
//   }
// });

// // Your company name to include in the emails
// // TODO: Change this to your app or company name to customize the email sent.
// const APP_NAME = 'YAPS.life';

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

// exports.googleMapsDistance = functions.firestore.document('users/{userId}').onCreate(event => {

const googleMapsAPIkey = 'AIzaSyB1wF4E4VWSxKj2dbldiERiK1bc9EABvBo'

const origin1 = ('Arnebråtveien 75D Oslo')
const origin2 = ('Nydalen Oslo')
const origin3 = ('Grunerløkka Oslo')
const destination1 = ('Netlight AS')
const destination2 = ('Google Norge')
const destination3 = ('Professor Kohts Vei 9, 1366 Lysaker, Norge')

const origins = [origin1, origin2, origin3]
const destinations = [destination1, destination2, destination3]

const nextMondayAt8 = getNextDayOfWeek(new Date(), 1)
originsURL = encodeURI(origin1) + '|' + encodeURI(origin2)
destinationsURL = encodeURI(destination1) + '|' + encodeURI(destination2)



googleMapsClient.distanceMatrix({
  origins: [
    origin1, origin2, origin3
  ],
  destinations: [
    destination1, destination2, destination3
  ],
  // travelMode: 'TRANSIT',
  // transitOptions: {
  //   arrivalTime: nextMondayAt8,
  // }
}, function (err, response) {
  console.log('')
  console.log('DM client')
  if (!err) {
    const data = response.json

    console.log(data)

    var origins = data.origin_addresses;
    var destinations = data.destination_addresses;

    for (var i = 0; i < origins.length; i++) {
      var results = data.rows[i].elements;
      for (var j = 0; j < results.length; j++) {
        var element = results[j];
        var distance = element.distance.text;
        var duration = element.duration.text;
        var from = origins[i];
        var to = destinations[j];
        console.log('Duration', from, to, duration)
      }
    }


  } else {
    console.log('Err distancematrix', err)
  }

});

function getNextDayOfWeek(date, dayOfWeek) {
  // Code to check that date and dayOfWeek are valid left as an exercise ;)
  date.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
  date.setHours(8, 0, 0)
  return date;
}

