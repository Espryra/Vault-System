import { EntityComponentTypes, Player, system, world } from "@minecraft/server";
import GeneralConfig from "../lib/general";

declare module "@minecraft/server" {
  interface Player {
    sendError(message: string): void;
    sendSuccess(message: string): void;

    addItem(itemStack: ItemStack): void;

    getCurrencyObjective(): ScoreboardObjective;
    getBalance(): number;
    SetBalance(amount: number): void;
    addBalance(amount: number): void;
    removeBalance(amount: number): void;
  }
}

Player.prototype.sendError = function (message) {
  this.sendMessage(`§c${message}`);
  system.run(() => this.playSound("note.bass"));
};
Player.prototype.sendSuccess = function (message) {
  this.sendMessage(`§a${message}`);
  system.run(() => this.playSound("note.pling"));
};

Player.prototype.addItem = function (item) {
  const container = this.getComponent(
    EntityComponentTypes.Inventory,
  )!.container;

  container.addItem(item);
};

Player.prototype.getCurrencyObjective = function () {
  return (
    world.scoreboard.getObjective(GeneralConfig.CurrencyObjective) ??
    world.scoreboard.addObjective(
      GeneralConfig.CurrencyObjective,
      GeneralConfig.CurrencyObjective,
    )
  );
};
Player.prototype.getBalance = function () {
  const objective = this.getCurrencyObjective();

  if (!this.scoreboardIdentity) {
    return 0;
  }

  return objective.getScore(this) ?? 0;
};
Player.prototype.SetBalance = function (amount) {
  const objective = this.getCurrencyObjective();

  objective.setScore(this, amount);
};
Player.prototype.addBalance = function (amount) {
  const score = this.getBalance() + amount;

  this.SetBalance(score);
};
Player.prototype.removeBalance = function (amount) {
  const score = this.getBalance() - amount;

  this.SetBalance(score);
};
