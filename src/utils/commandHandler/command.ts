import { CommandPermissionLevel } from "@minecraft/server";
import type CommandParameter from "./parameter";
import type { CommandCallback } from "./types";

export default class Command {
  private description: string = "";
  private permissions: CommandPermissionLevel = CommandPermissionLevel.Any;
  private aliases: string[] = [];
  private parameters: CommandParameter[] = [];

  public constructor(
    private name: string,
    private callback: CommandCallback,
  ) {}

  public SetName(name: string) {
    this.name = name;

    return this;
  }
  public SetCallback(callback: CommandCallback) {
    this.callback = callback;

    return this;
  }
  public SetDescription(description: string) {
    this.description = description;

    return this;
  }
  public SetPermissions(permissions: CommandPermissionLevel) {
    this.permissions = permissions;

    return this;
  }
  public SetAliases(aliases: string[]) {
    this.aliases = aliases;

    return this;
  }
  public SetParameters(parameters: CommandParameter[]) {
    this.parameters = parameters;

    return this;
  }

  public GetName() {
    return this.name;
  }
  public GetCallback() {
    return this.callback;
  }
  public GetDescription() {
    return this.description;
  }
  public GetPermissions() {
    return this.permissions;
  }
  public GetAliases() {
    return this.aliases;
  }
  public GetParameters() {
    return this.parameters;
  }
  public GetRequiredParameters() {
    return this.parameters.filter((param) => param.GetRequired());
  }
  public GetOptionalParameters() {
    return this.parameters.filter((param) => !param.GetRequired());
  }

  public AddAlias(alias: string) {
    this.aliases.push(alias);

    return this;
  }
  public AddParameter(parameter: CommandParameter) {
    this.parameters.push(parameter);

    return this;
  }
}
