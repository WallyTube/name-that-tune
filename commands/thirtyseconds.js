const SpotifyWebApi = require('spotify-web-api-node');
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const distube = require('../index').distube;

module.exports = {

    data: new SlashCommandBuilder()
        .setName('thirtyseconds')
        .setDescription('Plays 30 seconds of a random song in a playlist.')
        .addStringOption(option =>
            option
                .setName('link')
                .setDescription('Spotify playlist link.')
                .setRequired(true)
        ),
    
    async run(interaction) {
        
	    // Get the name of the song from the command argument, and check if the argument is a proper string.
		const link = interaction.options.getString('link');
		const id = link.substring(link.lastIndexOf("/") + 1, link.indexOf("?"));
		const spotifyApi = new SpotifyWebApi({
			clientId: '7a51717c0f764ac58f63a0feb6eb184a',
			clientSecret: 'bf7e076ce7db48479375a1928afe1e06'
		});

		spotifyApi.clientCredentialsGrant().then(
			async function(data) {
				spotifyApi.setAccessToken(data.body['access_token']);

				// The magic starts here.
				const tracks = [];
				for (var i = 0; i < 10; i++) {

					try {
						const data = await spotifyApi.getPlaylistTracks(id, { offset: i*100, limit: 100, fields: 'items' });
						if (data.body.items.length != 0) {
							for (var x = 0; x < data.body.items.length; x++) {
								tracks.push(`${data.body.items[x].track.name} - ${data.body.items[x].track.artists[0].name}`);
							}
						}
					} catch (err) {
						return interaction.followUp({ content: `Something went wrong with getting spotify playlist tracks! \n \`\`\`${err}\`\`\`` });
					}

				}

				const song = tracks[parseInt((Math.random() * tracks.length), 10)]
				const voiceChannel = interaction.member.voice?.channel;
				if (voiceChannel) {
    
					distube.play(voiceChannel, song, { 
						metadata: {
								i: interaction,
								thirtyseconds: true
							}
					});
			
				} else {
				
					const embed = new MessageEmbed()
						.setColor('#b684e7')
						.setTitle('You must be in a voice channel!')
						.setTimestamp()
						.setFooter({ text: `Requested by: ${interaction.member.user.tag}`, iconURL: interaction.member.displayAvatarURL() });
					return interaction.followUp({ embeds: [embed] });
				
				}



			},
			function(err) {
				console.log('Something went wrong with authentication!', err);
				return interaction.followUp({ content: `Something went wrong with spotify api authentication! \n \`\`\`${err}\`\`\`` });
			}
		);

    }

}