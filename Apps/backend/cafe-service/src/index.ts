import express from 'express';
import helmet from 'helmet';
import { environment } from './environment';
import { storeRouter } from './routes/store.routes';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

// Routes
app.use('/api/v1/store', storeRouter);

// Serve
app.listen(environment.port, () => {
    console.log(`Cafe Service is running on port ${environment.port}`);
});
