import {
  Block,
  BlockComponentTypes,
  EntityComponentTypes,
  ItemStack,
  Player,
  PlayerInteractWithBlockBeforeEvent,
  system,
  world,
  type Vector3,
} from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import VaultConfig from "../../../lib/vaults";
import Formatter from "../../../utils/formatter";
import ItemInstance from "../../../utils/itemBuilder/Item";
import { VaultDatabase } from "../constants";
import VaultUtils from "../utils";

export default class VaultSafe {
  public static readonly VaultLockCache: Vector3[] = [];

  private constructor() {}

  public static async Init(): Promise<void> {
    world.beforeEvents.playerInteractWithBlock.subscribe((event) =>
      VaultSafe.OnInteract(event),
    );
  }

  public static OnInteract(event: PlayerInteractWithBlockBeforeEvent): void {
    const { block, isFirstEvent, player, itemStack } = event;

    if (
      !isFirstEvent ||
      block.typeId !== VaultConfig.VaultSafeTypeId ||
      itemStack ||
      !player.isSneaking ||
      event.cancel
    ) {
      return;
    }

    event.cancel = true;
    const vault = VaultDatabase.Get(player.id);

    if (!vault) {
      player.sendError("You do not own a vault!");
      return;
    }
    if (VaultUtils.IsLocked(block.location)) {
      player.sendError("Vault is already in use!");
      return;
    }

    this.VaultLockCache.push(block.location);

    system.run(() =>
      VaultSafe.MainMenu(player, block).finally(() => {
        VaultUtils.UnlockSafe(block.location);
      }),
    );
  }

  public static async MainMenu(player: Player, block: Block): Promise<void> {
    const container = block.getComponent(
      BlockComponentTypes.Inventory,
    )?.container;

    if (!container) {
      player.sendError(
        "A internal error has occured, please contact an admin!",
      );
      return;
    }

    const form = await new ActionFormData()
      .title("§l§eVault Safe")
      .body(
        [
          `§8====================`,
          `§fHello, §g${player.name}§f!`,
          ``,
          `§7Safe Space`,
          `§f${container.size - container.emptySlotsCount} §8/ §c${container.size}`,
          ``,
          "§7What would you like to do?\n",
          `§8====================`,
        ].join("\n"),
      )
      .button("§eDeposit Items\n§7[ Deposit ]", "textures/ui/icon_import")
      .button(
        "§eWithdraw Items\n§7[ Withdraw ]",
        "textures/items/book_writable",
      )
      .show(player);

    switch (form.selection) {
      case undefined:
        break;
      case 0:
        await VaultSafe.Deposit(player, block);
        break;
      case 1:
        await VaultSafe.WithdrawlMenu(player, block);
        break;
    }
  }

  private static async Deposit(player: Player, block: Block): Promise<void> {
    const vault = VaultDatabase.Get(player.id);

    if (!vault) {
      player.sendError("You do not own a vault!");
      return;
    }

    const container = block.getComponent(
      BlockComponentTypes.Inventory,
    )?.container;

    if (!container) {
      player.sendError(
        "A internal error has occured, please contact an admin!",
      );
      return;
    }

    const items: [number, ItemStack][] = [];
    const level = VaultUtils.GetLevel(vault);

    for (let i = 0; i < container.size; i++) {
      const item = container.getItem(i);

      if (!item) {
        continue;
      }
      if (VaultUtils.IsBlacklisted(item.typeId)) {
        continue;
      }

      items.push([i, item]);
    }

    const total = items.reduce((a, b) => a + b[1].amount, 0);

    if (total + VaultUtils.GetTotal(vault) > level.limit) {
      player.sendError("Your vault is too full for this deposit!");
      return;
    }

    for (const [, item] of items) {
      vault.items[item.typeId] = (vault.items[item.typeId] || 0) + item.amount;
    }

    if (total === 0) {
      player.sendError("You do not have any items to deposit!");
      return;
    }

    for (const [i] of items) {
      container.setItem(i);
    }

    VaultDatabase.Set(player.id, vault);

    player.sendSuccess(`You have withdrawn ${total} items!`);
  }
  private static async WithdrawlMenu(
    player: Player,
    block: Block,
  ): Promise<void> {
    const data = await VaultUtils.SearchItem(player);

    if (data === undefined) {
      return;
    }

    const [typeId, amount] = data;
    const toWithdrawl = await VaultUtils.GetWithdrawlAmount(
      player,
      typeId,
      amount,
    );

    if (toWithdrawl === undefined) {
      return;
    }
    if (!block.isValid) {
      player.sendError("Vault has been destroyed or unloaded!");
      return;
    }

    const container = block.getComponent(
      BlockComponentTypes.Inventory,
    )?.container;

    if (!container) {
      player.sendError(
        "A internal error has occured, please contact an admin!",
      );
      return;
    }
    if (container.emptySlotsCount === 0) {
      player.sendError("Safe is full!");
      return;
    }

    const vault = VaultDatabase.Get(player.id);

    if (!vault) {
      player.sendError("Could not find your vault!");
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

    await VaultSafe.GiveWithdrawl(player, block, stacks, typeId, toWithdrawl);
  }
  private static async GiveWithdrawl(
    player: Player,
    block: Block,
    stacks: ItemStack[],
    typeId: string,
    amount: number,
  ): Promise<void> {
    const blockContainer = block.getComponent(
      BlockComponentTypes.Inventory,
    )?.container;
    const playerContainer = player.getComponent(
      EntityComponentTypes.Inventory,
    )!.container;

    if (!blockContainer) {
      player.sendError(
        "A internal error has occured, please contact an admin!",
      );
      return;
    }

    const toChest = stacks.slice(0, blockContainer.emptySlotsCount);
    const toPlayer = stacks.slice(
      blockContainer.emptySlotsCount,
      playerContainer.emptySlotsCount,
    );
    const toDrop = stacks.slice(
      blockContainer.emptySlotsCount + playerContainer.emptySlotsCount,
    );

    for (const stack of toChest) {
      blockContainer.addItem(stack);
    }
    for (const stack of toPlayer) {
      playerContainer.addItem(stack);
    }
    for (const stack of toDrop) {
      player.dimension.spawnItem(stack, player.location);
    }

    player.sendSuccess(
      `You have withdrawn ${amount} ${Formatter.ReadableTypeId(typeId)}!`,
    );
  }
}
