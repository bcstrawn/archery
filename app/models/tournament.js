'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Tournament Schema
 */
var TournamentSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
        default: '',
        trim: true
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    maxScore: {
        type: Number,
        default: 300
    },
    weeks: {
        type: Number,
        default: 12
    },
    members: {
        type: [{}],
        default: [{}]
    },
    rules: {
        type: [{}],
        default: [{}]
    }
});

/**
 * Validations
 */
TournamentSchema.path('title').validate(function(title) {
    return title.length;
}, 'Title cannot be blank');

/**
 * Statics
 */
TournamentSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate('user', 'name username').exec(cb);
};

mongoose.model('Tournament', TournamentSchema);
