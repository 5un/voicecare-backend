import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';
import * as admin from 'firebase-admin';

// Initialize Twilio
var twilio = require('twilio');
var accountSid = 'AC0e68c7215fb3c073620a5743c4b62033';
var authToken = "61f6d697f64efea0df7cddf0a08b32b0";
var client = require('twilio')(accountSid, authToken);
const twilioNumber = '+12564740996';

// Initialize Firebase
var serviceAccount = require("../credentials/voicecare-128ba-firebase-adminsdk-jvn3o-41e90f6583.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://voicecare-128ba.firebaseio.com"
});

const hardcodedUser = {
  id: 'soravis',
  name: 'Soravis',
  number: '+16282026956'
};

const resetCheckup = (user) => {
  var db = admin.database();
  var ref = db.ref('checkups').child(user.id);
  ref.update({
    feeling: 'unknown',
    tookPills: false,
    checked_at: new Date()
  });
};

const completeCheckup = (user) => {
  var db = admin.database();
  var ref = db.ref('checkups').child(user.id);
  ref.update({
    feeling: 'well',
    tookPills: true,
    checked_at: new Date()
  });
};

export default ({ config, db }) => {
	let api = Router();

	// mount the facets resource
	api.use('/facets', facets({ config, db }));

  // perhaps expose some API metadata at the root
  api.get('/checkup', (req, res) => {
    res.json({ message:'checkup ja' });
  });

  // perhaps expose some API metadata at the root
  api.post('/checkup/callback', (req, res) => {
    let twiml = new twilio.TwimlResponse();
    twiml.say('Your daily checkup is now completed. Thank you', { voice: 'alice' });
    completeCheckup(hardcodedUser);
    res.type('text/xml');
    res.send(twiml.toString());
  });

  // perhaps expose some API metadata at the root
  api.post('/checkup/trigger', (req, res) => {
    resetCheckup(hardcodedUser);
    client.calls.create({
      url: "https://handler.twilio.com/twiml/EH671ac1dc324aea903d49496da245e425",
      to: hardcodedUser.number,
      from: twilioNumber
    }, function(err, call) {
      if (err) {
        console.error(err);
      } else {
        console.log(call);
        console.log(call.sid);
        res.send({ success: true, call });
      }
    });
  });

  api.get('/test-firebase', (req, res) => {
    completeCheckup(hardcodedUser);
    res.send({ success: true });
  });

  api.get('/reset-firebase', (req, res) => {
    resetCheckup(hardcodedUser);
    res.send({ success: true });
  });

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	return api;
}
