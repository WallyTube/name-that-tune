var userboard = {};
var cachedplaylists = {};
var song = null;
var password = null;
var initiated = false;
var played = 3;
var playedmems = [];
var startedchannel = null;

module.exports = {
	userboard: userboard,
	song: song,
	password: password,
	initiated: initiated,
	cachedplaylists: cachedplaylists,
	played: played,
	startedchannel: startedchannel,
	playedmems: playedmems,
}