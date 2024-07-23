import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zomctncvpyijkfswdqjd.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvbWN0bmN2cHlpamtmc3dkcWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE2OTY4NDIsImV4cCI6MjAzNzI3Mjg0Mn0.2umISx4mFtp5xWdEhmzgHRO8oYsocrPpf2c6pOTYDXM'
);

// Получение данных пользователя
async function getUserData(telegramId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();

  if (error) {
    console.error('Ошибка получения данных:', error);
    return null; // Или создайте нового пользователя
  } else {
    return data;
  }
}

// Обновление данных пользователя (баланс, инвентарь и т.д.)
async function updateUserData(telegramId, updates) {
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('telegram_id', telegramId);

  if (error) {
    console.error('Ошибка обновления данных:', error);
  }
}


// При загрузке приложения
Telegram.WebApp.ready();
const telegramId = Telegram.WebApp.initDataUnsafe?.user?.id;

(async () => {
  const userData = await getUserData(telegramId);

  if (userData) {
    balance = userData.balance;
    ownedCars = userData.inventory; // Предполагаем, что структура инвентаря соответствует вашему коду
    // Загрузите другие данные из userData (b2, b3)
  } else {
    // Создайте нового пользователя в базе данных, если его нет
    await supabase
      .from('users')
      .insert({ telegram_id: telegramId });
  }

  // Обновите интерфейс с данными из базы данных
  displayCars();
  updateEarnRate();
  updateInfoPanels();
})();

// Инициализация Telegram Web App
Telegram.WebApp.ready();

// Развернуть на весь экран при загрузке
Telegram.WebApp.expand();

// Массив с данными о машинках (замените на свои данные)
const cars = [
  { name: "1", image: "muscle_car.png", level: 1, price: 10 },
  { name: "2", image: "sports_car.png", level: 2, price: 100 },
  { name: "3", image: "muscle_car.png", level: 3, price: 1000 },
  { name: "4", image: "sports_car.png", level: 4, price: 10000 },
  { name: "5", image: "muscle_car.png", level: 5, price: 100000 },
  { name: "6", image: "sports_car.png", level: 6, price: 1000000 },
  { name: "7", image: "muscle_car.png", level: 7, price: 10000000 },
  { name: "8", image: "sports_car.png", level: 8, price: 100000000 },
  { name: "9", image: "muscle_car.png", level: 9, price: 1000000000 },
  { name: "10", image: "sports_car.png", level: 10, price: 10000000000 },
];



// Переменные для хранения данных
let balance = 0; // Начальный баланс будет загружен из базы данных
let earnRate = 0;
let topScore = 0;
let ownedCars = []; // Инвентарь будет загружен из базы данных



// Функция для получения изображения машинки по уровню
function getCarImageByLevel(level) {
  if (level <= cars.length) {
      return cars[level - 1].image;
  } else {
      return "default_car_image.png"; // Или другое изображение по умолчанию
  }
}


function displayCars() {
  const inventory = document.getElementById("inventory");
  inventory.innerHTML = ""; // Очищаем инвентарь перед обновлением

  ownedCars.forEach((car, index) => {
    const carSlot = document.createElement("div"); 
    carSlot.classList.add("car-slot");  // Добавляем класс для стилизации слота
    carSlot.draggable = true;           // Делаем слот перетаскиваемым
    carSlot.dataset.index = index;      // Запоминаем индекс слота в дата-атрибуте

    if (car) { // Если в слоте есть машинка
      // Добавляем изображение машинки
      const carImage = document.createElement("img");
      carImage.src = getCarImageByLevel(car.level); 
      carImage.alt = car.name; 
      carSlot.appendChild(carImage);

      // Добавляем отображение уровня машинки
      const carLevel = document.createElement("div");
      carLevel.classList.add("car-level"); 
      carLevel.textContent = `Lvl ${car.level}`;
      carSlot.appendChild(carLevel);
    }

    // Добавляем обработчики событий для перетаскивания (drag-and-drop)
    carSlot.addEventListener("mousedown", startMove);     
    carSlot.addEventListener("mousemove", moveCar);
    carSlot.addEventListener("mouseup", endMove);
    // Обработчики для сенсорных устройств (touch events)
    carSlot.addEventListener("touchstart", startMove);
    carSlot.addEventListener("touchmove", moveCar);
    carSlot.addEventListener("touchend", endMove);

    inventory.appendChild(carSlot); // Добавляем слот в инвентарь
  });
}

