import express from 'express';

const app = express();
app.use(express.json());

app.get('/api/test', (req, res) => {
  res.json({ message: 'API working!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;