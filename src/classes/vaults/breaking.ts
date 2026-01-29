import {
  EntityComponentTypes,
  PlayerBreakBlockAfterEvent,
  world,
} from "@minecraft/server";
import { VaultDatabase } from "./constants";
import VaultUtils from "./utils";

export default class VaultBreaking {
  private constructor() {}

  public static async Init(): Promise<void> {
    world.afterEvents.playerBreakBlock.subscribe((event) =>
      VaultBreaking.OnBreak(event),
    );
  }

  public static OnBreak(event: PlayerBreakBlockAfterEvent): void {
    const { player, dimension, block } = event;

    const vault = VaultDatabase.Get(player.id);

    if (!vault) {
      return;
    }
    if (!vault.enabled) {
      return;
    }

    const total = VaultUtils.GetTotal(vault);
    const level = VaultUtils.GetLevel(vault);

    if (total >= level.limit) {
      return;
    }

    const entity = dimension
      .getEntities({ location: block.location, maxDistance: 2, closest: 1 })
      .find((entity) => entity.typeId === "minecraft:item");

    if (!entity) {
      return;
    }

    const item = entity.getComponent(EntityComponentTypes.Item)!.itemStack;

    if (!entity.isValid) {
      return;
    }

    entity.kill();

    if (VaultUtils.IsBlacklisted(item.typeId)) {
      return;
    }

    VaultUtils.AddBlock(player, item.typeId, item.amount);
  }
}
