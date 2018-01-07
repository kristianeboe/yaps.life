const functions = require('firebase-functions');
const admin = require('firebase-admin');
const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyB1wF4E4VWSxKj2dbldiERiK1bc9EABvBo'
});

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
exports.sendWelcomeEmail = functions.firestore.document('users/{userId}').onDelete(event => {
  // [END onCreateTrigger]
  // [START eventAttributes]
  const user = event.data; // The Firebase user.

  const email = user.email; // The email of the user.
  const displayName = user.first_name; // The display name of the user.
  // [END eventAttributes]

  return sendWelcomeEmail(email, displayName);
});
// [END sendWelcomeEmail]

// Sends a welcome email to the given user.
function sendWelcomeEmail(email, displayName) {
  const mailOptions = {
    from: `${APP_NAME} <noreply@firebase.com>`,
    to: email
  };

  // The user subscribed to the newsletter.
  mailOptions.subject = `Welcome to ${APP_NAME}!`;
  mailOptions.text = `Hey ${displayName || ''}! Welcome to ${APP_NAME}. I hope you will enjoy our service.`;
  return mailTransport.sendMail(mailOptions).then(() => {
    console.log('New welcome email sent to:', email);
  });
}

exports.googleMapsDistance = functions.firestore.document('users/{userId}').onCreate(event => {
  var origin1 = 'Arnebråtveien 75D Oslo';
  var origin2 = 'Nydalen Oslo'
  var origin3 = 'Grunerløkka Oslo'
  var destination1 = 'Netlight AS';

  googleMapsClient.distanceMatrix({
    origins: [
      origin1, origin2, origin3
    ],
    destinations: [
      destination1
    ]
  }).then((result, status) => {
    console.log(result)
    console.log(status)
  })

});

function getNextDayOfWeek(date, dayOfWeek) {
  // Code to check that date and dayOfWeek are valid left as an exercise ;)
  var resultDate = new Date(date.getTime());

  resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);

  return resultDate;
}