'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Tournament = mongoose.model('Tournament'),
    _ = require('lodash');


/**
 * Find tournament by id
 */
exports.tournament = function(req, res, next, id) {
    Tournament.load(id, function(err, tournament) {
        if (err) return next(err);
        if (!tournament) return next(new Error('Failed to load tournament ' + id));
        req.tournament = tournament;
        next();
    });
};

/**
 * Create a tournament
 */
exports.create = function(req, res) {
    var tournament = new Tournament(req.body);
    tournament.user = req.user;
    tournament = exports.prepareTournament(tournament);

    tournament.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                tournament: tournament
            });
        } else {
            res.jsonp(tournament);
        }
    });
};

/**
 * Update a tournament
 */
exports.update = function(req, res) {
    var tournament = req.tournament;

    tournament = _.extend(tournament, req.body);

    tournament.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                tournament: tournament
            });
        } else {
            res.jsonp(tournament);
        }
    });
};

/**
 * Delete a tournament
 */
exports.destroy = function(req, res) {
    var tournament = req.tournament;

    tournament.remove(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                tournament: tournament
            });
        } else {
            res.jsonp(tournament);
        }
    });
};

/**
 * Show a tournament
 */
exports.show = function(req, res) {
    res.jsonp(req.tournament);
};

/**
 * List of Tournaments
 */
exports.all = function(req, res) {
    Tournament.find().sort('-created').populate('user', 'name username').exec(function(err, tournaments) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(tournaments);
        }
    });
};

exports.prepareTournament = function(tournament) {
    tournament.members.forEach(function(member) {
        member.weeks = [];

        for (var i = 0; i < tournament.weeks; i++) {
            member.weeks.push({
                score: null,
                handicap: null,
                total: null,
                bullseyes: null,
                rank: null
            });
        }
    });

    return tournament;
};