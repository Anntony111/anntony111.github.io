import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js';
import { getDatabase, ref, child, get, update } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';





// Ваша конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAnSmjHzqZOSkjWXqvKo1LvNOWRnVtrk7U",
  authDomain: "miniapp-af39e.firebaseapp.com",
  databaseURL: "https://miniapp-af39e-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "miniapp-af39e",
  storageBucket: "miniapp-af39e.appspot.com",
  messagingSenderId: "683519382191",
  appId: "1:683519382191:web:ed9490e888055ec5537a5a",
  measurementId: "G-YDK2323MKK"
};

function abbreviateNumber(number) {
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc'];
  const tier = Math.log10(number) / 3 | 0; // Определяем порядок величины числа

  if (tier === 0) return number.toLocaleString(); // До 1000 не сокращаем

  const suffix = suffixes[tier];
  const scale = Math.pow(10, tier * 3);
  const scaled = number / scale;
  return scaled.toFixed(2) + suffix;
}


// Инициализация Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const dbRef = database.ref();


// Глобальные переменные (доступны во всей программе)
let balance = 0;
let earnRate = 0;
let topScore = 0;
let ownedCars = new Array(12).fill({ level: 0, name: "Пустой слот", goldPerSecond: 0 });
let carRef = 0;  // Объявляем carRef глобально
let carTop = 0;
let telegramId




