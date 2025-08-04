"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecretFromVault = getSecretFromVault;
const node_vault_1 = __importDefault(require("node-vault"));
const vaultClient = (0, node_vault_1.default)({
    endpoint: 'http://127.0.0.1:8200',
    token: 'myroot',
}); // Configure as needed
async function getSecretFromVault(secretPath) {
    try {
        const result = await vaultClient.read(secretPath);
        return result.data.value || '';
    }
    catch (e) {
        console.error('Vault error:', e);
        return '';
    }
}
