import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';
var twilio = require('twilio');

export default ({ config, db }) => {
	let api = Router();

	// mount the facets resource
	api.use('/facets', facets({ config, db }));

  // perhaps expose some API metadata at the root
  api.get('/checkup', (req, res) => {
    res.json({ message:'checkup ja' });
  });

  // perhaps expose some API metadata at the root
  api.post('/checkup', (req, res) => {
    console.log(req.body);
    //res.json({ message:'checkup ja' });
    let twiml = new twilio.TwimlResponse();
    twiml.say('Your daily checkup is now completed. Thank you', { voice: 'alice' });
    // Render the response as XML in reply to the webhook request
    res.type('text/xml');
    res.send(twiml.toString());
  });

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	return api;
}
