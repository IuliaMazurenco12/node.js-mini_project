import jwt from 'jsonwebtoken';

export default function authMiddleware(req, res, next) {
  // 1. Берём заголовок Authorization
  const authHeader = req.headers.authorization;

  // 2. Проверяем, что токен передан
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Нет токена. Нужна авторизация' });
  }

  // 3. Достаём сам токен (без слова Bearer)
  const token = authHeader.split(' ')[1];

  try {
    // 4. Проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Сохраняем данные пользователя и пропускаем дальше
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Токен недействителен или истёк' });
  }
}