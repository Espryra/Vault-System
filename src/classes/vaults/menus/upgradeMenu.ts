import type { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import Formatter from "../../../utils/formatter";
import { VaultDatabase } from "../constants";
import VaultUtils from "../utils";

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
      .title("§l§eUpgrade Menu")
      .body(
        [
          `§fHello, §g${player.name}§f!\n`,
          `§7Your next vault level upgrade will cost §a$${Formatter.CommaNumber(nextLevel.cost)}§7, with the new limit of §g${Formatter.CommaNumber(nextLevel.limit)}§7.\n`,
          `§7Would you like to purchase this upgrade?\n`,
        ].join("\n"),
      )
      .button("§eContinue\n§7[ Purchase Upgrade ]", "textures/ui/confirm")
      .button("§eCancel\n§7[ Close ]", "textures/ui/cancel")
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
