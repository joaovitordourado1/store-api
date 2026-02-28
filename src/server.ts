import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import { routes } from './routes/main';

const PORT = process.env.PORT || 4000;

const app = express();

app.use(cors());
app.use(express.static('public'));
app.use('/webhook/stripe', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(routes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
