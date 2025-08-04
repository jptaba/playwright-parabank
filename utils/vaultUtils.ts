import vault from 'node-vault';

const vaultClient = vault({
  endpoint: 'http://127.0.0.1:8200',
  token: 'myroot',
}); // Configure as needed

export async function getSecretFromVault(secretPath: string): Promise<string> {
  try {
    const result = await vaultClient.read(secretPath);
    return result.data.value || '';
  } catch (e) {
    console.error('Vault error:', e);
    return '';
  }
}
