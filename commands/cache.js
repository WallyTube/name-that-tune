const data = require('../data');
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const distube = require('../index').distube;
const SpotifyWebApi = require('spotify-web-api-node');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('cache')
        .setDescription('cash $$$')
        .addStringOption(option =>
            option
                .setName('command')
                .setDescription('add / get / play')
                .setRequired(true)
        ).addStringOption(option =>
            option
                .setName('arg1')
                .setDescription('arg1')
                .setRequired(true)
        ).addStringOption(option =>
            option
                .setName('arg2')
                .setDescription('arg2.')
                .setRequired(false)
        ),
    
    async run(interaction) {

		const command = interaction.options.getString('command');
		const arg1 = interaction.options.getString('arg1');
		const arg2 = interaction.options.getString('arg2');

		if (command == 'add') {

			if (arg2 == null) return interaction.followUp({ content: 'Missing field: arg2' });

			const pl = await playlist(arg1, interaction);
			if (pl == null) return interaction.followUp({ content: 'Playlist returned came back null.' });

			data.cachedplaylists[arg2] = pl;

			return interaction.followUp({ content: `successfully cached \`${arg2}\` as playlist with \`${pl.length}\` tracks.` });

		} if (command == 'get') {

			const grab = data.cachedplaylists[arg1];
			const stringed = JSON.stringify(grab);
			if (stringed.length > 1500) return interaction.followUp({ content: `\`${arg1}\` returned: \`${grab.length}\` tracks.` });
			else return interaction.followUp({ content: `\`${arg1}\` returned: \`\`\`${stringed}\`\`\`` });

		} if (command == 'play') {

			const grab = data.cachedplaylists[arg1];
			if (grab == null) return interaction.followUp({ content: `Cannot play cached: \`${grab}\`` });
			
			const song = grab[parseInt((Math.random() * grab.length), 10)]
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

		}

    }

}

async function playlist(link, interaction) {
    return new Promise(async (accept, reject) => {
      const id = link.substring(link.lastIndexOf("/") + 1, link.indexOf("?"));
      const spotifyApi = new SpotifyWebApi({ clientId: '7a51717c0f764ac58f63a0feb6eb184a', clientSecret: 'bf7e076ce7db48479375a1928afe1e06' });
      spotifyApi.clientCredentialsGrant().then(
          async function(data) {
              spotifyApi.setAccessToken(data.body['access_token']);
              const tracks = [];
              for (var i = 0; i < 10; i++) {
                  try {
                      const data = await spotifyApi.getPlaylistTracks(id, { offset: i*100, limit: 100, fields: 'items' });
                      if (data.body.items.length != 0) {
                          for (var x = 0; x < data.body.items.length; x++) {
                              tracks.push(`${data.body.items[x].track.name} - ${data.body.items[x].track.artists[0].name} lyrics`);
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
