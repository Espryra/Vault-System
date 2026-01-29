import type { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { VaultDatabase } from "../constants";
import VaultUtils from "../utils";

export default class VaultMenu {
  private constructor() {}

  public static async MainMenu(player: Player): Promise<void> {
    const vault = VaultDatabase.Get(player.id);

    if (!vault) {
      player.sendError("You do not own a vault!");
      return;
    }

    const total = VaultUtils.GetTotal(vault);
    const level = VaultUtils.GetLevel(vault);
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