let movingCarIndex = null;
let movingCarElement = null;


function startMove(event) {
  event.preventDefault();
  const clientX = event.clientX || event.touches[0].clientX;
  const clientY = event.clientY || event.touches[0].clientY;

  movingCarIndex = parseInt(event.target.closest('.car-slot').dataset.index);
  movingCarElement = event.target.closest('.car-slot');

  // Запоминаем начальные координаты машинки относительно курсора/пальца
  const offsetX = clientX - movingCarElement.offsetLeft;
  const offsetY = clientY - movingCarElement.offsetTop;

  movingCarElement.dataset.offsetX = offsetX;
  movingCarElement.dataset.offsetY = offsetY;

  // Устанавливаем z-index, чтобы машинка была выше остальных элементов
  movingCarElement.style.zIndex = 1000;
  movingCarElement.classList.add('dragging');
}



function moveCar(event) {
  event.preventDefault();

  let newLeft; // Объявляем newLeft один раз
  let newTop; 

  if (movingCarElement) {
      const clientX = event.clientX || event.touches[0].clientX;
      const clientY = event.clientY || event.touches[0].clientY;

      // Получаем границы контейнера инвентаря
      const inventoryRect = document.getElementById('inventory').getBoundingClientRect();

      // Получаем размеры машинки
      const carWidth = movingCarElement.offsetWidth;
      const carHeight = movingCarElement.offsetHeight;

      // Вычисляем границы для перемещения машинки
      const minX = inventoryRect.left;
      const maxX = inventoryRect.right - carWidth;
      const minY = inventoryRect.top;
      const maxY = inventoryRect.bottom - carHeight;

      // Ограничиваем координаты машинки и присваиваем значения переменным
      newLeft = Math.max(minX, Math.min(clientX - movingCarElement.dataset.offsetX, maxX));
      newTop = Math.max(minY, Math.min(clientY - movingCarElement.dataset.offsetY, maxY));

      // Устанавливаем CSS переменные для позиционирования
      movingCarElement.style.setProperty('--newLeft', newLeft + 'px');
      movingCarElement.style.setProperty('--newTop', newTop + 'px');
  }
}


function endMove(event) {
  event.preventDefault(); // Предотвращаем стандартное поведение браузера при окончании перетаскивания

  if (movingCarElement) { // Проверяем, что перетаскивание действительно происходило
    // Получаем координаты, где закончилось перетаскивание
    const clientX = event.clientX || event.changedTouches[0].clientX;
    const clientY = event.clientY || event.changedTouches[0].clientY;

    // Находим слот, на который была отпущена машинка
    const targetSlot = document.elementFromPoint(clientX, clientY).closest('.car-slot');

    if (targetSlot) { // Если машинка была отпущена на слот
      const targetIndex = parseInt(targetSlot.dataset.index); // Получаем индекс целевого слота

      if (movingCarIndex !== targetIndex) { // Если машинка перемещена в другой слот
        const draggedCar = ownedCars[movingCarIndex];  // Машинка, которую перетащили
        const targetCar = ownedCars[targetIndex];      // Машинка, которая уже была в целевом слоте (или null)

        // Проверяем условия для объединения или перемещения
        if (targetCar && draggedCar && draggedCar.level === targetCar.level) {
          // Объединение машинок:
          ownedCars[targetIndex].level++;             // Увеличиваем уровень машинки в целевом слоте
          ownedCars[movingCarIndex] = null;           // Очищаем исходный слот
        } else {
          // Перемещение машинок (или null, если слот пустой):
          [ownedCars[movingCarIndex], ownedCars[targetIndex]] = [targetCar, draggedCar];
        }
      } // Если машинка отпущена на тот же слот, ничего не делаем
    } // Если машинка отпущена вне слотов, ничего не делаем

    // Обновляем отображение инвентаря и данные о заработке
    displayCars();
    updateEarnRate();

    // Сбрасываем стили и переменные, связанные с перетаскиванием
    movingCarElement.style.transform = '';
    movingCarElement.classList.remove('dragging');

    movingCarIndex = null;
    movingCarElement = null; 
  }
}





