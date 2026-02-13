import {
  EntityComponentTypes,
  ItemStack,
  type Player,
} from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import Formatter from "../../../utils/formatter";
import ItemInstance from "../../../utils/itemBuilder/Item";
import { VaultDatabase } from "../constants";
import VaultUtils from "../utils";

export default class VaultItemManagementMenu {
  private constructor() {}

  public static async MainMenu(player: Player): Promise<void> {
    const data = await VaultUtils.SearchItem(player);

    if (!data) {
      return;
    }

    const [typeId, amount] = data;
    const readable = Formatter.ReadableTypeId(typeId);
    const form = await new ActionFormData()
      .title("§l§e" + readable)
      .body(
        [
          `§fHello, §g${player.name}§f!\n`,
          `§7You have §g${Formatter.CommaNumber(amount)} §e${readable} §7inside of your vault!\n`,
          `§7What would you like to do with this item?\n`,
        ].join("\n"),
      )
      .button(
        "§eWithdrawl\n§7[ Withdraw Items ]",
        "textures/items/book_writable",
      )
      .show(player);

    switch (form.selection) {
      case undefined:
        break;
      case 0:
        this.WithdrawlMenu(player, typeId);
        break;
    }
  }
  public static async WithdrawlMenu(
    player: Player,
    typeId: string,
  ): Promise<void> {
    const vault = VaultDatabase.Get(player.id);

    if (!vault) {
      player.sendError("Could not find your vault!");
      return;
    }

    const amount = vault.items[typeId];

    if (amount === undefined) {
      player.sendError("Could not find that item in your vault!");
      return;
    }

    const toWithdrawl = await VaultUtils.GetWithdrawlAmount(
      player,
      typeId,
      amount,
    );

    if (toWithdrawl === undefined) {
      return;
    }

    vault.items[typeId] = amount - toWithdrawl;

    if (vault.items[typeId] <= 0) {
      delete vault.items[typeId];
    }

    VaultDatabase.Set(player.id, vault);

    const stacks: ItemStack[] = [];
    const maxSize = VaultUtils.GetMaxSize(typeId);
    let remaining = toWithdrawl;

    while (remaining >= maxSize) {
      const item = new ItemInstance(typeId, maxSize);

      stacks.push(item.Build());

      remaining -= maxSize;
    }

    if (remaining > 0) {
      const item = new ItemInstance(typeId, remaining);

      stacks.push(item.Build());
    }

    this.GiveWithdrawl(player, stacks, typeId, toWithdrawl);
  }

  private static async GiveWithdrawl(
    player: Player,
    stacks: ItemStack[],
    typeId: string,
    amount: number,
  ): Promise<void> {
    const container = player.getComponent(
      EntityComponentTypes.Inventory,
    )!.container;
    const toGive = stacks.slice(0, container.emptySlotsCount);
    const toDrop = stacks.slice(container.emptySlotsCount);

    for (const stack of toGive) {
      container.addItem(stack);
    }
    for (const stack of toDrop) {
      player.dimension.spawnItem(stack, player.location);
    }

    player.sendSuccess(
      `You have withdrawn ${amount} ${Formatter.ReadableTypeId(typeId)}!`,
    );
  }
}
