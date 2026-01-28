import type {
  CustomCommandParameter,
  CustomCommandParamType,
} from "@minecraft/server";

export default class CommandParameter {
  public constructor(
    private name: string,
    private type: CustomCommandParamType,
    private required: boolean = false,
  ) {}

  public SetName(name: string) {
    this.name = name;

    return this;
  }
  public SetType(type: CustomCommandParamType) {
    this.type = type;

    return this;
  }
  public SetRequired(required: boolean) {
    this.required = required;

    return this;
  }

  public GetName() {
    return this.name;
  }
  public GetType() {
    return this.type;
  }
  public GetRequired() {
    return this.required;
  }

  public Build() {
    return {
      name: this.name,
      type: this.type,
    } as CustomCommandParameter;
  }
}
