angular.module('Archery', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/', {templateUrl: 'list.html', controller: 'ListCtrl'})
		.when('/tournament/:id', {templateUrl: 'view.html', controller: 'ViewCtrl'})
		.when('/create/:name', {templateUrl: 'view.html', controller: 'EditCtrl'})
		.otherwise({redirectTo: '/'});
}])

.controller('ListCtrl', ['$scope', '$http', '$location', function($scope, $http, $location) {
	$http.get('/tournaments').success(function(tournaments) {
		$scope.tournaments = tournaments;
	});

	$scope.createNew = function(name) {
		console.log('creating a new tourney');
		var tournamentInfo = {
			name: name,
			maxScore: 300,
			weeks: 6,
			members: [],
			rules: []
		};

		$http.post('/save', tournamentInfo).success(function(tournament) {
			console.log('created a new tourney:');
			console.log(tournament);
			$location.path('/tournament/' + tournament._id);
		});
	};
}])

.controller('EditCtrl', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http) {
	$scope.name = $routeParams.name;

	

	$scope.createNew($scope.name);
}])

.controller('ViewCtrl', ['$scope', 'forEach', '$http', '$routeParams', function($scope, forEach, $http, $routeParams) {
	if ($routeParams.id) {
		$http.get('/tournament/' + $routeParams.id).success(function(tournament) {
			console.log('got tourney:');
			console.log(tournament);
			$scope.tournament = tournament;

			$scope.$watch('tournament.members', function(oldVal, newVal) {
				forEach.do($scope.tournament.members, function(member) {
					$scope.applyHandicap(member);
				});
			}, true);

			$scope.$watch('tournament.rules', function(oldVal, newVal) {
				forEach.do($scope.tournament.members, function(member) {
					$scope.applyHandicap(member);
				});
			}, true);
		});
	}


	$scope.addRule = function() {
		$scope.tournament.rules.push({});
	};

	$scope.removeRule = function(rule) {
		var index = $scope.tournament.rules.indexOf(rule);
		$scope.tournament.rules.splice(index, 1);
	};

	$scope.createTournament = function() {
		$http.get('/create').success(function(tournament) {
			$scope.tournament = tournament;
		});
	};

	$scope.addParticipant = function(name) {
		var member = {
			name: name,
			weeks: []
		};

		for (var i = 0; i < $scope.tournament.weeks; i++) {
			member.weeks.push({
				score: null,
				handicap: null,
				total: null,
				bullseyes: null,
				rank: null
			});
		}

		$scope.tournament.members.push(member);
		$scope.newMemberName = "";
	};

	$scope.saveCurrent = function() {
		$http.post('/save', $scope.tournament).success(function(response) {
			console.log(response);
		});
	};



	$scope.applyHandicap = function(member) {
		var shoots = forEach.select(member.weeks, function(week) {
			if (parseInt(week.score) > 0)
				return week;
		});
		var pendingShoots = [];

		if (!shoots) {
			return;
		}

		for (var i = 0; i < shoots.length; i++) {
			var shoot = shoots[i];
			var pastShoots = shoots.slice(0, i);
			var ruleMatched = null;

			forEach.do($scope.tournament.rules, function(rule) {
				if (pastShoots.length >= parseInt(rule.of))
					ruleMatched = rule;
			});

			/*if (pastShoots.length >= 7) {
				numHighest = 3;
			} else if (pastShoots.length >= 5) {
				numHighest = 2;
			} else if (pastShoots.length >= 2) {
				numHighest = 1;
			}*/

			if (ruleMatched) {
				//calculate handicap
				var average = $scope.calculateAverage(pastShoots, parseInt(ruleMatched.best));
				var modifier = parseInt(ruleMatched.percent) / 100
				var handicap = Math.round(($scope.tournament.maxScore - average) * modifier);
				// set it on the shoot
				shoot.handicap = handicap;
				shoot.total = parseInt(shoot.score) + handicap;

				// apply handicap to any pending shoots
				forEach.do(pendingShoots, function(pendingShoot) {
					pendingShoot.handicap = handicap;
					pendingShoot.total = parseInt(pendingShoot.score) + handicap;
				});

				// remove pending shoots from list
				pendingShoots = [];
			} else {
				// unable to get handicap
				// add shoot to list of shoots that need a retroactive handicap
				pendingShoots.push(shoot);
			}
		}
	};

	$scope.calculateAverage = function(pastShoots, numHighest) {
		var scores = forEach.select(pastShoots, function(shoot) {
			return parseInt(shoot.score);
		}).sort(function(a, b) {
			return b - a;
		});

		var highestScores = scores.slice(0, numHighest);
		var sum = 0;
		forEach.do(highestScores, function(score) {
			sum += score;
		});

		return sum / numHighest;
	};
}])

.filter('range', function() {
	return function(input, total) {
		total = parseInt(total);
		for (var i=0; i<total; i++)
			input.push(i);
		return input;
	};
})

.factory('forEach', function() {
	return {
		do: function(set, callback) {
			for (var i = 0; i < set.length; i++) {
				var item = set[i];
				callback(item);
			}
		},

		select: function(set, callback, options) {
			var processed = [];
			if (set === null || set === undefined) {
				return null;
			}

			for (var i = 0; i < set.length; i++) {
				var item = set[i];
				var result = callback(item, processed);
				if (result !== null && result !== undefined) {
					if (options && options.unique === true) {
						if (processed.indexOf(result) === -1) {
							processed.push(result);
						}
					} else {
						processed.push(result);
					}
				}
			}

			if (processed.length === 0 && !(options && options.returnEmpty)) {
				return null;
			} else if (processed.length === 1 && !(options && options.forceArray)) {
				return processed[0];
			}

			return processed;
		},

		obj: {
			do: function(set, callback) {
				for (var field in set) {
					if (set.hasOwnProperty(field)) {
						var item = set[field];
						callback(item);
					}
				}
			},

			select: function(set, callback, options) {
				var processed;
				if (options && options.returnObject) {
					processed = {};
				} else {
					processed = [];
				}

				for (var field in set) {
					if (set.hasOwnProperty(field)) {
						var item = set[field];
						var result = callback(item);

						if (options && options.returnObject) {
							processed[field] = result;
						} else {
							processed.push(result);
						}
					}
				}

				return processed;
			}
		}
	};
});