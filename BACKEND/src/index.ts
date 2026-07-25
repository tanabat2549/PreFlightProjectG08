import express from 'express';
import dotenv from 'dotenv';
import siemseeRouter from './routes/siemseebackend.ts';
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
app.use(express.json());
app.use('/api/siemsee', siemseeRouter);
app.get('/health', (req, res) => {
  res.json({ message: 'Khor Suan Boon Backend is running!' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});