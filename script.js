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




// Инициализация Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const dbRef = database.ref();


async function main() {
  const telegramId = Telegram.WebApp.initDataUnsafe?.user?.id || '1';
  const userData = await getUserData(telegramId);

  if (userData) {
    // Пользователь найден, используем его данные
    console.log(userData.balance); // Пример использования данных
    // ...
  } else {
    // Пользователь не найден, создаем новый профиль
    // ...
  }
}

main(); // Вызываем функцию main() для запуска приложения
 


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






// Обновление данных пользователя
async function updateUserData(telegramId, updates) {
  try {
    const userRef = dbRef.child(`users/${telegramId}`);

    // Обновляем каждый слот инвентаря отдельно
    if (updates.inventory) {
      const inventoryRef = userRef.child('inventory');

      for (let i = 0; i < updates.inventory.length; i++) {
        // Преобразуем объект машинки в JSON-строку и сохраняем в отдельный узел
        await inventoryRef.child(i.toString()).set(JSON.stringify(updates.inventory[i])); 
      }

      delete updates.inventory; // Удаляем inventory из общего объекта обновлений
    }

    // Обновляем остальные поля
    await userRef.update(updates);
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error; 
  }
}


const connectingMessage = document.createElement('p');
connectingMessage.textContent = 'Соединение с базой данных...';
document.body.appendChild(connectingMessage); // Добавляем сообщение в DOM


(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  let telegramId = urlParams.get('telegramId') || Telegram.WebApp.initDataUnsafe?.user?.id || '1';

  const username = Telegram.WebApp.initDataUnsafe?.user?.username;
  const name = (Telegram.WebApp.initDataUnsafe?.user?.first_name || '') + ' ' + (Telegram.WebApp.initDataUnsafe?.user?.last_name || '');

  try {
    let userData = await getUserData(telegramId);

    if (!userData) {
      console.log('User not found, creating default profile...');
      const newUserData = {
        telegram_id: telegramId,
        username: username,
        name: name,
        balance: 0,
        inventory: {}, // Создаем пустой объект inventory
        topScore: 0,
        created_at: new Date().toISOString()
      };

      // Заполняем inventory машинами по умолчанию
      for (let i = 0; i < 12; i++) {
        newUserData.inventory[i.toString()] = { level: 0, name: `Car ${i + 1}` };
      }

      await updateUserData(telegramId, newUserData);
      userData = await getUserData(telegramId); // Получаем обновленные данные
      console.log('Default profile created:', userData);
    }

    balance = userData.balance || 0;
    ownedCars = Object.values(userData.inventory); // Преобразуем inventory в массив
    topScore = userData.topScore || 0;

    updateInfoPanels();
    displayCars();

    const welcomeMessageElement = document.getElementById('welcomeMessage');
    if (name) {
      welcomeMessageElement.textContent = `Добро пожаловать, ${name}!`;
    } else {
      welcomeMessageElement.textContent = `Добро пожаловать, пользователь ${telegramId}!`;
    }
  } catch (error) {
    console.error('Ошибка при загрузке данных пользователя:', error);
    alert("Произошла ошибка при загрузке данных. Пожалуйста, попробуйте еще раз.");
  }
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

let ownedCars = new Array(12).fill(null); // Создаем массив из 12 пустых слотов для машинок

// Переменные для хранения данных
let balance = 10;
let earnRate = 0;
let topScore = 0;
let carRef = null;  // Объявляем carRef глобально
let carTop = null

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

        if (targetCar && draggedCar && draggedCar.level === targetCar.level) {
          ownedCars[targetIndex].level++;
          ownedCars[movingCarIndex] = null;
        } else {
          [ownedCars[movingCarIndex], ownedCars[targetIndex]] = [targetCar, draggedCar];
        }

        // Обновляем данные в Firebase Realtime Database
        try {
          const telegramId = Telegram.WebApp.initDataUnsafe?.user?.id;

          // Создаем копию массива ownedCars перед обновлением
          const updatedOwnedCars = [...ownedCars];

          await updateUserData(telegramId, {
            inventory: JSON.stringify(updatedOwnedCars),
          });

        } catch (error) {
          console.error('Ошибка при обновлении данных в базе данных:', error);
          alert("Произошла ошибка при сохранении данных. Пожалуйста, попробуйте еще раз."); 
        }
      }
    }

     // Сбрасываем стили и переменные
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

