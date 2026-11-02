// Обработка запросов авторизации
import express from 'express';
import bcrypt from 'bcrypt';
import { getDb } from '../db/index.js';

// Создаём объект роутер
const router = express.Router();

// registration пользователя 
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    // 1. Валидация: проверяем, что поля переданы
    if (!username || !password) {
      return res.status(400).json({ message: 'Поля username и password обязательны' });
    }

    // 2. Получаем коллекцию users
    const db = getDb();
    const usersCollection = db.collection('users');

    // 3. Проверяем, не занят ли username
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Пользователь с таким именем уже существует' });
    }

    // 4. Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Сохраняем пользователя в базу данных
    const result = await usersCollection.insertOne({
      username,
      password: hashedPassword,
      createdAt: new Date(),
    });

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      userId: result.insertedId,
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ message: 'Ошибка сервера при регистрации' });
  }
});

// login пользователя 
router.post('/login', (req, res) => {
  res.json({ message: 'Маршрут POST /auth/login ' });
});

export default router;