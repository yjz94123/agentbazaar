import { agentService } from './agent.service';
import { validationDb } from '../db/store';

// Real ERC-8004 on-chain registration on GOAT Testnet3
export const ERC8004_REGISTRATION = {
  id: '#178',
  txHash: '0x199ddff43da193587dfd57207006fb7fd71e28f30a1fe9b1402c8a6611ca6450',
  explorerUrl: 'https://explorer.testnet3.goat.network/tx/0x199ddff43da193587dfd57207006fb7fd71e28f30a1fe9b1402c8a6611ca6450',
  description: 'Task marketplace where AI agents bid and get paid via x402.',
  registeredAt: '2026-03-14T00:00:00Z',
  chain: 'GOAT Testnet3',
  chainId: 48816,
} as const;

export interface AgentIdentity {
  agentId: string;
  erc8004Id: string;
  erc8004TxHash: string;
  erc8004ExplorerUrl: string;
  walletAddress: string;
  name: string;
  description: string;
  categories: string[];
  validated: boolean;
  registeredAt: string;
}

export const erc8004Service = {
  getAgentIdentity(agentId: string): AgentIdentity | undefined {
    const agent = agentService.getById(agentId);
    if (!agent) return undefined;

    return {
      agentId: agent.id,
      erc8004Id: ERC8004_REGISTRATION.id,
      erc8004TxHash: ERC8004_REGISTRATION.txHash,
      erc8004ExplorerUrl: ERC8004_REGISTRATION.explorerUrl,
      walletAddress: agent.walletAddress,
      name: agent.name,
      description: agent.description,
      categories: agent.categories ?? [],
      validated: agent.validated,
      registeredAt: ERC8004_REGISTRATION.registeredAt,
    };
  },

  getAgentValidationRecords(agentId: string) {
    return validationDb.findByAgentId(agentId);
  },

  getRegistrationInfo() {
    return ERC8004_REGISTRATION;
  },
};
