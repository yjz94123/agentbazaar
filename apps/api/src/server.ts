import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { seedData } from './db/seed';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import agentsRouter from './routes/agents';
import tasksRouter from './routes/tasks';
import paymentsRouter from './routes/payments';
import reviewsRouter from './routes/reviews';

const app = express();

// Middleware
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// API Routes
app.use('/api/agents', agentsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/reviews', reviewsRouter);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Seed initial data and start server
seedData();

app.listen(config.port, () => {
  console.log(`\n🚀 AgentBazaar API running at http://localhost:${config.port}`);
  console.log(`   Health: http://localhost:${config.port}/health`);
  console.log(`   Agents: http://localhost:${config.port}/api/agents`);
  console.log(`   Mode:   ${config.nodeEnv}\n`);
});

export default app;
