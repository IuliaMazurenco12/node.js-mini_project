import 'dotenv/config';
import express from 'express';
import { connectToDatabase } from './db/index.js';
import authRouter from './routes/auth.js';
import postRouter from './routes/posts.js';

const app = express();
const PORT = process.env.PORT || 3333;

// Middleware для работы с JSON
app.use(express.json());

// Подключаем маршрутизаторы
app.use('/auth', authRouter);
app.use('/posts', postRouter);

app.get('/', (req, res) => {
  res.send('Express сервер работает!');
});

// Сервер запускается только после успешного подключения к базе
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Сервер запущен: http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Не удалось подключиться к MongoDB:', error.message);
    process.exit(1);
  });