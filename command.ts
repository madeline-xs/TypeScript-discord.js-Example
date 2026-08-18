import {
    bold, ApplicationIntegrationType,
    ContainerBuilder, InteractionContextType,
    MessageFlags, SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction, User } from "discord.js";

/*
 * Can be in the command file itself or in a separate
 * "components.js" or "components.ts" file
 */

const DEFAULT_AVATAR_URL = "https://i.imgur.com/qZQe5UV.png"; // Default Discord avatar

const playerDetailsComponent = (
    user: User
) => (
    new ContainerBuilder()
        .addSectionComponents((section) => section
            .setThumbnailAccessory((thumbnail) => thumbnail
                .setDescription("User avatar")
                .setURL(user.avatarURL() ?? DEFAULT_AVATAR_URL))
            .addTextDisplayComponents((text) => text
                .setContent(bold(user.displayName)))
    )
);

/*
 * "user.js" or "user.ts" file (in commands directory)
 */

const data = new SlashCommandBuilder()
    .setName("user")
    .setDescription("Show details about yourself or someone else")
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
    .addUserOption((option) => option
        .setName("username")
        .setDescription("The username of the user")
        .setRequired(false));

const execute = async (interaction: ChatInputCommandInteraction): Promise<void> => {
    const user = interaction.user;
    await interaction.reply({
        components: [
            playerDetailsComponent(user)
        ],
        flags: MessageFlags.IsComponentsV2
    });
}

export const user = {
    data,
    execute
};


/*
 * "index.js" or "index.ts" file (in commands directory)
 */

// import { user } from "./user.js";

export const commands = [user];


/*
 * "interactionCreate.js" or "interactionCreate.ts" file (in events directory)
 */

// import { commands } from "../commands/index.js";

const applicationCommands = new Map<string, any>(commands.map((command) => (
    [command.data.name, command]
)));

const handleChatInputCommandInteraction = async (interaction: ChatInputCommandInteraction) => {
    const command = applicationCommands.get(interaction.commandName);
    if (!command) {
        await interaction.reply( "Command not found");
        return;
    }
    await command.execute(interaction);
}

export async function executeInteractionCreate(interaction: Interaction) {
    if (interaction.isChatInputCommand()) {
        await handleChatInputCommandInteraction(interaction);
    }
}


/*
 * ...in your main file:
 */

// import { executeInteractionCreate } from "./events/interactionCreate.js";

// client.on(Events.InteractionCreate, async (interaction: Interaction) => (
//     await executeInteractionCreate(interaction)
// ));