async function main() {
  const telegramId = Telegram.WebApp.initDataUnsafe?.user?.id || '1';
  const username = Telegram.WebApp.initDataUnsafe?.user?.username || "Не указано";
  const name = (Telegram.WebApp.initDataUnsafe?.user?.first_name || '') + ' ' + (Telegram.WebApp.initDataUnsafe?.user?.last_name || '');

  let userData;
  let isProfileLoaded = false;
  let isGameInitialized = false;

  const welcomeScreen = document.createElement('div');
  welcomeScreen.id = 'welcomeScreen';
  welcomeScreen.innerHTML = `
      <h2>Добро пожаловать в Cartax!</h2>
      <p>Бонус для новых игроков:</p>
      <ul>
        <li>100 000 Balance</li>
      </ul>
      <button id="claimBonusButton">Забрать бонус</button>
    `;

  document.body.appendChild(welcomeScreen);

  async function initializeProfile() {
    console.log("Пользователь не найден, создается профиль по умолчанию...");
    const newUserData = {
      telegram_id: telegramId,
      username: username,
      name: name,
      balance: 100000,
      inventory: {},
      topScore: 0,
      car_ref: 0,
      car_top: 0,
      created_at: new Date().toISOString()
    };



    for (let i = 0; i < 12; i++) {
      newUserData.inventory[i.toString()] = { level: 0, name: `Car ${i + 1}` };
    }

    await updateUserData(telegramId, newUserData);

    welcomeScreen.style.display = 'flex';

    // Обработчик события для кнопки "Получить бонус"
    document.getElementById('claimBonusButton').addEventListener('click', async () => {
      welcomeScreen.style.display = 'none'; // Скрываем окно приветствия
      
      // ждем обновления данных в базе данных
      await updateUserData(telegramId, newUserData); 

      // Обновляем данные пользователя из базы данных
      userData = await getUserData(telegramId);

      // Обновляем глобальные переменные и интерфейс
      balance = userData.balance;
      ownedCars = Object.values(userData.inventory);
      topScore = userData.topScore;

      updateEarnRate();
      updateInfoPanels(); // Обновляем интерфейс
      displayCars();
      showProfile();

      isProfileLoaded = true;
      isGameInitialized = true;
    });
  }

  while (!isProfileLoaded || !isGameInitialized) {
    try {
      userData = await getUserData(telegramId);

      if (userData) {
        console.log(userData.balance);

        if (!isProfileLoaded) {
          balance = userData.balance || 0;
          ownedCars = Object.values(userData.inventory);
          topScore = userData.topScore || 0;

          updateEarnRate();
          updateInfoPanels();
          displayCars();
          showProfile();

          isProfileLoaded = true;
        }

        if (!isGameInitialized) {
          balance = userData.balance || 0;
          ownedCars = Object.values(userData.inventory);
          topScore = userData.topScore || 0;

          updateInfoPanels();
          displayCars();

          isGameInitialized = true;
        }
      } else {
        await initializeProfile();
        isProfileLoaded = true;
        isGameInitialized = true;
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных пользователя:', error);
    }

    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  }
}

main();





// Получение данных пользователя
async function getUserData(telegramId) {
  try {
    const userRef = dbRef.child(`users/${telegramId}`);
    const snapshot = await userRef.once('value');

    if (snapshot.exists()) {
      const userData = snapshot.val();

      // Проверяем и корректируем inventory, если нужно
      if (!userData.inventory || !Array.isArray(userData.inventory) || userData.inventory.length !== 12) {
        userData.inventory = {};
        for (let i = 0; i < 12; i++) {
          userData.inventory[i.toString()] = { level: 0, name: `Car ${i + 1}` };
        }

        // Сохраняем обновленный inventory в базу данных
        await userRef.update({ inventory: userData.inventory });
      }

      // Проверяем и корректируем остальные поля (balance, topScore и т.д.)
      userData.balance = userData.balance || 0;
      userData.topScore = userData.topScore || 0;
      userData.name = userData.name || "";
      userData.username = userData.username || "";
      userData.telegram_id = userData.telegram_id || "";

      console.log("Fetched user data:", userData);
      return userData;
    } else {
      console.log("User not found");
      return null;
    }
  } catch (error) {
    console.error('Ошибка при загрузке данных пользователя:', error);
    throw error;
  }
}






async function updateUserData(telegramId, updates) {
  try {
    const userRef = dbRef.child(`users/${telegramId}`);
    // Обновляем инвентарь
    if (updates.inventory) {
      const inventoryRef = userRef.child('inventory');
      // Переходим по каждому слоту инвентаря
      for (const [slotIndex, car] of Object.entries(updates.inventory)) {
        if (car.level > 0) {
          // Получаем данные о машинке из массива `cars`
          const carData = cars[car.level - 1]; // Индекс массива `cars` начинается с 0
          // Обновляем `name` и `goldPerSecond`
          updates.inventory[slotIndex].name = carData.name;
          updates.inventory[slotIndex].goldPerSecond = carData.goldPerSecond;
        }
      }
      await inventoryRef.set(updates.inventory); // Перезаписываем узел inventory
      delete updates.inventory; // Удаляем inventory из общего объекта обновлений
    }

    // Обновляем остальные поля
    await userRef.update(updates);
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
}






// Инициализация Telegram Web App
Telegram.WebApp.ready();

// Развернуть на весь экран при загрузке
Telegram.WebApp.expand();



import cars from './cars.js'; // Импортируем данные о машинах




// Функция для получения изображения машинки по уровню
// Функция для получения изображения машинки по уровню
function getCarImageByLevel(level) {
  if (level === 0 || level > cars.length) {
    return null; // Возвращаем null, если слот пустой или уровень машинки не найден
  } else {
    return cars[level - 1].image;
  }
}



function displayCars() {
  const inventory = document.getElementById("inventory");
  inventory.innerHTML = "";
  for (let index = 0; index < ownedCars.length; index++) {
    const carSlot = document.createElement("div");
    carSlot.classList.add("car-slot");
    carSlot.draggable = true;
    carSlot.dataset.index = index;
    // Проверка уровня: если уровень 0, то слот пустой
    if (ownedCars[index] && ownedCars[index].level > 0) {
      const carImage = document.createElement("img");
      carImage.src = getCarImageByLevel(ownedCars[index].level);
      carImage.alt = ownedCars[index].name;
      carSlot.appendChild(carImage);
      const carLevel = document.createElement("div");
      carLevel.classList.add("car-level");
      carLevel.textContent = `Lvl ${ownedCars[index].level}`;
      carSlot.appendChild(carLevel);
    }
    // Добавляем обработчики событий drag-and-drop (как и раньше)
    carSlot.addEventListener("mousedown", startMove);
    carSlot.addEventListener("mousemove", moveCar);
    carSlot.addEventListener("mouseup", endMove);
    carSlot.addEventListener("touchstart", startMove);
    carSlot.addEventListener("touchmove", moveCar);
    carSlot.addEventListener("touchend", endMove);
    inventory.appendChild(carSlot);
  }
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


async function endMove(event) {
  event.preventDefault();

  if (movingCarElement) {
    const clientX = event.clientX || event.changedTouches[0].clientX;
    const clientY = event.clientY || event.changedTouches[0].clientY;

    const targetSlot = document.elementFromPoint(clientX, clientY).closest('.car-slot');

    if (targetSlot) {
      const targetIndex = parseInt(targetSlot.dataset.index);

      if (movingCarIndex !== targetIndex) {
        const draggedCar = ownedCars[movingCarIndex];
        const targetCar = ownedCars[targetIndex];

        // Проверяем, что уровни машинок больше 0
        if (targetCar && draggedCar && draggedCar.level > 0 && targetCar.level > 0 && draggedCar.level === targetCar.level) {
          ownedCars[targetIndex].level++; // Увеличиваем уровень целевой машинки
          ownedCars[movingCarIndex] = { level: 0, name: `Car ${movingCarIndex + 1}` };
        } else {
          [ownedCars[movingCarIndex], ownedCars[targetIndex]] = [targetCar, draggedCar]; // Меняем местами
        }

        // Обновляем данные в Firebase Realtime Database
        try {
          const telegramId = Telegram.WebApp.initDataUnsafe?.user?.id;

          await updateUserData(telegramId, { inventory: ownedCars });
        } catch (error) {
          console.error('Ошибка при обновлении данных в базе данных:', error);
          alert("Произошла ошибка при сохранении данных. Пожалуйста, попробуйте еще раз.");

          // Отменяем перемещение, если обновление не удалось
          [ownedCars[movingCarIndex], ownedCars[targetIndex]] = [draggedCar, targetCar];
        }
      }
    }

    // Сбрасываем стили и переменные
    movingCarElement.style.transform = '';
    movingCarElement.classList.remove('dragging');
    movingCarIndex = null;
    movingCarElement = null;

    displayCars(); // Обновляем отображение инвентаря
    updateEarnRate();
  }
}









// Функция для обновления скорости заработка
// Функция для обновления скорости заработка
function updateEarnRate() {
  earnRate = ownedCars.reduce((sum, car) => {
    if (car) {
      return sum + parseFloat(car.goldPerSecond || 0);
    }
    return sum;
  }, 0);
  document.getElementById("earnRate").textContent = `${earnRate.toFixed(1)}/сек`;

}


function earnCoins() {
  balance += earnRate * 30; // Заработок за 30 секунд
  updateInfoPanels(); // Обновляем таблички

  const telegramId = Telegram.WebApp.initDataUnsafe?.user?.id;
  updateUserData(telegramId, { balance, inventory: ownedCars, topScore });
}

setInterval(earnCoins, 30000); // Вызываем earnCoins каждые 30 секунд









document.getElementById("shop").addEventListener("click", async (event) => {
  if (event.target.classList.contains("buy-button")) {
    const carIndex = parseInt(event.target.dataset.carIndex);
    const car = cars[carIndex];
    const telegramId = Telegram.WebApp.initDataUnsafe?.user?.id;

    if (balance >= car.price) {
      balance -= car.price;

      const emptySlotIndex = ownedCars.findIndex(slot => !slot || slot.level === 0); // Находим пустой слот

      if (emptySlotIndex !== -1) {
        ownedCars[emptySlotIndex] = { ...car };

        try {
          await updateUserData(telegramId, {
            balance,
            inventory: ownedCars,
            topScore
          }).then(() => {
            displayCars();
            updateEarnRate();
            updateInfoPanels(); // Обновляем интерфейс после обновления данных
          });


        } catch (error) {
          console.error("Ошибка при обновлении данных в базе данных:", error);
          alert("Произошла ошибка при покупке машинки. Пожалуйста, попробуйте еще раз.");

          // Восстанавливаем баланс и слот инвентаря, если обновление не удалось
          balance += car.price;
          ownedCars[emptySlotIndex] = null;
        }
      } else {
        alert("Превышен лимит гаража!");
      }
    } else {
      alert("Недостаточно средств!");
    }
  } else if (event.target.id === "closeShopButton") {
    document.getElementById("shop").style.display = "none";
  }
});




// Функция для анимации движения машинок
function animateCars() {
  // ... (логика анимации)
}

// Функция для обновления значений в табличках
function updateInfoPanels() {
  document.getElementById("balance").textContent = abbreviateNumber(balance); // Сокращаем баланс
  document.getElementById("earnRate").textContent = `${earnRate.toFixed(1)}/сек`;
  document.getElementById("topScore").textContent = topScore;
}




let isPurchaseInProgress = false;

// Функция для отображения магазина
function displayShop(telegramId) {
  const shop = document.getElementById("shop");
  shop.innerHTML = `
      <div class="shop-header">
        <h2>Магазин</h2>
        <button id="closeShopButton">Закрыть</button> 
      </div>
      <div id="shopContent"> </div>
    `;

  const shopContent = document.getElementById("shopContent");

  cars.forEach((car, index) => {
    const shopItem = document.createElement("div");
    shopItem.classList.add("shop-item");

    const carImage = document.createElement("img");
    carImage.src = car.image;
    carImage.alt = car.name;
    shopItem.appendChild(carImage);

    const carInfo = document.createElement("div");
    carInfo.innerHTML = `
        <p>Name: ${car.name}</p>
        <p>Цена: ${abbreviateNumber(car.price)}</p>
        <p>Доходность: ${abbreviateNumber(car.goldPerSecond)}/сек</p> 
      `;

    // Создаем кнопку "Купить" для каждой машины
    const buyButton = document.createElement("button");
    buyButton.classList.add("buy-button");
    buyButton.dataset.carIndex = index;
    buyButton.textContent = "Купить";

    // Обработчик события для кнопки "Купить"
    buyButton.addEventListener("click", buyCarHandler);

    carInfo.appendChild(buyButton);
    shopItem.appendChild(carInfo);
    shopContent.appendChild(shopItem);
  });

  // Обработчик события для кнопки "Закрыть"
  document.getElementById("closeShopButton").addEventListener("click", () => {
    shop.style.display = "none"; // Скрываем магазин
  });
}

async function buyCarHandler(event) {
  if (buyButton.disabled || isPurchaseInProgress) {
    event.stopPropagation(); // Останавливаем всплытие события
    return; // Предотвращаем повторный вызов
  }
  const buyButton = event.target;
  const carIndex = buyButton.dataset.carIndex;
  const car = cars[carIndex];

  if (buyButton.disabled || isPurchaseInProgress) return; // Предотвращаем повторные клики

  // Блокируем кнопку и устанавливаем флаг
  buyButton.disabled = true;
  isPurchaseInProgress = true;

  console.log(`Attempting to purchase car at index: ${carIndex}`);

  if (balance >= car.price) {
    try {
      // Находим первый пустой слот
      const emptySlotIndex = ownedCars.findIndex(slot => !slot || slot.level === 0);

      if (emptySlotIndex !== -1) { // Если есть место в гараже
        // Уменьшаем баланс и обновляем данные в базе данных
        balance -= car.price;
        ownedCars[emptySlotIndex] = { ...car };

        await updateUserData(telegramId, {
          balance,
          inventory: ownedCars,
          topScore
        });

        displayCars();
        updateEarnRate();
        updateInfoPanels();

        console.log("Покупка успешно совершена"); // Лог успешной покупки
      } else {
        alert("Нет места в гараже");
      }
    } catch (error) {
      console.error('Error:', error); // Лог ошибок
    } finally {
      // Разблокируем кнопку и сбрасываем флаг
      buyButton.disabled = false;
      isPurchaseInProgress = false;
    }
  } else {
    alert("Недостаточно средств!");
    buyButton.disabled = false; // Разблокируем кнопку в случае недостатка средств
    isPurchaseInProgress = false;
  }
}

let isShopOpen = false; // Флаг для отслеживания состояния магазина

// Обработчик события для кнопки "Магазин"
document.getElementById("shopButton").addEventListener("click", () => {
  if (!isShopOpen) { // Проверяем, открыт ли магазин
    const telegramId = Telegram.WebApp.initDataUnsafe?.user?.id;
    displayShop(telegramId);
    document.getElementById("shop").style.display = "flex";
    isShopOpen = true; // Устанавливаем флаг, что магазин открыт
  }
});

// Обработчик события для закрытия магазина
document.getElementById("shop").addEventListener("click", (event) => {
  if (event.target.id === "closeShopButton") {
    document.getElementById("shop").style.display = "none";
    isShopOpen = false; // Сбрасываем флаг, что магазин закрыт
  }
});

const shopHeader = document.querySelector('.shop-header');
const inventory = document.getElementById('inventory');

function adjustInventoryHeight() {
  const shopHeaderHeight = shopHeader?.offsetHeight || 0; // Если shopHeader null, используем 0
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

});

let cloud; // Declare the cloud variable globally
document.addEventListener('DOMContentLoaded', () => {
  let clouds = document.querySelectorAll('.cloud');
  clouds.forEach(cloud => {
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




// Функция для отображения профиля
async function showProfile() {
  const telegramId = Telegram.WebApp.initDataUnsafe?.user?.id || '1';
  const username = Telegram.WebApp.initDataUnsafe?.user?.username || "Не указано";
  const name = (Telegram.WebApp.initDataUnsafe?.user?.first_name || '') + ' ' + (Telegram.WebApp.initDataUnsafe?.user?.last_name || '');

  const profileMenu = document.getElementById('profileMenu');

  try {
    const userData = await getUserData(telegramId);

    if (userData && profileMenu) {
      document.getElementById('profileName').textContent = name;
      document.getElementById('profileTelegramId').textContent = telegramId;
      document.getElementById('profileUsername').textContent = username;
      document.getElementById('profileBalance').textContent = userData.balance;
      document.getElementById('profileCarRef').textContent = userData.car_ref || 0; // Если car_ref нет, выводим 0
      document.getElementById('profileCarTop').textContent = userData.car_top || 0; // Если car_top нет, выводим 0

      profileMenu.style.display = 'block'; // Показываем меню профиля
    } else {
      console.error('Данные пользователя или profileMenu не найдены.');
    }
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const profileButton = document.getElementById('profileButton');
  const profileMenu = document.getElementById('profileMenu');
  const closeProfileButton = document.getElementById('closeProfileButton');

  profileButton.addEventListener('click', showProfile); // Вызываем showProfile при клике на кнопку

  closeProfileButton.addEventListener('click', () => {
    profileMenu.style.display = 'none'; // Скрываем меню профиля при клике на "Закрыть"
  });
});






document.addEventListener('DOMContentLoaded', function() {
  const profileButton = document.getElementById('profileButton');
  const profileMenu = document.getElementById('profileMenu');
  const closeProfileButton = document.getElementById('closeProfileButton');

});


// Вызываем функцию при загрузке страницы или при нажатии на кнопку профиля
showProfile();

console.log(document.getElementById('inventory')); // Должен вывести элемент инвентаря или null
console.log(document.getElementById('shop'));





const playMusicButton = document.getElementById('playMusicButton');
const backgroundMusic = document.getElementById('backgroundMusic');   

const musicIcon = document.getElementById('musicIcon');

playMusicButton.addEventListener('click', () => {
  if (backgroundMusic.paused) {
    backgroundMusic.play();
    musicIcon.src = 'icon_sound_on.png'; // Меняем на иконку "включено"
  } else {
    backgroundMusic.pause();
    musicIcon.src = 'icon_sound_off.png'; // Меняем на иконку "выключено"
  }
});