import express from 'express';
import { getDb } from '../db/index.js';
import authMiddleware from '../middleware/authMiddleware.js';

// Создаём объект роутер
const router = express.Router();

//Создание поста (только для авторизованных) 
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body || {};

    // 1. Проверяем, что поля переданы
    if (!title || !content) {
      return res.status(400).json({ message: 'Поля title и content обязательны' });
    }

    // 2. Сохраняем пост в коллекцию posts
    const db = getDb();
    const result = await db.collection('posts').insertOne({
      title,
      content,
      author: req.user.username,
      authorId: req.user.userId,
      createdAt: new Date(),
    });

    // 3. Отвечаем клиенту
    res.status(201).json({
      message: 'Пост успешно создан',
      postId: result.insertedId,
    });
  } catch (error) {
    console.error('Ошибка создания поста:', error);
    res.status(500).json({ message: 'Ошибка сервера при создании поста' });
  }
});

// Получение всех постов (доступно всем)
router.get('/all', async (req, res) => {
  try {
    const db = getDb();
    const posts = await db.collection('posts').find().toArray();

    res.json(posts);
  } catch (error) {
    console.error('Ошибка получения постов:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении постов' });
  }
});

export default router;