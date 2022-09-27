const glob = require('glob');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { DisTube } = require('distube');
const { MessageEmbed } = require('discord.js');
const gamedata = require('./data');

const Discord = require('discord.js')
const client = new Discord.Client({
    intents: [
        'GUILDS',
        'GUILD_MEMBERS',
        'GUILD_MESSAGES',
        'GUILD_VOICE_STATES'
    ]
})

	const distube = new DisTube(client, {
		searchSongs: 5,
		searchCooldown: 30,
		emptyCooldown: 10,
		leaveOnEmpty: true,
		leaveOnFinish: false,
		leaveOnStop: false,
	});

require('dotenv').config()

client.commands = new Discord.Collection()


const GUILDID = process.env.GUILDID
const CLIENTID = process.env.CLIENTID

client.once('ready', async () => {
    glob('./commands/**/*.js', async (error, files) => {

        if (error) throw new Error('Error occured during retrieval of command files.\n\n ', error)
        
        for (const file of files) {
            const cmd = require(file)
            client.commands.set(cmd.data.name, cmd)
        }
        
        const rest = new REST({ 
            version: '10' 
        }).setToken(process.env.TOKEN);

        const commands = Array.from(client.commands.values())
            .map((cmd) => cmd.data.toJSON())

        commands.forEach(c => console.debug(c.name));
        
        console.log('Refreshing application (/) commands.'); 
        await rest.put(Routes.applicationGuildCommands(CLIENTID, GUILDID), { 
            body: commands 
        }).catch((error) => {
            return console.error('Failed to refresh application (/) commands', error)
        })
        console.info('Successfully reloaded application (/) commands.');
    })
})



client.on('interactionCreate', async (interaction) => {

    if (!interaction.isCommand()) return

    const command = client.commands.get(interaction.commandName)

    if (!command) return

    try {
        await interaction.deferReply()
        await command.run(interaction)
    } catch (error) {
        console.error(error)
        await interaction.followUp({
            content: 'Failed to execute command. Please report this to the Administrators.',
            ephemeral: true
        })
    }

})

client.on('messageCreate', async message => {

    var m = message.content;
    m = m.toLowerCase();
    m = m.replace(',', '')
    m = m.replace('!', '')
    m = m.replace('\'', '')

    if (gamedata.initiated && m == gamedata.password && gamedata.played > 0 && !gamedata.playedmems.includes(message.member.user.tag)) {

        message.delete();

        embed = new MessageEmbed()
            .setColor('#b684e7')
            .setTitle(`${message.member.user.username} guessed the song! (+${gamedata.played} Points)`);
        //message.reply({ embeds: [embed] })
        gamedata.startedchannel.send({ embeds: [embed] });

        if (gamedata.userboard[message.member.user.tag] == null) gamedata.userboard[message.member.user.tag] = 0;
        gamedata.userboard[message.member.user.tag] += gamedata.played;
        gamedata.played -= 1;
        gamedata.playedmems.push(message.member.user.tag);

    }

})

distube
	.on('playSong', async (queue, song) => {

        const interaction = song.metadata.i;
        var embed;

        if (song.metadata.game) {

            distube.seek(queue, parseInt((Math.random() * (song.duration - 30)), 10));

            const p = song.metadata.p;
            const voice = song.metadata.voice;

            setTimeout(function(){

                if (queue.playing) {

                    if (gamedata.played == 3 && gamedata.startedchannel != null) {

                        embed = new MessageEmbed()
                            .setColor('#b684e7')
                            .setTitle(`Nobody guessed the song in time!`)
                            .setDescription(`Searched song: \`${gamedata.song}\`\nResult song: \`${song.name}\`\nCorrect answer: \`${gamedata.password}\``)
                            .setThumbnail(song.thumbnail)
                            .setTimestamp();
                        
                        gamedata.startedchannel.send({ embeds: [embed] });
                        gamedata.played = 0;

                    }

                    var sorted = DictUtils.sort(gamedata.userboard, SortFunctions.byValueDescending);
                    var arrsort = Object.keys(sorted);

                    var d = [
                        `:first_place: ${arrsort[0] != null ? arrsort[0] : 'Empty'} - \`(${arrsort[0] != null ? sorted[arrsort[0]] : '0'} Points)\``,
                        `:second_place: ${arrsort[1] != null ? arrsort[1] : 'Empty'} - \`(${arrsort[1] != null ? sorted[arrsort[1]] : '0'} Points)\``,
                        `:third_place: ${arrsort[2] != null ? arrsort[2] : 'Empty'} - \`(${arrsort[2] != null ? sorted[arrsort[2]] : '0'} Points)\``,
                    ]

                    board = new MessageEmbed()
                        .setColor('#b684e7')
                        .setTitle(`:trophy: Leaderboard`)
                        .setDescription(d.join('\n'))
                        .setTimestamp();
                    
                    gamedata.startedchannel.send({ embeds: [board] });

                    distube.stop(queue);

                }

            }, 30 * 1000);
            setTimeout(function(){

                const song = Object.keys(p)[parseInt((Math.random() * Object.keys(p).length), 10)];

                var pass = p[song];
                pass = pass.replace(/ *\([^)]*\) */g, "").toLowerCase();
                pass = pass.replace(/[,!\']/g, ''); 
                console.log(pass);

                gamedata.played = 3;
                gamedata.song = song;
                gamedata.password = pass;
                gamedata.playedmems = [];

                distube.play(voice, song, { 
                    metadata: {
                        game: true,
                        p: p,
                        voice: voice
                    }
                });
            
            }, 35 * 1000);


        } else {

            if (song.metadata.thirtyseconds) {

                distube.seek(queue, parseInt((Math.random() * (song.duration - 30)), 10));
                setTimeout(function(){ distube.stop(queue) }, 30 * 1000);
    
                embed = new MessageEmbed()
                    .setColor('#b684e7')
                    .setTitle(`:headphones:  Playing 30 seconds of a random song...`)
                    .setTimestamp()
                    .setFooter({ text: `Requested by: ${interaction.member.user.tag}`, iconURL: interaction.member.displayAvatarURL() });
    
            } else {
    
                embed = new MessageEmbed()
                    .setColor('#b684e7')
                    .setTitle(`:headphones:  Now Playing...`)
                    .setDescription(`${song.name}`)
                    .setThumbnail(song.thumbnail)
                    .setTimestamp()
                    .setFooter({ text: `Requested by: ${interaction.member.user.tag}`, iconURL: interaction.member.displayAvatarURL() });
    
            }


            interaction.followUp({ embeds: [embed] });

        }

	})

client.login(process.env.TOKEN)

module.exports = {
    distube: distube
}

class DictUtils {
    static entries(dictionary) {

        try {

            //ECMAScript 2017 and higher, better performance if support
            return Object.entries(dictionary);

        } catch (error) {

            //ECMAScript 5 and higher, full compatible but lower performance
            return Object.keys(dictionary).map(function(key) {
                return [key, dictionary[key]];
            });
        }

    }
    
    static sort(dictionary, sort_function) {
        return DictUtils.entries(dictionary)
            .sort(sort_function)
            .reduce((sorted, kv)=>{
                sorted[kv[0]] = kv[1]; 
                return sorted;
            }, {});
    }

}

class SortFunctions {
    static compare(o0, o1) {
        //TODO compelte for not-number values
        return o0 - o1;
    }
    static byValueDescending(kv0, kv1) {
        return SortFunctions.compare(kv1[1], kv0[1]);
    }
    static byValueAscending(kv0, kv1) {
        return SortFunctions.compare(kv0[1], kv1[1]);
    }

}