// Функция для обновления скорости заработка
function updateEarnRate() {
  earnRate = ownedCars.reduce((sum, car) => sum + (car ? car.level : 0), 0); // Суммируем уровни всех машинок, учитывая null значения
  document.getElementById("earnRate").textContent = `${earnRate}/мин`;
}

// Функция для заработка монет (вызывается каждую минуту)
function earnCoins() {
    balance += earnRate;
    updateInfoPanels();
  }
  
  setInterval(earnCoins, 600); // Запускаем заработок монет каждую минуту

// Функция для заработка монет (вызывается каждую минуту)
function earnCoins() {
    balance += earnRate;
    updateInfoPanels();
  }
  
  // Обработчик события для покупки машины
document.getElementById("shop").addEventListener("click", async (event) => {
  if (event.target.classList.contains("buy-button")) {
    const carIndex = parseInt(event.target.dataset.carIndex);
    const car = cars[carIndex];

    // Получаем данные пользователя из базы данных
    const telegramId = Telegram.WebApp.initDataUnsafe?.user?.id;
    const userData = await getUserData(telegramId);

    if (userData && userData.balance >= car.price) {
      // Проверяем, есть ли место в инвентаре
      const emptySlotIndex = userData.inventory.findIndex(slot => slot === null);

      if (emptySlotIndex !== -1) {
        // Обновляем данные в базе данных
        const newBalance = userData.balance - car.price;
        const newInventory = [...userData.inventory]; 
        newInventory[emptySlotIndex] = { level: car.level };

        await updateUserData(telegramId, { balance: newBalance, inventory: newInventory });

        // Обновляем данные в локальных переменных и интерфейсе
        balance = newBalance;
        ownedCars = newInventory;
        displayCars();
        updateInfoPanels();
      } else {
        alert("Превышен лимит гаража!");
      }
    } else {
      alert("Недостаточно средств!");
    }
  }
});
  

// Функция для анимации движения машинок
function animateCars() {
  // ... (логика анимации)
}

// Функция для обновления значений в табличках
function updateInfoPanels() {
  document.getElementById("balance").textContent = balance;
  document.getElementById("earnRate").textContent = `${earnRate}/мин`;
  document.getElementById("topScore").textContent = topScore;
}

// Обработчики событий для кнопок (пример)
document.getElementById("shopButton").addEventListener("click", () => {
  // ... (логика открытия магазина)
});


// Функция для отображения магазина
function displayShop() {
  const shop = document.getElementById("shop");
  shop.innerHTML = `
      <div class="shop-header">
          <h2>Магазин</h2>
          <button id="closeShopButton">Закрыть</button> </div>`;

    cars.forEach(car => {
      const shopItem = document.createElement("div");
      shopItem.classList.add("shop-item");
  
      const carImage = document.createElement("img");
      carImage.src = car.image;
      carImage.alt = car.name;
      shopItem.appendChild(carImage);
  
      const carInfo = document.createElement("div");
      carInfo.innerHTML = `
        <p>Уровень: ${car.level}</p>
        <p>Цена: ${car.price}</p>
        <button class="buy-button" data-car-index="${cars.indexOf(car)}">Купить</button>
      `;
      shopItem.appendChild(carInfo);
  
      shop.appendChild(shopItem);
      
    });
  }
  
   // Обработчик события для кнопки "Закрыть" (вынесен за пределы displayShop)
