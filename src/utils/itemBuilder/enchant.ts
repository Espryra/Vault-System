import { EnchantmentType, type Enchantment } from "@minecraft/server";

export default class EnchantInstance {
  public constructor(
    private typeId: string,
    private level = 1,
  ) {}

  public SetTypeId(typeId: string) {
    this.typeId = typeId;

    return this;
  }
  public SetLevel(level: number) {
    this.level = level;

    return this;
  }

  public GetTypeId() {
    return this.typeId;
  }
  public GetLevel() {
    return this.level;
  }

  public Build() {
    return {
      level: this.level,
      type: new EnchantmentType(this.typeId),
    } as Enchantment;
  }
}
