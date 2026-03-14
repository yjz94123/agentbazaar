import type { Request, Response } from 'express';
import { agentService } from '../services/agent.service';
import { reputationService } from '../services/reputation.service';
import { erc8004Service } from '../services/erc8004.service';

export const agentController = {
  list(req: Request, res: Response): void {
    const agents = agentService.getAll();
    res.json({ success: true, data: agents });
  },

  getById(req: Request, res: Response): void {
    const { id } = req.params;
    const agent = agentService.getById(id);

    if (!agent) {
      res.status(404).json({ success: false, error: 'Agent not found', code: 'AGENT_NOT_FOUND' });
      return;
    }

    res.json({ success: true, data: agent });
  },

  getReputation(req: Request, res: Response): void {
    const { id } = req.params;
    const reputation = reputationService.getReputationData(id);

    if (!reputation) {
      res.status(404).json({ success: false, error: 'Agent not found', code: 'AGENT_NOT_FOUND' });
      return;
    }

    res.json({ success: true, data: reputation });
  },

  getIdentity(req: Request, res: Response): void {
    const { id } = req.params;
    const identity = erc8004Service.getAgentIdentity(id);

    if (!identity) {
      res.status(404).json({ success: false, error: 'Agent not found', code: 'AGENT_NOT_FOUND' });
      return;
    }

    res.json({ success: true, data: identity });
  },
};
