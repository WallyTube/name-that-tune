const distube = require('../index').distube;
const gamedata = require('../data');
const { SlashCommandBuilder } = require('@discordjs/builders');
const SpotifyWebApi = require('spotify-web-api-node');
const { MessageEmbed } = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('startgame')
        .setDescription('Start a new name that tune game.')
		.addStringOption(option =>
            option
                .setName('playlist')
                .setDescription('Spotify playlist link.')
                .setRequired(true)
        ),
    
    async run(interaction) {

		const voiceChannel = interaction.member.voice?.channel
		if (!voiceChannel) {
			const errorEmbed = new MessageEmbed()
                .setColor('#b684e7')
                .setTitle('You must be in a voice channel!')
                .setTimestamp()
                .setFooter({ text: `Requested by: ${interaction.member.user.tag}`, iconURL: interaction.member.displayAvatarURL() });
			return interaction.followUp({ embeds: [errorEmbed] });
		}

		const pl = await playlist(interaction.options.getString('playlist'), interaction);
		if (pl == null || pl.length == 0) {
			const errorEmbed = new MessageEmbed()
                .setColor('#b684e7')
                .setTitle('The link you gave was invalid!')
                .setTimestamp()
                .setFooter({ text: `Requested by: ${interaction.member.user.tag}`, iconURL: interaction.member.displayAvatarURL() });
			return interaction.followUp({ embeds: [errorEmbed] });
		}

		gamedata.cachedplaylists['game'] = pl;
		gamedata.userboard = {};
		gamedata.song = null;
		gamedata.password = null;
		gamedata.initiated = true;
        gamedata.startedchannel = interaction.channel;

		const embed = new MessageEmbed()
			.setColor('#b684e7')
			.setTitle('A new game has been started...')
			.setDescription(`The first song will start in **10 seconds.**\nJoin the voice channel!`)
			.setTimestamp()
			.setFooter({ text: `Requested by: ${interaction.member.user.tag}`, iconURL: interaction.member.displayAvatarURL() });

		interaction.followUp({ embeds: [embed] });

		setTimeout(function() {
        
            const song = Object.keys(pl)[parseInt((Math.random() * Object.keys(pl).length), 10)];

            var pass = pl[song];
            pass = pass.replace(/ *\([^)]*\) */g, "").toLowerCase();
            pass = pass.replace(/[,!']/g, ''); 
            console.log(pass);

            gamedata.password = pass;
            gamedata.song = song;

			distube.play(voiceChannel, song, { 
                metadata: {
                    game: true,
                    voice: voiceChannel,
                    p: pl
                }
            });

		}, 10 * 1000)

    }

}

async function playlist(link, interaction) {
    return new Promise(async (accept, reject) => {
      const id = link.substring(link.lastIndexOf("/") + 1, link.indexOf("?"));
      const spotifyApi = new SpotifyWebApi({ clientId: '7a51717c0f764ac58f63a0feb6eb184a', clientSecret: 'bf7e076ce7db48479375a1928afe1e06' });
      spotifyApi.clientCredentialsGrant().then(
          async function(data) {
              spotifyApi.setAccessToken(data.body['access_token']);
              const tracks = {};
              for (var i = 0; i < 10; i++) {
                  try {
                      const data = await spotifyApi.getPlaylistTracks(id, { offset: i*100, limit: 100, fields: 'items' });
                      if (data.body.items.length != 0) {
                          for (var x = 0; x < data.body.items.length; x++) {
                            	tracks[`${data.body.items[x].track.name} - ${data.body.items[x].track.artists[0].name} lyrics`] = data.body.items[x].track.name;
                          }
                      }
                  } catch (e2) {
                      interaction.followUp({ content: `Something went wrong with getting spotify playlist tracks! \n \`\`\`${e2}\`\`\`` });
					  reject(e2);
                  }
              }
              accept(tracks);
          },
          function(e1) {
              interaction.followUp({ content: `Something went wrong with spotify api authentication! \n \`\`\`${e1}\`\`\`` });
              reject(e1);
          }
      );
  });
}