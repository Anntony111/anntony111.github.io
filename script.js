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

// Массив для хранения купленных машинок
let ownedCars = [];

// Переменные для хранения данных
let balance = 10; // Начальный баланс пользователя
let earnRate = 0;
let topScore = 0;


// Функция для получения изображения машинки по уровню
function getCarImageByLevel(level) {
  if (level <= cars.length) {
      return cars[level - 1].image;
  } else {
      return "default_car_image.png"; // Или другое изображение по умолчанию
  }
}


// Функция для отображения машинок в инвентаре (с поддержкой перетаскивания)
function displayCars() {
  const inventory = document.getElementById("inventory");
  inventory.innerHTML = ""; 

  for (let i = 0; i < 12; i++) {
      const carSlot = document.createElement("div");
      carSlot.classList.add("car-slot");
      carSlot.draggable = true;
      carSlot.dataset.index = i;

      if (ownedCars[i]) {
          let carImage = carSlot.querySelector("img");
          if (!carImage) {
              carImage = document.createElement("img");
              carSlot.appendChild(carImage);
          }
          carImage.src = getCarImageByLevel(ownedCars[i].level);
          carImage.alt = ownedCars[i].name;

          let carLevel = carSlot.querySelector(".car-level");
          if (!carLevel) {
              carLevel = document.createElement("div");
              carLevel.classList.add("car-level");
              carSlot.appendChild(carLevel);
          }
          carLevel.textContent = `Lvl ${ownedCars[i].level}`;
      }

      carSlot.addEventListener("dragstart", dragStart);
      carSlot.addEventListener("dragover", dragOver);
      carSlot.addEventListener("drop", dragDrop);

      inventory.appendChild(carSlot);
  }
}

let draggedCarIndex = null;

function dragStart(event) {
  draggedCarIndex = parseInt(event.target.closest('.car-slot').dataset.index);
  event.dataTransfer.effectAllowed = "move";
}

function dragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
}

function dragDrop(event) {
  event.preventDefault();
  const targetSlot = event.target.closest('.car-slot');
  const targetIndex = parseInt(targetSlot.dataset.index);

  if (draggedCarIndex !== targetIndex) {
      const draggedCar = ownedCars[draggedCarIndex];
      const targetCar = ownedCars[targetIndex];

      if (targetCar && draggedCar.level === targetCar.level) {
          // Объединяем машинки
          ownedCars[targetIndex] = {
              ...draggedCar,
              level: draggedCar.level + 1 // Увеличиваем уровень на 1
          };
          ownedCars[draggedCarIndex] = null; // Удаляем перетаскиваемую машинку
      } else {
          // Просто меняем машинки местами
          [ownedCars[draggedCarIndex], ownedCars[targetIndex]] = [ownedCars[targetIndex], ownedCars[draggedCarIndex]];
      }

      displayCars(); // Перерисовываем инвентарь
      updateEarnRate(); // Обновляем скорость заработка
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
  
// Обработчик события для кнопки "Купить" в магазине
document.getElementById("shop").addEventListener("click", (event) => {
  if (event.target.classList.contains("buy-button")) {
      let occupiedSlots = ownedCars.filter(car => car !== null).length; // Подсчет занятых слотов

      if (occupiedSlots >= 12) {
          alert("Превышен лимит гаража");
          return;
      }

      const carIndex = parseInt(event.target.dataset.carIndex);
      const car = cars[carIndex];

      if (balance >= car.price) {
          balance -= car.price;

          // Находим первый пустой слот
          const emptySlotIndex = ownedCars.indexOf(null);
          if (emptySlotIndex !== -1) {
              ownedCars[emptySlotIndex] = car;
          } else {
              // Если нет пустых слотов, добавляем в конец
              ownedCars.push(car);
          }

          displayCars();
          updateEarnRate();
          updateInfoPanels();
      } else {
          // ... (сообщение о недостатке средств)
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
    shop.innerHTML = `<div class="shop-header"><h2>Магазин</h2></div>`; // Добавляем заголовок

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
  
// Вызываем функции при загрузке страницы
displayCars();
updateInfoPanels();
// animateCars(); // Запустите анимацию, когда она будет готова
