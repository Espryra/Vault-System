import { type Player } from "@minecraft/server";
import VaultConfig from "../../lib/vaults";
import ItemInstance from "../../utils/itemBuilder/Item";
import { VaultDatabase } from "./constants";
import type { Vault, VaultLevel } from "./types";

export default class VaultUtils {
  private constructor() {}

  public static IsBlacklisted(typeId: string): boolean {
    return VaultConfig.BlacklistedItems.some((entry) => typeId.includes(entry));
  }

  public static GetTotal(vault: Vault): number {
    return Object.values(vault.items).reduce((a, b) => a + b, 0);
  }
  public static GetLevel(vault: Vault): VaultLevel {
    return VaultConfig.VaultLevels[vault.upgrade_level]!;
  }
  public static GetMaxSize(typeId: string): number {
    const item = new ItemInstance(typeId).Build();

    return item.maxAmount;
  }

  public static AddBlock(
    player: Player,
    typeId: string,
    amount: number = 1,
  ): void {
    const vault = VaultDatabase.Get(player.id);

    if (!vault) {
      return;
    }

    vault.items[typeId] = (vault.items[typeId] || 0) + 1;
    VaultDatabase.Set(player.id, vault);
  }
}
