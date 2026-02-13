import { type Player, type Vector3 } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import VaultConfig from "../../lib/vaults";
import Formatter from "../../utils/formatter";
import ItemInstance from "../../utils/itemBuilder/Item";
import { VaultDatabase } from "./constants";
import VaultSafe from "./menus/safe";
import type { Vault, VaultLevel } from "./types";

export default class VaultUtils {
  private constructor() {}

  public static IsBlacklisted(typeId: string): boolean {
    return VaultConfig.BlacklistedItems.some((entry) => typeId.includes(entry));
  }

  public static IsLocked(safe: Vector3): boolean {
    return VaultSafe.VaultLockCache.some(
      (entry) => entry.x === safe.x && entry.y === safe.y && entry.z === safe.z,
    );
  }
  public static UnlockSafe(safe: Vector3): void {
    const index = VaultSafe.VaultLockCache.findIndex(
      (entry) => entry.x === safe.x && entry.y === safe.y && entry.z === safe.z,
    );

    if (index !== -1) {
      VaultSafe.VaultLockCache.splice(index, 1);
    }
  }

  public static GetTotal(vault: Vault): number {
    return Object.values(vault.items).reduce((a, b) => a + b, 0);
  }
  public static GetLevel(vault: Vault): VaultLevel {
    return VaultConfig.VaultLevels[vault.upgrade_level]!;
  }
  public static GetNextLevel(vault: Vault): VaultLevel | undefined {
    return VaultConfig.VaultLevels[vault.upgrade_level + 1];
  }
  public static GetMaxSize(typeId: string): number {
    const item = new ItemInstance(typeId).Build();

    return item.maxAmount;
  }

  public static async SearchItem(
    player: Player,
  ): Promise<[string, number] | undefined> {
    const vault = VaultDatabase.Get(player.id);

    if (!vault) {
      player.sendError("Could not find your vault!");
      return;
    }

    const items = Object.entries(vault.items);
    const form = await new ModalFormData()
      .title("Search Item")
      .label(`Hello, ${player.name}!\n`)
      .textField(
        "Please enter the name of the item you would like to search for down below.\n",
        "Grass Block",
        {
          tooltip: "To see all results, just leave this blank.",
        },
      )
      .submitButton("Search")
      .show(player);

    if (!form.formValues) {
      return;
    }

    const input = form.formValues[1] as string;
    const filtered = items
      .filter(([typeId]) =>
        Formatter.ReadableTypeId(typeId)
          .toLowerCase()
          .includes(input.toLowerCase()),
      )
      .sort((a, b) => b[1] - a[1]);

    if (filtered.length === 0) {
      player.sendError("No results found with that name!");
      return;
    }

    return this.SearchItemSelection(player, filtered);
  }
  private static async SearchItemSelection(
    player: Player,
    filtered: [string, number][],
  ): Promise<[string, number] | undefined> {
    const form = new ActionFormData()
      .title("Search Results")
      .body(
        `Hello, ${player.name}!\n\nPlease select the item you would like to manage.\n`,
      );

    for (const [typeId, amount] of filtered) {
      form.button(`${Formatter.ReadableTypeId(typeId)}\n[ ${amount} ]`);
    }

    const response = await form.show(player);

    if (response.selection === undefined) {
      return;
    }

    return filtered[response.selection];
  }
  public static async GetWithdrawlAmount(
    player: Player,
    typeId: string,
    amount: number,
  ): Promise<number | undefined> {
    const form = await new ModalFormData()
      .title("Withdrawl Amount")
      .label(
        [
          `Hello, ${player.name}!\n`,
          `You have ${amount} ${Formatter.ReadableTypeId(typeId)} in your vault!\n`,
        ].join("\n"),
      )
      .textField(`How much would you like to withdrawl?\n`, "64", {
        tooltip:
          "§cPlease note, if you enter a number bigger then the space in your inventory, the rest will be dropped on the ground!",
      })
      .show(player);

    if (!form.formValues) {
      return;
    }

    const input = parseInt(form.formValues[1] as string);

    if (isNaN(input) || input <= 0) {
      player.sendError("Please enter a valid number!");
      return;
    }
    if (input > amount) {
      player.sendError("You do not have enough for this withdrawl!");
      return;
    }

    return input;
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

    vault.items[typeId] = (vault.items[typeId] || 0) + amount;
    VaultDatabase.Set(player.id, vault);
  }
}
