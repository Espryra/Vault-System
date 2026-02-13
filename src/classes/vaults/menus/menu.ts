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
      .title("§l§eVault Menu")
      .body(
        [
          `§8====================`,
          `§fHello, §6${player.name}§f!`,
          ``,
          `§7Total Items`,
          `§f${Formatter.CommaNumber(total)} §8/ §c${Formatter.CommaNumber(level.limit)}`,
          ``,
          `§7Choose an option below`,
          `§8====================`,
        ].join("\n"),
      )
      .button("§eManage Item\n§7[ Search ]", "textures/ui/magnifyingGlass")
      .button("§eList Items\n§7[ List ]", "textures/items/book_enchanted")
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
      .title("§l§eAll Items")
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
