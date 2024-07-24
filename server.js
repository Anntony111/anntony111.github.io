const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3000;

// Настройка подключения к базе данных
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'my_database',
  password: 'Nokiax61',
  port: 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Middleware
app.use(express.json());
app.use(cors()); // Разрешение запросов из других источников

app.get('/user/:telegramId', async (req, res) => {
    let { telegramId } = req.params;
  
    // Если нет telegramId, установим значение по умолчанию
    if (!telegramId) {
      telegramId = '1';
    }
  
    try {
      const result = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
  
      // Если пользователь не найден, создаем профиль по умолчанию
      if (result.rows.length === 0) {
        // Вставка данных с обработкой уникальности
        try {
          await pool.query('INSERT INTO users (telegram_id) VALUES ($1)', [telegramId]);
          res.json({ telegram_id: telegramId, message: 'Default profile created' });
        } catch (insertError) {
          if (insertError.code === '23505') { // Код ошибки для уникального ограничения в PostgreSQL
            // Запись уже существует, обработать это
            res.status(409).json({ error: 'User already exists' });
          } else {
            // Другая ошибка
            console.error('Error inserting user data:', insertError);
            res.status(500).send('Internal Server Error');
          }
        }
      } else {
        res.json(result.rows[0]);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).send('Internal Server Error');
    }
  });

// Обработка запроса на обновление данных пользователя
app.post('/user/:telegramId', async (req, res) => {
  const { telegramId } = req.params;
  const updates = req.body;

  try {
    await pool.query(
      'UPDATE users SET balance = $1, inventory = $2, top_score = $3, car_ref = $4, car_top = $5 WHERE telegram_id = $6',
      [updates.balance, JSON.stringify(updates.inventory), updates.topScore, updates.carRef, updates.carTop, telegramId]
    );
    res.send('User data updated successfully');
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
