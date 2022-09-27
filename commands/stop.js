const distube = require('../index').distube;
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop the currently playing song.'),
    
    async run(interaction) {
        
        distube.stop(interaction.member.voice?.channel);
    
		const embed = new MessageEmbed()
			.setColor('#b684e7')
			.setTitle('The bot has stopped playing music!')
			.setTimestamp()
			.setFooter({ text: `Requested by: ${interaction.member.user.tag}`, iconURL: interaction.member.displayAvatarURL() });
		return interaction.followUp({ embeds: [embed] });

    }

}