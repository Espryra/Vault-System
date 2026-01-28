import {
  CustomCommandRegistry,
  Player,
  StartupEvent,
  system,
} from "@minecraft/server";
import CommandConfig from "../../lib/commands";
import Command from "./command";

export default class CommandHandler {
  private static commands: Command[] = [];

  private constructor() {}

  public static async Init(): Promise<void> {
    system.beforeEvents.startup.subscribe((event) =>
      CommandHandler.OnStartup(event),
    );
  }

  private static OnStartup(event: StartupEvent): void {
    const { customCommandRegistry } = event;

    this.commands.forEach((command) => {
      CommandHandler.LoadCommand(command, customCommandRegistry);

      command.GetAliases().forEach((alias) => {
        const instance = command;

        instance.SetName(alias);

        CommandHandler.LoadCommand(instance, customCommandRegistry);
      });
    });
  }

  public static RegisterCommand(command: Command): void {
    CommandHandler.commands.push(command);
  }

  private static LoadCommand(
    command: Command,
    registery: CustomCommandRegistry,
  ): void {
    registery.registerCommand(
      {
        name: CommandConfig.Namespace + command.GetName(),
        description: command.GetDescription(),
        permissionLevel: command.GetPermissions(),
        mandatoryParameters: command
          .GetRequiredParameters()
          .map((param) => param.Build()),
        optionalParameters: command
          .GetOptionalParameters()
          .map((param) => param.Build()),
      },
      (origin, ...args: any[]) => {
        const { sourceEntity } = origin;

        if (!(sourceEntity instanceof Player)) {
          return;
        }

        command.GetCallback()(sourceEntity, ...args);
        return undefined;
      },
    );
  }
}
