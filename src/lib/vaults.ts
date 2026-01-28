import type { VaultLevel } from "../classes/vaults/types";

const VaultConfig = {
  BlacklistedItems: [
    "shulker",
    "chest",
    "shelf",
    "frame",
    "minecraft:blast_furnace",
    "minecraft:smoker",
    "minecraft:barrel",
    "minecraft:chiseled_bookshelf",
    "minecraft:dropper",
    "minecraft:hopper",
    "minecraft:jukebox",
    "minecraft:dispenser",
    "minecraft:decorated_pot",
    "minecraft:dragon_egg",
    "minecraft:mob_spawner",
    "minecraft:trial_spawner",
  ], // Either full typeIds, or just wildcards.
  VaultNPCTag: "vault",
  VaultPrice: 50,
  VaultLevels: [
    {
      limit: 2880,
      cost: 0,
    },
    {
      limit: 11520,
      cost: 100,
    },
    {
      limit: 46080,
      cost: 250,
    },
  ] as VaultLevel[],
};

export default VaultConfig;
