const openBoxButton = document.getElementById("open-box");
const toggleInventoryButton = document.getElementById("toggle-inventory");
const lootBox = document.querySelector(".loot-box");
const lootDisplay = document.getElementById("loot-display");
const inventoryList = document.getElementById("inventory-list");
const inventoryContainer = document.querySelector(".inventory");
const charactersContainer = document.getElementById("characters-container");

let boxCount = 5;
let nextBoxTime = 0;
const itemTypes = ["облик", "эмоции", "победные позы", "лучшие моменты матча", "реплики"];
let currentSelectedCharacter = "Трейсер"; // Персонаж по умолчанию

// Обновленный список персонажей с их реальными именами
const characters = [
    "Трейсер", "Райнхардт", "Заря", "Солдат-76", "Гэндзи", 
    "Хандзо", "Роковая вдова", "Кэссиди", "Эш", "Жнец", 
    "Дива", "Уинстон", "Турбосвин", "Бастион", "Торбьорн", 
    "Симметра", "Сомбра", "Думфист", "Ориса", "Бригитта", 
    "Ана", "Батист", "Кирико", "Лусио", "Ангел", 
    "Мойра", "Зенъятта", "Раматтра", "Эхо", "Сигма"
];

// Информация о ролях персонажей
const characterRoles = {
    "Дива": "танк", "Райнхардт": "танк", "Заря": "танк", "Турбосвин": "танк", "Сигма": "танк", 
    "Уинстон": "танк", "Раматтра": "танк", "Ориса": "танк",
    "Солдат-76": "урон", "Жнец": "урон", "Трейсер": "урон", "Гэндзи": "урон", "Хандзо": "урон", 
    "Роковая вдова": "урон", "Кэссиди": "урон", "Эш": "урон", "Симметра": "урон", "Торбьорн": "урон", 
    "Бастион": "урон", "Думфист": "урон", "Сомбра": "урон", "Эхо": "урон", "Фарра": "урон", "Крысавчик": "урон",
    "Ана": "поддержка", "Ангел": "поддержка", "Лусио": "поддержка", "Зенъятта": "поддержка", 
    "Мойра": "поддержка", "Батист": "поддержка", "Бригитта": "поддержка", "Кирико": "поддержка"
};

// Ссылки на изображения персонажей (здесь используем заглушки, в реальном проекте нужны настоящие ссылки)
const characterImages = {};
characters.forEach(name => {
    characterImages[name] = `images/${name.toLowerCase().replace(/ |:/g, '_')}.jpg`;
});

let inventory = {};

// Инициализация инвентаря
characters.forEach(name => {
    inventory[name] = { common: {}, rare: {}, epic: {}, legendary: {} };
    itemTypes.forEach(type => {
        inventory[name].common[type] = 0;
        inventory[name].rare[type] = 0;
        inventory[name].epic[type] = 0;
        inventory[name].legendary[type] = 0;
    });
});

// Создание сетки с персонажами в инвентаре
function createCharacterGrid() {
    charactersContainer.innerHTML = "";
    
    // Группировка персонажей по ролям
    const tankCharacters = characters.filter(char => characterRoles[char] === "танк");
    const damageCharacters = characters.filter(char => characterRoles[char] === "урон");
    const supportCharacters = characters.filter(char => characterRoles[char] === "поддержка");
    
    // Создание секций по ролям
    createRoleSection("ТАНК", tankCharacters);
    createRoleSection("УРОН", damageCharacters);
    createRoleSection("ПОДДЕРЖКА", supportCharacters);
}

function createRoleSection(roleName, charactersInRole) {
    const roleSection = document.createElement("div");
    roleSection.className = "role-section";
    
    // Заголовок роли
    const roleTitle = document.createElement("h3");
    roleTitle.textContent = roleName;
    roleSection.appendChild(roleTitle);
    
    // Контейнер для карточек персонажей
    const charactersGrid = document.createElement("div");
    charactersGrid.className = "characters-grid";
    
    // Создание карточек для каждого персонажа
    charactersInRole.forEach(character => {
        const charCard = document.createElement("div");
        charCard.className = "character-card";
        charCard.dataset.character = character;
        
        // Если это текущий выбранный персонаж, добавляем класс
        if (character === currentSelectedCharacter) {
            charCard.classList.add("selected");
        }
        
        // Изображение персонажа
        const charImage = document.createElement("div");
        charImage.className = "character-image";
        charImage.style.backgroundImage = `url(${characterImages[character] || 'images/placeholder.jpg'})`;
        
        // Имя персонажа
        const charName = document.createElement("div");
        charName.className = "character-name";
        charName.textContent = character;
        
        // Добавление элементов в карточку
        charCard.appendChild(charImage);
        charCard.appendChild(charName);
        
        // Обработчик клика по персонажу
        charCard.addEventListener("click", () => {
            selectCharacter(character);
        });
        
        charactersGrid.appendChild(charCard);
    });
    
    roleSection.appendChild(charactersGrid);
    charactersContainer.appendChild(roleSection);
}

