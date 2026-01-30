import type { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import Formatter from "../../../utils/formatter";
import { VaultDatabase } from "../constants";
import VaultUtils from "../utils";
import VaultItemManagementMenu from "./itemManagement";

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
      .button("Manage Item\n[ Search ]")
      .button("List Items\n[ List ]")
      .show(player);

    switch (form.selection) {
      case undefined:
        break;
      case 0:
        VaultItemManagementMenu.MainMenu(player);
        break;
      case 1:
        this.ListItemsMenu(player);
        break;
    }
  }

  public static async ListItemsMenu(player: Player): Promise<void> {
    const vault = VaultDatabase.Get(player.id);

    if (!vault) {
      player.sendError("Could not find your vault!");
      return;
    }

    const items = Object.entries(vault.items).sort((a, b) => b[1] - a[1]);
    const form = await new ActionFormData()
      .title("All Items")
      .body(
        [
          `Hello, ${player.name}!\n`,
          `Here is all of your items stored inside of your vault!\n`,
          items
            .map(
              ([typeId, amount]) =>
                `${Formatter.ReadableTypeId(typeId)}: ${amount}`,
            )
            .join("\n"),
          "\n",
        ].join("\n"),
      )
      .button("Back\n[ Return ]")
      .show(player);

    switch (form.selection) {
      case undefined:
        break;
      case 0:
        this.MainMenu(player);
        break;
    }
  }
}
