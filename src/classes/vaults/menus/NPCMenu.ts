import {
  Player,
  system,
  world,
  type PlayerInteractWithEntityBeforeEvent,
} from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import VaultConfig from "../../../lib/vaults";
import Formatter from "../../../utils/formatter";
import { VaultDatabase } from "../constants";
import VaultUpgradeMenu from "./upgradeMenu";

export default class VaultNPCMenu {
  private constructor() {}

  public static async Init(): Promise<void> {
    world.beforeEvents.playerInteractWithEntity.subscribe((event) =>
      VaultNPCMenu.OnInteract(event),
    );
  }

  private static OnInteract(event: PlayerInteractWithEntityBeforeEvent): void {
    const { player, target } = event;

    if (!target.hasTag(VaultConfig.VaultNPCTag)) {
      return;
    }

    event.cancel = true;

    system.run(() => VaultNPCMenu.MainMenu(player));
  }

  private static MainMenu(player: Player): void {
    const vault = VaultDatabase.Get(player.id);

    if (!vault) {
      VaultNPCMenu.CreateMenu(player);
      return;
    }

    VaultUpgradeMenu.View(player);
  }

  private static async CreateMenu(player: Player): Promise<void> {
    const form = await new ActionFormData()
      .title("§l§eCreation Menu")
      .body(
        [
          `§fHello, §g${player.name}§f!\n`,
          `§7It seems you do not own a vault as of right now, would you like to purchase one?\n`,
          `§7The cost of the vault is §a$${Formatter.CommaNumber(VaultConfig.VaultPrice)}\n`,
          `§7Would you like to continue?`,
        ].join("\n"),
      )
      .button(`§eContinue\n§7[ Purchase Vault ]`, "textures/ui/confirm")
      .button(`§eCancel\n§7[ Exit ]`, "textures/ui/cancel")
      .show(player);

    switch (form.selection) {
      case undefined:
      case 1:
        break;
      case 0:
        VaultNPCMenu.PurchaseVault(player);
        break;
    }
  }
  private static async PurchaseVault(player: Player): Promise<void> {
    const balance = player.getBalance();

    if (balance < VaultConfig.VaultPrice) {
      player.sendError("Insufficient funds.");
      return;
    }

    player.removeBalance(VaultConfig.VaultPrice);

    VaultDatabase.Set(player.id, {
      upgrade_level: 0,
      enabled: false,
      items: {},
    });

    player.sendSuccess("You have successfully purchased a vault!");
  }
}
