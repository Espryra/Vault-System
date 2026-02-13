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

    const entities = dimension.getEntities({
      location: block.location,
      maxDistance: 2,
      type: "minecraft:item",
    });

    for (const entity of entities) {
      const item = entity.getComponent(EntityComponentTypes.Item)!.itemStack;

      if (!entity.isValid) {
        continue;
      }
      if (VaultUtils.IsBlacklisted(item.typeId)) {
        continue;
      }
      if (level.limit < item.amount + total) {
        continue;
      }

      entity.kill();

      VaultUtils.AddBlock(player, item.typeId, item.amount);
    }
  }
}
