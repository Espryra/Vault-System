import Database from "../../utils/database/database";
import { type Vault } from "./types";

export const VaultDatabase = new Database<Vault>("vaults");
