import { system, type Player } from "@minecraft/server";
import Command from "../../utils/commandHandler/command";
import CommandHandler from "../../utils/commandHandler/handler";
import { VaultDatabase } from "./constants";
import VaultMenu from "./menus/menu";

export default class VaultCommands {
  private constructor() {}

  public static async Init(): Promise<void> {
    CommandHandler.RegisterCommand(
      new Command("vault", VaultCommands.Vault).SetDescription(
        "Open the vault menu.",
      ),
    );
    CommandHandler.RegisterCommand(
      new Command("togglevault", VaultCommands.ToggleVault).SetDescription(
        "Toggle your vault from collecting items.",
      ),
    );
  }

  private static Vault(player: Player): void {
    system.run(() => VaultMenu.MainMenu(player));
  }
  private static ToggleVault(player: Player): void {
    const vault = VaultDatabase.Get(player.id);

    if (!vault) {
      player.sendError("You do not own a vault!");
      return;
    }
    if (vault.enabled) {
      vault.enabled = false;

      player.sendSuccess("Vault has been disabled!");
    } else {
      vault.enabled = true;

      player.sendSuccess("Vault has been enabled!");
    }

    VaultDatabase.Set(player.id, vault);
  }
}
