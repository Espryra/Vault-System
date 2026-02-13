import type { VaultLevel } from "../classes/vaults/types";

const VaultConfig = {
  BlacklistedItems: [
    // Wildcards
    "shulker",
    "_sword",
    "_axe",
    "_pickaxe",
    "_shovel",
    "_hoe",
    "_spear",
    "_helmet",
    "_chestplate",
    "_leggings",
    "_boots",
    "bow",
    "trident",
    "book",
    "potion",
    "arrow",
    "_on_a_stick",
    "firework",
    "bundle",

    // Full typeIds
    "minecraft:paper",
    "minecraft:balloon",
    "minecraft:sparkler",
    "minecraft:glow_stick",
    "minecraft:filled_map",
    "minecraft:lodestone_compass",
    "minecraft:brush",
    "minecraft:leather_horse_armor",
    "minecraft:fishing_rod",
    "minecraft:decorated_pot",
    "minecraft:name_tag",
    "minecraft:bee_hive",
    "minecraft:banner",
    "minecraft:bee_nest",
    "minecraft:suspicious_stew",
    "minecraft:axolotl_bucket",
    "minecraft:tropical_fish_bucket",
    "minecraft:ominous_bottle",
    "minecraft:goat_horn",
    "minecraft:shears",
    "minecraft:flint_and_steel",
    "minecraft:mace",
    "minecraft:shield",

    // Full custom typeIds
    "bogie:bogiepack",
    "rts:tool_belt",

    // Custom wildcards
    "yes:",
    "true_tools:",
    "boi:",
  ], // Either full typeIds, or just wildcards.
  VaultNPCTag: "vault",
  VaultPrice: 50,
  VaultLevels: [
    {
      limit: 10000,
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
  VaultSafeTypeId: "minecraft:chest",
};

export default VaultConfig;
