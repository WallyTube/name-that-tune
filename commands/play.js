const distube = require('../index').distube;
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song.')
        .addStringOption(option =>
            option
                .setName('song')
                .setDescription('Song name or link.')
                .setRequired(true)
        ),
    
    async run(interaction) {
        
        const song = interaction.options.getString('song')
        const voiceChannel = interaction.member.voice?.channel
    
        if (voiceChannel) {
    
            try {
                distube.play(voiceChannel, song, { metadata: { i: interaction } });
            } catch (error) {
                interaction.followUp({ content: ` \`\`\`${error}\`\`\` ` });
            }
            
    
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