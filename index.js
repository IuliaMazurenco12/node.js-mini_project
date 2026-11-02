// Обработка запросов авторизации
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDb } from '../db/index.js';

// Создаём объект роутер
const router = express.Router();

//registration пользователя 
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ message: 'Поля username и password обязательны' });
    }

    const db = getDb();
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Пользователь с таким именем уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

// login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    // 1. Проверяем, что поля переданы
    if (!username || !password) {
      return res.status(400).json({ message: 'Поля username и password обязательны' });
    }

    // 2. Ищем пользователя в базе
    const db = getDb();
    const user = await db.collection('users').findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
    }

    // 3. Сравниваем введённый пароль с хешем из базы
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
    }

    // 4. Создаём JWT-токен
    const token = jwt.sign(
      { userId: user._id.toString(), username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 5. Отправляем токен клиенту
    res.json({ message: 'Вход выполнен', token });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ message: 'Ошибка сервера при входе' });
  }
});

export default router;