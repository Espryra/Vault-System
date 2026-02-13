export default class Formatter {
  private constructor() {}

  public static ReadableTypeId(typeId: string): string {
    const chunk = typeId.split(":")[1];

    if (!chunk) {
      return typeId;
    }

    return chunk
      .split("_")
      .map((word) => word[0]!.toUpperCase() + word.slice(1))
      .join(" ");
  }
  public static CommaNumber(number: number): string {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}
