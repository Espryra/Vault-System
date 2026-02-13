import type { Player } from "@minecraft/server";
import VaultUtils from "../utils";
import { VaultDatabase } from "../constants";
import { ActionFormData } from "@minecraft/server-ui";

export default class VaultUpgradeMenu {
  public static async View(player: Player): Promise<void> {
    const vault = VaultDatabase.Get(player.id);

    if (!vault) {
      player.sendError("Could not find your vault!");
      return;
    }

    const nextLevel = VaultUtils.GetNextLevel(vault);

    if (!nextLevel) {
      player.sendError("You are at max vault level!");
      return;
    }

    const form = await new ActionFormData()
      .title("Upgrade Menu")
      .body(
        [
          `Hello, ${player.name}!\n`,
          `Your next vault level upgrade will cost $${nextLevel.cost.toLocaleString()}, with the new limit of ${nextLevel.limit.toLocaleString()}.\n`,
          `Would you like to purchase this upgrade?\n`,
        ].join("\n"),
      )
      .button("Continue\n[ Purchase Upgrade ]")
      .button("Cancel\n[ Close ]")
      .show(player);

    switch (form.selection) {
      case undefined:
      case 1:
        break;
      case 0:
        const vault = VaultDatabase.Get(player.id);

        if (!vault) {
          player.sendError("Could not find your vault!");
          return;
        }

        const balance = player.getBalance();

        if (balance < nextLevel.cost) {
          player.sendError("You do not have enough for this purchase!");
          return;
        }

        player.removeBalance(nextLevel.cost);
        vault.upgrade_level++;
        VaultDatabase.Set(player.id, vault);

        player.sendSuccess("Successfully upgraded your vault!");
        break;
    }
  }
}
