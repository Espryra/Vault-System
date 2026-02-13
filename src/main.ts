import VaultBreaking from "./classes/vaults/breaking";
import VaultCommands from "./classes/vaults/commands";
import VaultNPCMenu from "./classes/vaults/menus/NPCMenu";
import VaultSafe from "./classes/vaults/menus/safe";
import "./protos/loader";
import CommandHandler from "./utils/commandHandler/handler";

CommandHandler.Init();

// Vault System
VaultCommands.Init();
VaultNPCMenu.Init();
VaultBreaking.Init();
VaultSafe.Init();

// system.run(() => VaultDatabase.Clear());
