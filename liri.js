var keys = require("./keys.js");
var Twitter = require("twitter");
var Spotify = require("node-spotify-api");
var request = require("request");
var fs = require("fs");
var moment = require("moment");
var inquirer = require("inquirer");

var twitterKeys = keys.twitter;
var spotifyKeys = keys.spotify;
var client = new Twitter(twitterKeys);
var spotify = new Spotify(spotifyKeys);

var command = "";
var value = "";

function initialPrompt() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "Welcome to Liri. What do you want to do?",
        choices: [
          "my-tweets",
          "spotify-this-song",
          "movie-this",
          "do-what-it-says",
          "exit"
        ],
        name: "action"
      }
    ])
    .then(function(user) {
      command = user.action;
      if (command === "my-tweets") {
        myTweets();
      }

      if (command === "spotify-this-song") {
        inquirer
          .prompt([
            {
              type: "input",
              message: "Which song would you like me to search on Spotify?",
              name: "song"
            }
          ])
          .then(function(user) {
            value = user.song;
            spotifyThisSong(value);
          });
      }

      if (command === "movie-this") {
        inquirer
          .prompt([
            {
              type: "input",
              message: "Which movie would you like me to search for?",
              name: "movie"
            }
          ])
          .then(function(user) {
            movieThis(user.movie);
          });
      }

      if (command === "do-what-it-says") {
        doWhatItSays();
      }

      if (command === "exit") {
        process.exit(0);
      }
    });
}

initialPrompt();

function myTweets() {
  client.get("search/tweets", { q: "bharloe", count: 1 }, function(
    error,
    tweets,
    response
  ) {
    if (error) {
      console.log("something went wrong with the command");
    }

    for (var i = 0; i < tweets.statuses.length; i++) {
      if (tweets.statuses[i]) {
        console.log(
          moment(Date.parse(tweets.statuses[i].created_at)).format("llll") +
            " - " +
            tweets.statuses[i].user.screen_name +
            " posted: '" +
            tweets.statuses[i].text +
            "'"
        );
      }
    }
    console.log();
    initialPrompt();
  });
}

function spotifyThisSong(value) {
  if (value === "") {
    spotify.search(
      { type: "track", query: "The Sign Ace of Base", limit: 1 },
      function(err, data) {
        if (err) {
          return console.log("Error occurred: " + err);
        }

        console.log();
        console.log("You didn't search anything.");
        console.log();
        console.log("Artist: " + data.tracks.items[0].artists[0].name);
        console.log("Song: " + data.tracks.items[0].name);
        console.log("Preview: " + data.tracks.items[0].preview_url);
        console.log(
          "Track " +
            data.tracks.items[0].track_number +
            " on the Album: " +
            data.tracks.items[0].album.name
        );
        console.log();

        initialPrompt();
      }
    );
  } else {
    spotify.search({ type: "track", query: value, limit: 1 }, function(
      err,
      data
    ) {
      if (err) {
        return console.log("Error occurred: " + err);
      }

      console.log();
      console.log("Artist: " + data.tracks.items[0].artists[0].name);
      console.log("Song: " + data.tracks.items[0].name);
      if (data.tracks.items[0].preview_url === null) {
        console.log("No Preview Link Available");
      } else {
        console.log("Preview: " + data.tracks.items[0].preview_url);
      }
      console.log(
        "Track " +
          data.tracks.items[0].track_number +
          " on the Album: " +
          data.tracks.items[0].album.name
      );
      console.log();

      initialPrompt();
    });
  }
}

function movieThis(value) {

  if (value === "") {
    var queryUrl =
      "http://www.omdbapi.com/?t=Mr Nobody&y=&plot=short&apikey=trilogy";
    console.log();
    console.log(
      "You didn't search for anything. Here is the Information for the movie 'Mr. Nobody':"
    );
  } else {
    var queryUrl =
      "http://www.omdbapi.com/?t=" + value + "&y=&plot=short&apikey=trilogy";
  }

  request(queryUrl, function(err, response, body) {
    if (err) {
      return console.log("Error occurred: " + err);
    } else if (!err && response.statusCode === 200) {
      console.log();
      console.log("Title of the movie: " + JSON.parse(body).Title);
      console.log(
        "Year the movie came out: " +
          moment(Date.parse(JSON.parse(body).Released)).format("ll")
      );
      console.log("IMDB Rating of the movie: " + JSON.parse(body).Ratings[0].Value);
      console.log(
        "Rotten Tomatoes Rating of the movie: " + JSON.parse(body).Ratings[1].Value
      );
      console.log("Country where the movie was produced: " + JSON.parse(body).Country);
      console.log("Language of the movie: " + JSON.parse(body).Language);
      console.log("Plot of the movie: " + JSON.parse(body).Plot);
      console.log("Actors in the movie: " + JSON.parse(body).Actors);
      console.log();
    }
    initialPrompt();
  });
}

function doWhatItSays() {
  fs.readFile("random.txt", "utf8", function(err, data) {
    if (err) {
      return console.log(err);
    }

    var dataArray = data.split(",");
    command = dataArray[0];
    value = dataArray[1];

    if (command === "my-tweets") {
      myTweets();
    }

    if (command === "spotify-this-song") {
      spotifyThisSong(value);
    }

    if (command === "movie-this") {
      movieThis(value);
    }
  });
}
