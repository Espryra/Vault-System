import type { Player } from "@minecraft/server";

export type CommandCallback = (player: Player, ...args: any[]) => void;
