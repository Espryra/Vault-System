import type { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import VaultConfig from "../../../lib/vaults";
import { VaultDatabase } from "../constants";

export default class VaultMenu {
  private constructor() {}

  public static async MainMenu(player: Player): Promise<void> {
    const vault = VaultDatabase.Get(player.id);

    if (!vault) {
      player.sendError("You do not own a vault!");
      return;
    }

    const total = Object.values(vault.items).reduce((a, b) => a + b, 0);
    const level = VaultConfig.VaultLevels[vault.upgrade_level]!;
    const form = await new ActionFormData()
      .title("Vault Menu")
      .body(
        [
          `Hello, ${player.name}!\n`,
          `Total Items: ${total}/${level.limit}\n`,
          `What would you like to do?\n`,
        ].join("\n"),
      )
      .show(player);
  }
}
