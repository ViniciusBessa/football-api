import express, { Express } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();

// Security middlewares
import helmet from 'helmet';
import cors from 'cors';
import rateLimiter from 'express-rate-limit';

const FIVE_MINUTES = 5 * 60 * 1000;
const MAX_REQUESTS = 5000;

app.set('trust-proxy', 1);
app.use(helmet());

app.use(
  cors({
    credentials: process.env.NODE_ENV === 'production',
    origin: process.env.CORS_ORIGIN || '*',
  })
);

app.use(
  rateLimiter({
    limit: MAX_REQUESTS,
    windowMs: FIVE_MINUTES,
    message: 'You reached the limit of requests',
  })
);

// Express middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middlewares
import trimInputs from './middlewares/trim-input';
import authMiddleware from './middlewares/authentication';

app.use(trimInputs);
app.use(authMiddleware);

// Routes
import authRouter from './routes/auth';

app.use('/api/v1/auth', authRouter);

// Error handler and page not found middlewares
import notFoundMiddleware from './middlewares/not-found';
import errorHandlerMiddleware from './middlewares/error-handler';

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;
