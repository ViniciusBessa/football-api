import express, { Express } from 'express';

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
    credentials: Bun.env.NODE_ENV === 'production',
    origin: Bun.env.CORS_ORIGIN || '*',
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
import competitionRouter from './routes/competitions';
import countryRouter from './routes/countries';
import matchRouter from './routes/matches';
import playerRouter from './routes/players';
import positionRouter from './routes/positions';
import seasonRouter from './routes/seasons';
import teamRouter from './routes/teams';
import transferRouter from './routes/transfers';
import trophyRouter from './routes/trophies';
import userRouter from './routes/users';

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/competitions', competitionRouter);
app.use('/api/v1/countries', countryRouter);
app.use('/api/v1/matches', matchRouter);
app.use('/api/v1/players', playerRouter);
app.use('/api/v1/positions', positionRouter);
app.use('/api/v1/seasons', seasonRouter);
app.use('/api/v1/teams', teamRouter);
app.use('/api/v1/transfers', transferRouter);
app.use('/api/v1/trophies', trophyRouter);
app.use('/api/v1/users', userRouter);

// Error handler and page not found middlewares
import notFoundMiddleware from './middlewares/not-found';
import errorHandlerMiddleware from './middlewares/error-handler';

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;
