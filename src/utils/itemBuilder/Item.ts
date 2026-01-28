import { ItemComponentTypes, ItemLockMode, ItemStack } from "@minecraft/server";
import type EnchantInstance from "./enchant";

export default class ItemInstance {
  private nameTag?: string;
  private damage?: number;
  private keepOnDeath: boolean = false;
  private lore?: string[];
  private lockMode: ItemLockMode = ItemLockMode.none;
  private enchants?: EnchantInstance[];
  private properties?: Record<string, any>;

  public constructor(
    private typeId: string,
    private amount: number = 1,
  ) {}

  public SetTypeId(typeId: string) {
    this.typeId = typeId;

    return this;
  }
  public SetAmount(amount: number) {
    this.amount = amount;

    return this;
  }
  public SetNameTag(nameTag: string) {
    this.nameTag = nameTag;

    return this;
  }
  public SetDamage(damage: number) {
    this.damage = damage;

    return this;
  }
  public SetKeepOnDeath(keepOnDeath: boolean) {
    this.keepOnDeath = keepOnDeath;

    return this;
  }
  public SetLore(lore: string[]) {
    this.lore = lore;

    return this;
  }
  public SetLockMode(lockMode: ItemLockMode) {
    this.lockMode = lockMode;

    return this;
  }
  public SetEnchants(enchants: EnchantInstance[]) {
    this.enchants = enchants;

    return this;
  }
  public SetProperties(properties: Record<string, any>) {
    this.properties = properties;

    return this;
  }

  public GetTypeId() {
    return this.typeId;
  }
  public GetAmount() {
    return this.amount;
  }
  public GetNameTag() {
    return this.nameTag;
  }
  public GetDamage() {
    return this.damage;
  }
  public GetKeepOnDeath() {
    return this.keepOnDeath;
  }
  public GetLore() {
    return this.lore;
  }
  public GetLockMode() {
    return this.lockMode;
  }
  public GetEnchants() {
    return this.enchants;
  }
  public GetProperties() {
    return this.properties;
  }

  public AddEnchant(enchant: EnchantInstance) {
    if (!this.enchants) {
      this.enchants = [];
    }

    this.enchants.push(enchant);

    return this;
  }
  public AddProperty(key: string, value: any) {
    if (!this.properties) {
      this.properties = {};
    }

    this.properties[key] = value;

    return this;
  }

  public Build() {
    const item = new ItemStack(this.typeId, this.amount);
    const durability = item.getComponent(ItemComponentTypes.Durability);
    const enchanting = item.getComponent(ItemComponentTypes.Enchantable);

    item.nameTag = this.nameTag;
    item.lockMode = this.lockMode;
    item.keepOnDeath = this.keepOnDeath;

    if (this.lore) {
      item.setLore(this.lore);
    }
    if (this.damage && durability) {
      durability.damage = this.damage;
    }
    if (this.enchants && enchanting) {
      enchanting.addEnchantments(
        this.enchants.map((enchant) => enchant.Build()),
      );
    }
    if (this.properties) {
      for (const [key, value] of Object.entries(this.properties)) {
        item.setDynamicProperty(key, value);
      }
    }

    return item;
  }
}
