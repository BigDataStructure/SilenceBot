// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits, SlashCommandBuilder, Routes, REST } = require('discord.js');
const { token, clientId, guildId } = require('./config.json');
const { joinVoiceChannel, getVoiceConnection, entersState, VoiceConnectionStatus } = require('@discordjs/voice');

// Create a new client instance
const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.GuildVoiceStates,
	GatewayIntentBits.GuildModeration,
] });


// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

const rest = new REST({ version: '10' }).setToken(token);

client.on('interactionCreate', async (interaction) => {
	if (interaction.isChatInputCommand()){
		if (interaction.commandName === 'follow'){
			interaction.reply(`kill yourself`);
			const voiceUser = interaction.options.getMember('user');
			const voiceConnection = joinVoiceChannel({
				channelId: voiceUser.voice.channelId,
				guildId: voiceUser.guild.id,
				adapterCreator: voiceUser.guild.voiceAdapterCreator,
				selfDeaf: false,
				selfMute: false,
			});
			try {
				await entersState(voiceConnection, VoiceConnectionStatus.Ready, 20e3); //make this await statement end when interaction.commandname is stop
				voiceConnection.receiver.speaking.on("start", (userId) => {
					if (userId==voiceUser){
						setTimeout(()=>{
							voiceUser.voice.setMute(true);
						}, 100);
					}
					console.log(  `${userId} start`  ); //figure out how to filter out only one user's voice status from the voicemap and not just the whole voice channel
				});
				voiceConnection.receiver.speaking.on("end", (userId) => {
					if (userId==voiceUser){
						setTimeout(()=>{
							voiceUser.voice.setMute(false);
						}, 900);
					}
					console.log(  `${userId} end`  );
				});
				console.log(  "Ready"  );
			  } catch (error) {
				console.warn(error);
			  }
		}
	}
});

async function main(){
	try{
		await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
			body: [
				new SlashCommandBuilder()
					.setName('follow')
					.setDescription('Set the bot to follow someone')
					.addUserOption((option) =>
						option
							.setName('user')
							.setDescription('Who should I follow?')
							.setRequired(true)	
					)
					
			],
		})
	}
	catch (error) {console.error(error)};
}
// Log in to Discord with your client's token
client.login(token);
main();