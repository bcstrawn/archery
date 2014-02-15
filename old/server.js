var express = require('express'),
	app = express(),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/tournaments');

var tournamentSchema = new Schema({
	name: String,
	maxScore: Number,
	weeks: Number,
	members: [{}],
	rules: [{}]
});

var Tournament = mongoose.model('Tournament', tournamentSchema);

app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());

app.get('/tournament/:id', function(req, res) {
	getTournament(req.params.id, function(tournament) {
		res.send(tournament);
	});
});

app.get('/tournaments', function(req, res) {
	Tournament.find({}, function(err, tournaments) {
		if (err) throw err;

		res.send(tournaments);
	});
});

app.get('/create', function(req, res) {
	createTournament(function(tournament) {
		res.send(tournament);
	});
});

app.post('/save', function(req, res) {
	var tournamentInfo = req.body;
	var tournament = new Tournament(tournamentInfo);
	/*Tournament.update({_id: tournamentInfo._id}, tournamentInfo, {upsert: true}, function(err, tourney) {
		if (err) throw err;
		console.log(tourney);
		res.send(tourney);
	});*/
	tournament.save(function(err, doc) {
		if (err) throw err;

		res.send(doc);
	});
});

var createTournament = function(cb) {
	var tournamentInfo = {
		name: 'tourney1',
		maxScore: 300,
		weeks: 6,
		members: [
			{name: 'Bob'},
			{name: 'Joe'},
			{name: 'Pete'}
		],
		rules: [
			{best: 1, of: 2, percent: 80},
			{best: 2, of: 5, percent: 80},
			{best: 3, of: 7, percent: 80}
		]
	};

	populateData(tournamentInfo, tournamentInfo.members);

	var tournament = new Tournament(tournamentInfo);
	tournament.save(function(err, doc) {
		if (err) throw err;

		cb(doc);
	});
};

var getTournament = function(id, cb) {
	Tournament.findOne({_id: id}, function(err, tournament) {
		if (err) throw err;

		cb(tournament);
	});
};

var populateData = function(tournament, members) {
	for (var i = 0; i < members.length; i++) {
		var member = members[i];
		var weeks = [];
		for (var x = 0; x < tournament.weeks; x++) {
			weeks.push({
				score: 3,
				handicap: null,
				total: null,
				bullseyes: 1,
				rank: null
			});
		}
		member.weeks = weeks;
	}
};


app.listen(3000);
console.log('listening on 3000');