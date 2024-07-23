import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zomctncvpyijkfswdqjd.supabase.co'; // Замените на ваш URL Supabase
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvbWN0bmN2cHlpamtmc3dkcWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE2OTY4NDIsImV4cCI6MjAzNzI3Mjg0Mn0.2umISx4mFtp5xWdEhmzgHRO8oYsocrPpf2c6pOTYDXM'; // Замените на ваш ключ Supabase
const supabase = createClient(supabaseUrl, supabaseKey);




const profileButton = document.getElementById("profileButton");
const profileMenu = document.getElementById("profileMenu");
const telegramIdElement = document.getElementById("telegramId");
const userNameElement = document.getElementById("userName");
const carCBalanceElement = document.getElementById("carCBalance");
const carRBalanceElement = document.getElementById("carRBalance");
const carTBalanceElement = document.getElementById("carTBalance");

// Функция для получения имени пользователя из Telegram.WebApp.initData
async function getTelegramUserName() {
  try {
    const initData = await new Promise((resolve) => {
      Telegram.WebApp.ready();
      Telegram.WebApp.expand();
      resolve(Telegram.WebApp.initData);
    });

    return initData.user.first_name || initData.user.username || "Пользователь";
  } catch (error) {
    console.error("Ошибка при получении имени пользователя:", error);
    return "Пользователь"; // Возвращаем значение по умолчанию при ошибке
  }
}

async function initializeProfile() {
    const telegramUserId = Telegram.WebApp.initDataUnsafe.user.id;
  
    const { data: existingUser, error } = await supabase
      .from('users')
      .select('telegram_id, userr, balance, b3, inventory')
      .eq('telegram_id', telegramUserId)
      .single();

  if (error) {
    console.error(error);
  } else if (existingUser) {
    updateProfileUI(existingUser);
  } else {
    const userName = await getTelegramUserName(); // Получаем имя пользователя
    const { error: insertError } = await supabase
      .from('users')
      .insert({ telegram_id: telegramUserId, name: userName }); // Добавляем имя при создании профиля

    if (insertError) {
      console.error(insertError);
    } else {
      initializeProfile(); 
    }
  }
}

function updateProfileUI(user) {
    telegramIdElement.textContent = user.telegram_id;
    userNameElement.textContent = user.userr;
    carCBalanceElement.textContent = user.balance || 0; // Отображаем 0, если баланс не определен
    carRBalanceElement.textContent = user.b2 || 0;
    carTBalanceElement.textContent = user.b3 || 0;
}

profileButton.addEventListener("click", () => {
  profileMenu.style.display = profileMenu.style.display === "none" ? "block" : "none";
});

initializeProfile();