function selectCharacter(character) {
    // Обновляем текущего выбранного персонажа
    currentSelectedCharacter = character;
    
    // Визуальное выделение выбранного персонажа
    document.querySelectorAll(".character-card").forEach(card => {
        card.classList.remove("selected");
    });
    document.querySelector(`.character-card[data-character="${character}"]`).classList.add("selected");
    
    // Обновление отображения инвентаря
    updateInventoryDisplay();
}

openBoxButton.addEventListener("click", () => {
    if (boxCount > 0) {
        openLootBox();
        boxCount--;
        boxCountDisplay.textContent = boxCount;
        if (boxCount === 0) startCooldown();
    } else {
        alert("Подождите 10 минут для открытия новых контейнеров!");
    }
});

toggleInventoryButton.addEventListener("click", () => {
    inventoryContainer.classList.toggle("show");
    createCharacterGrid();
    updateInventoryDisplay();
});

function getRarity() {
    const chance = Math.random() * 100;
    if (chance <= 5.1) return "legendary";
    if (chance <= 21) return "epic";
    if (chance <= 96) return "rare";
    return "common";
}

function getRandomItem() {
    return {
        rarity: getRarity(),
        itemType: itemTypes[Math.floor(Math.random() * itemTypes.length)],
        character: characters[Math.floor(Math.random() * characters.length)]
    };
}

function openLootBox() {
    lootBox.classList.add("jump");
    setTimeout(() => {
        lootBox.classList.remove("jump");
        lootDisplay.innerHTML = "";

        let newItems = [];
        for (let i = 0; i < 4; i++) newItems.push(getRandomItem());

        newItems.forEach(item => {
            addItemToLootDisplay(item);
            addToInventory(item);
        });

        updateInventoryDisplay();
    }, 500);
}

function addItemToLootDisplay(item) {
    const itemElement = document.createElement("div");
    itemElement.classList.add("item", item.rarity);
    itemElement.textContent = `${item.rarity.toUpperCase()} ${item.itemType} (${item.character})`;
    lootDisplay.appendChild(itemElement);
}

function addToInventory(item) {
    inventory[item.character][item.rarity][item.itemType]++;
}

function updateInventoryDisplay() {
    inventoryList.innerHTML = "";
    const selectedCharacter = currentSelectedCharacter;
    
    // Заголовок с именем выбранного персонажа
    const characterHeader = document.createElement("h3");
    characterHeader.textContent = `Предметы для ${selectedCharacter}`;
    inventoryList.appendChild(characterHeader);
    
    // Создание списка предметов по редкости
    const rarityOrder = ["legendary", "epic", "rare", "common"];
    
    rarityOrder.forEach(rarity => {
        let hasItemsInRarity = false;
        
        // Проверка, есть ли предметы данной редкости
        for (const type in inventory[selectedCharacter][rarity]) {
            if (inventory[selectedCharacter][rarity][type] > 0) {
                hasItemsInRarity = true;
                break;
            }
        }
        
        if (hasItemsInRarity) {
            // Создание заголовка для редкости
            const rarityHeader = document.createElement("div");
            rarityHeader.className = `rarity-header ${rarity}`;
            rarityHeader.textContent = getRarityName(rarity);
            inventoryList.appendChild(rarityHeader);
            
            // Список предметов
            for (const type in inventory[selectedCharacter][rarity]) {
                if (inventory[selectedCharacter][rarity][type] > 0) {
                    const itemElement = document.createElement("div");
                    itemElement.classList.add("item", rarity);
                    itemElement.textContent = `${type}: ${inventory[selectedCharacter][rarity][type]}`;
                    inventoryList.appendChild(itemElement);
                }
            }
        }
    });
    
    // Если у персонажа нет предметов
    if (inventoryList.children.length <= 1) {
        const noItemsMessage = document.createElement("div");
        noItemsMessage.className = "no-items";
        noItemsMessage.textContent = "У этого персонажа пока нет предметов";
        inventoryList.appendChild(noItemsMessage);
    }
}

function getRarityName(rarity) {
    switch(rarity) {
        case "legendary": return "ЛЕГЕНДАРНЫЕ";
        case "epic": return "ЭПИЧЕСКИЕ";
        case "rare": return "РЕДКИЕ";
        case "common": return "ОБЫЧНЫЕ";
        default: return rarity.toUpperCase();
    }
}

function startCooldown() {
    nextBoxTime = Date.now() + 10 * 60 * 1000;
    setTimeout(() => {
        boxCount = 5;
        boxCountDisplay.textContent = boxCount;
    }, 10 * 60 * 1000);
}

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    createCharacterGrid();
    updateInventoryDisplay();
});