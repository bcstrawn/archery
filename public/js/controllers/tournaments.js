'use strict';

angular.module('mean.tournaments').controller('TournamentsController', ['$scope', '$routeParams', '$location', 'Global', 'Tournaments', 
    function ($scope, $routeParams, $location, Global, Tournaments) {

    $scope.global = Global;

    $scope.emptyFields = function() {
        this.title = '';
        this.maxScore = '';
        this.weeks = '';
        this.members = [];
        this.rules = [];
        this.newRule = {};
    };

    $scope.create = function() {
        var tournament = new Tournaments({
            title: this.title,
            maxScore: this.maxScore,
            weeks: this.weeks,
            members: this.members,
            rules: this.rules
        });
        tournament.$save(function(response) {
            $location.path('tournaments/' + response._id);
        });

        $scope.emptyFields();
    };

    $scope.remove = function(tournament) {
        if (tournament) {
            tournament.$remove();

            for (var i in $scope.tournaments) {
                if ($scope.tournaments[i] === tournament) {
                    $scope.tournaments.splice(i, 1);
                }
            }
        }
        else {
            $scope.tournament.$remove();
            $location.path('tournaments');
        }
    };

    $scope.update = function() {
        var tournament = $scope.tournament;
        if (!tournament.updated) {
            tournament.updated = [];
        }
        tournament.updated.push(new Date().getTime());

        tournament.$update(function() {
            $location.path('tournaments/' + tournament._id);
        });
    };

    $scope.find = function() {
        Tournaments.query(function(tournaments) {
            $scope.tournaments = tournaments;
        });
    };

    $scope.findOne = function() {
        Tournaments.get({
            tournamentId: $routeParams.tournamentId
        }, function(tournament) {
            $scope.tournament = tournament;
        });
    };

    $scope.addMember = function(ev) {
        if (!$scope.members) {
            $scope.members = [];
        }
        $scope.members.push({name: $scope.newMember});
        $scope.newMember = '';
        angular.element(ev.srcElement).focus();
    };

    $scope.addRule = function() {
        $scope.rules.push($scope.newRule);
        $scope.newRule = {
            best: '',
            of: '',
            percent: ''
        };
        $('#best').focus();
    };

    $scope.removeRule = function(rule) {
        var index = $scope.rules.indexOf(rule);
        $scope.rules.splice(index, 1);
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

.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (e) {
            if(e.which === 13) {
                scope.$apply(function (){
                    scope.$event = e;
                    scope.$eval(attrs.ngEnter);
                });

                e.preventDefault();
            }
        });
    };
});