document.getElementById("shop").addEventListener("click", (event) => {
  if (event.target.id === "closeShopButton") {
      document.getElementById("shop").style.display = "none";
  }
});




  
  // Обработчик события для кнопки "Магазин"
  document.getElementById("shopButton").addEventListener("click", () => {
    displayShop();
    document.getElementById("shop").style.display = "flex"; // Показываем магазин
  });
  
  // Обработчик события для закрытия магазина
  document.getElementById("shop").addEventListener("click", (event) => {
    if (event.target.id === "shop") { // Проверяем, что клик был вне элементов магазина
      document.getElementById("shop").style.display = "none"; // Скрываем магазин
    }
  });
  
  const shopHeader = document.querySelector('.shop-header');
  const inventory = document.getElementById('inventory');
  
  function adjustInventoryHeight() {
    const shopHeaderHeight = shopHeader.offsetHeight; // Получаем высоту заголовка
    const viewportHeight = window.innerHeight; // Получаем высоту области просмотра
    const maxHeight = viewportHeight - shopHeaderHeight - 40; // Вычисляем максимальную высоту инвентаря
  
    inventory.style.maxHeight = `${maxHeight}px`; // Устанавливаем максимальную высоту инвентаря
  }
  
  // Вызываем функцию при загрузке страницы и при изменении размера окна
  window.addEventListener('load', adjustInventoryHeight);
  window.addEventListener('resize', adjustInventoryHeight);
  

  window.addEventListener('load', function() {
    const appElement = document.getElementById('app'); // Получаем элемент #app
    const windowHeight = window.innerHeight; // Получаем высоту окна
    const desiredHeight = windowHeight - 10; // Вычитаем 1 сантиметр (10 пикселей)
  
    appElement.style.maxHeight = desiredHeight + 'px'; // Устанавливаем максимальную высоту
  });
  
  function adjustPageHeight() {
    const appElement = document.getElementById('app');
    const windowHeight = window.innerHeight;
    const desiredHeight = 0.8 * windowHeight; // 80% от высоты окна (90% - 10%)

    appElement.style.maxHeight = desiredHeight + 'px';
}

document.addEventListener('DOMContentLoaded', function() {
  var backgroundMusic = document.getElementById('backgroundMusic');
  backgroundMusic.volume = 0.1; // Установите громкость на 10%
  backgroundMusic.play();
});


document.addEventListener('DOMContentLoaded', () => {
  const cloud = document.getElementById('cloud');
  let posX = 0;
  let posY = 0;
  let directionX = 1;
  let directionY = 1;

  function animateCloud() {
      posX += directionX * 0.5;
      posY += directionY * 0.2;

      if (posX > window.innerWidth - cloud.offsetWidth || posX < 0) {
          directionX *= -1;
      }
      if (posY > window.innerHeight - cloud.offsetHeight || posY < 0) {
          directionY *= -1;
      }

      cloud.style.transform = `translate(${posX}px, ${posY}px)`;
      requestAnimationFrame(animateCloud);
  }

  animateCloud();
});

window.addEventListener('load', () => {
  // ... (запуск музыки)

  const clouds = document.querySelectorAll('.cloud');

  clouds.forEach((cloud, index) => {
      // Начальные позиции облаков (в пикселях)
      const top = 20 + index * 50; // Начинаем с 10px и увеличиваем на 15px для каждого облака
      const left = -cloud.offsetWidth - (index * 100); // Начинаем за левой границей экрана

      cloud.style.top = top + 'px';
      cloud.style.left = left + 'px';
  });
});



document.getElementById('playMusicButton').addEventListener('click', function() {
  var audio = document.getElementById('backgroundMusic');
  audio.play();
});


// Вызываем функции при загрузке страницы
displayCars();
updateInfoPanels();
// animateCars(); // Запустите анимацию, когда она будет готова



document.getElementById('profileButton').addEventListener('click', () => {
  const profileMenu = document.getElementById('profileMenu');
  profileMenu.classList.toggle('open'); // Переключаем класс "open"
});

document.getElementById('closeProfileButton').addEventListener('click', () => {
  document.getElementById('profileMenu').classList.remove('open');
});


async function showProfile() {
  const telegramId = Telegram.WebApp.initDataUnsafe?.user?.id;
  const userData = await getUserData(telegramId);

  if (userData) {
    document.getElementById('profileName').textContent = userData.username;
    document.getElementById('profileB1').textContent = userData.balance;
    // ... (заполнение остальных полей)

    document.getElementById('profileMenu').style.display = 'block'; // Показываем меню
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const profileButton = document.getElementById('profileButton');
  const profileMenu = document.getElementById('profileMenu');
  const closeProfileButton = document.getElementById('closeProfileButton');

  profileButton.addEventListener('click', () => {
      profileMenu.style.display = profileMenu.style.display === 'none' ? 'block' : 'none';
  });

  closeProfileButton.addEventListener('click', () => {
      profileMenu.style.display = 'none';
  });
});

// Вызываем функцию при загрузке страницы или при нажатии на кнопку профиля
showProfile();



