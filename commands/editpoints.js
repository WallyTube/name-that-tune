const gamedata = require('../data');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('editpoints')
        .setDescription('Edit the points each name that tune player has.')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Player to edit.')
                .setRequired(true)
        )
		.addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Amount of points to give or remove.')
                .setRequired(true)
        ),
    
    async run(interaction) {
        
		const user = interaction.options.getUser('user');
		const amount = interaction.options.getInteger('amount');

        gamedata.userboard[user.tag] != null ? gamedata.userboard[user.tag] += amount : gamedata.userboard[user.tag] = amount;

		const embed = new MessageEmbed()
                .setColor('#b684e7')
                .setTitle(`Set user ${user.tag}\'s points to ${gamedata.userboard[user.tag]}.`)
                .setTimestamp()
                .setFooter({ text: `Requested by: ${interaction.member.user.tag}`, iconURL: interaction.member.displayAvatarURL() });
        return interaction.followUp({ embeds: [embed] });

    }

}