function earnCoins() {
  balance += earnRate;
  updateInfoPanels();

  const telegramId = Telegram.WebApp.initDataUnsafe?.user?.id;
  updateUserData(telegramId, { balance, inventory: JSON.stringify(ownedCars), topScore, carRef, carTop });
}

setInterval(earnCoins, 60000); // 60000 миллисекунд = 1 минута





  
document.getElementById("shop").addEventListener("click", async (event) => {
  if (event.target.classList.contains("buy-button")) {
      const carIndex = parseInt(event.target.dataset.carIndex);
      const car = cars[carIndex];
      const telegramId = Telegram.WebApp.initDataUnsafe?.user?.id;

      if (balance >= car.price) {
          balance -= car.price;

          const emptySlotIndex = ownedCars.findIndex(slot => slot === null);

          if (emptySlotIndex !== -1) {
              ownedCars[emptySlotIndex] = { ...car };

              // Создаем копию ownedCars перед обновлением
              const updatedOwnedCars = [...ownedCars];

              // Обновляем данные в базе данных с копией
              try {
                  await updateUserData(telegramId, {
                      balance,
                      inventory: JSON.stringify(updatedOwnedCars.slice(0, 12)), // Обрезаем до 12 элементов
                      topScore
                  });

                  displayCars();
                  updateEarnRate();
                  updateInfoPanels();
              } catch (error) {
                  console.error("Ошибка при обновлении данных в базе данных:", error);
                  alert("Произошла ошибка при покупке машинки. Пожалуйста, попробуйте еще раз.");

                  // Восстанавливаем баланс, если обновление не удалось
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

let cloud; // Объявляем переменную cloud глобально

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
      cloud = document.getElementById('cloud');
      requestAnimationFrame(animateCloud);
      const cloud = document.getElementById('cloud');
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
  const backgroundMusic = document.getElementById('backgroundMusic');

  // Проверяем, что элемент audio найден
  if (backgroundMusic) {
    backgroundMusic.volume = 0.1; // Устанавливаем громкость на 10%
    backgroundMusic.play(); // Запускаем воспроизведение
  } else {
    console.error('Audio element not found!'); // Выводим ошибку в консоль, если элемент не найден
  }
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

  try {
    const userData = await getUserData(telegramId);

    if (userData) {
      document.getElementById('profileName').textContent = (Telegram.WebApp.initDataUnsafe?.user?.first_name || '') + ' ' + (Telegram.WebApp.initDataUnsafe?.user?.last_name || '');
      document.getElementById('profileBalance').textContent = userData.balance;
      document.getElementById('profileCarRef').textContent = userData.car_ref;
      document.getElementById('profileCarTop').textContent = userData.car_top;
      // Заполняем остальные поля профиля данными из userData
      
      document.getElementById('profileMenu').style.display = 'block'; // Показываем меню профиля
    } else {
      // Обработка ситуации, когда данные пользователя не найдены в базе данных
      console.error('Данные пользователя не найдены в базе данных.');
      // Можно добавить вывод сообщения пользователю или другие действия
    }
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    // Обработка ошибки (например, вывод сообщения пользователю)
    alert("Произошла ошибка при загрузке профиля. Пожалуйста, попробуйте еще раз.");
  }
  const welcomeMessageElement = document.getElementById('welcomeMessage');
  if (name) {
    welcomeMessageElement.textContent = `Добро пожаловать, ${name}!`;
  } else {
    welcomeMessageElement.textContent = `Добро пожаловать, пользователь ${telegramId}!`;
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

console.log(document.getElementById('inventory')); // Должен вывести элемент инвентаря или null
console.log(document.getElementById('shop'));

document.getElementById('shopButton').addEventListener('click', () => {
  console.log('Shop button clicked'); // Должен вывести сообщение при клике
});

document.addEventListener('DOMContentLoaded', showProfile); // Вызываем showProfile после загрузки DOM
