class Pos {
  constructor(
    id,
    name,
    top,
    left,
    imgUrl = null,
    offsetT = null,
    offsetL = null,
  ) {
    this.id = id;
    this.name = name;
    this.top = top;
    this.left = left;
    this.imgUrl = imgUrl;
    this.offsetT = offsetT; // 自定义视觉top偏移
    this.offsetL = offsetL; // 自定义视觉left偏移
  }
}

class Place extends Pos {
  constructor({
    id,
    name,
    top,
    left,
    imgUrl = null,
    offsetT = null,
    offsetL = null,
    neighbors = [],
  }) {
    super(id, name, top, left, imgUrl, offsetT, offsetL);
    this.neighbors = neighbors;
  }
}

class Character extends Pos {
  constructor({
    id,
    name,
    hp = 100,
    atk = 10,
    speed = 10,
    faction = "无",
    imgUrl = null,
    ai = null,
    isPlayer = false,
    maxCount = 20,
    defaultPlaceId = null,
    creatureId = null,
    spawnWeight = 0,
  }) {
    super(id, name, 0, 0, imgUrl);
    this.hp = hp;
    this.maxHp = hp;
    this.atk = atk;
    this.speed = speed;
    this.nextTurn = 0;
    this.faction = faction;
    this.ai = ai;
    this.isPlayer = isPlayer;
    this.level = 1;
    this.exp = 0;
    this.expToNext = 100;
    this.maxCount = maxCount;
    this.count = isPlayer ? null : maxCount;
    this.defaultPlaceId = defaultPlaceId;
    this.creatureId = creatureId;
    this.spawnWeight = spawnWeight;
    this.pendingRevive = false;
    this.locationId = null;
  }
}

class Building extends Pos {
  constructor(
    id,
    name,
    top,
    left,
    canEnter,
    imgUrl = null,
    offsetT = null,
    offsetL = null,
  ) {
    super(id, name, top, left, imgUrl, offsetT, offsetL);
    this.canEnter = canEnter;
  }
}

class GameMap {
  constructor() {
    // 默认偏移 place/building盒子200px，人物64px → 100‑32 =68
    this.DEFAULT_OFFSET_T = 68;
    this.DEFAULT_OFFSET_L = 68;

    this.places = [];
    this.localPlaces = [];
    this.characters = [];
    this.surroundings = [];
    this.mapDom = document.querySelector(".map-container");
    this.statusDom = document.querySelector(".game-status");
    this.turnDom = document.querySelector(".turn-info");
    this.stockDom = document.querySelector(".character-stock");
    if (this.stockDom) this.stockDom.hidden = true;
    this.entryDom = document.querySelector(".map-entry");
    this.entryNameDom = document.querySelector(".map-entry-name");
    this.enterButton = document.querySelector(".enter-map-button");
    this.leaveButton = document.querySelector(".leave-map-button");
    this.aiTimer = null;
    this.turn = 0;
    this.activeCharacter = null;
    this.lastCountRecovery = Date.now();
    this.attackRange = 480;
    this.localScene = null;
    this.inLocalMap = false;
    this.currentLocalPlace = null;
    this.lastCreatureRecovery = Date.now();
    this.creaturePools = {};
    this.lastSpawnedCreature = {};
    this.creatureDefinitions = {
      fenghuang: {
        name: "凤凰",
        hp: 180,
        atk: 34,
        speed: 9,
        weight: 8,
        maxLevel: 8,
        img: "fenghuang.png",
      },
      wangba: {
        name: "王八",
        hp: 220,
        atk: 30,
        speed: 4,
        weight: 8,
        maxLevel: 8,
        img: "wangba.png",
      },
      baihu: {
        name: "白虎",
        hp: 100,
        atk: 20,
        speed: 7,
        weight: 6,
        maxLevel: 6,
        img: "img_baihu.png",
      },
      laohu: {
        name: "老虎",
        hp: 120,
        atk: 23,
        speed: 8,
        weight: 4,
        maxLevel: 4,
        img: "img_laohu.png",
      },
      beer: {
        name: "熊",
        hp: 150,
        atk: 25,
        speed: 5,
        weight: 4,
        maxLevel: 4,
        img: "beer.png",
      },
      shizi: {
        name: "狮子",
        hp: 130,
        atk: 27,
        speed: 7,
        weight: 4,
        maxLevel: 4,
        img: "img_shizi.png",
      },
      ying: {
        name: "鹰",
        hp: 75,
        atk: 18,
        speed: 12,
        weight: 3,
        maxLevel: 3,
        img: "ying.png",
      },
      lang: {
        name: "狼",
        hp: 80,
        atk: 16,
        speed: 10,
        weight: 2,
        maxLevel: 2,
        img: "img_lang.png",
      },
      cike: {
        name: "刺客",
        hp: 90,
        atk: 22,
        speed: 11,
        weight: 2,
        maxLevel: 2,
        img: "cike.png",
      },
      heibao: {
        name: "黑豹",
        hp: 105,
        atk: 24,
        speed: 10,
        weight: 2,
        maxLevel: 2,
        img: "img_heibao.png",
      },
      heishe: {
        name: "黑蛇",
        hp: 70,
        atk: 15,
        speed: 8,
        weight: 1,
        maxLevel: 1,
        img: "heishe.png",
      },
      dushe: {
        name: "毒蛇",
        hp: 65,
        atk: 19,
        speed: 9,
        weight: 1,
        maxLevel: 1,
        img: "dushe.png",
      },
      baiyuan: {
        name: "白猿",
        hp: 95,
        atk: 17,
        speed: 6,
        weight: 1,
        maxLevel: 1,
        img: "baiyuan.png",
      },
      bianfu: {
        name: "蝙蝠",
        hp: 55,
        atk: 13,
        speed: 13,
        weight: 1,
        maxLevel: 1,
        img: "bianfu.png",
      },
    };
    this.creatureLists = {
      mountain: ["ying", "baiyuan", "lang", "heishe", "fenghuang"],
      town: ["cike", "baiyuan", "heishe", "dushe"],
      forest: ["baihu", "laohu", "lang", "heibao", "ying", "cike"],
      river: ["wangba", "ying", "heishe", "dushe", "baiyuan"],
      inn: ["cike", "heibao", "lang", "baiyuan"],
      cave: ["wangba", "heishe", "dushe", "bianfu", "baiyuan"],
      blood_pond: ["fenghuang", "shizi", "heibao", "dushe", "heishe"],
    };
    Object.keys(this.creatureLists).forEach((placeId) => {
      this.creaturePools[placeId] = {
        current: 20,
        max: 20,
        remaining: 20,
      };
    });
    this.enterButton?.addEventListener("click", () => {
      if (this.currentLocalPlace) this._enterLocalMap(this.currentLocalPlace);
    });
    this.leaveButton?.addEventListener("click", () => this._leaveLocalMap());
    this.sounds = {
      playerAttack: new Audio("src/audio/atk_pugong.mp3"),
      enemyAttack: new Audio("src/audio/atk_pugong.mp3"),
      move: new Audio("src/audio/qinggong.mp3"),
    };
    Object.values(this.sounds).forEach((sound) => {
      sound.preload = "auto";
    });
    this.countRecoveryTimer = window.setInterval(() => {
      this._recoverCounts();
      this._updateStockPanel();
    }, 1000);
  }

  addPlace(obj) {
    this.places.push(obj);
    this.renderPlace(obj);
  }

  addCharacter(obj, placeName = null) {
    if (placeName !== null) {
      const place = this.places.find(
        (item) => item.name === placeName || item.id === placeName,
      );
      if (!place) {
        throw new Error(`找不到地点：${placeName}`);
      }

      const spawnPlace = this._occupant(place.id)
        ? this.places.find((candidate) => !this._occupant(candidate.id))
        : place;
      if (!spawnPlace) {
        throw new Error(`${obj.name} 没有可用的生成地点`);
      }
      if (spawnPlace !== place) {
        this._setStatus(
          `${place.name} 已被占用，${obj.name} 改在 ${spawnPlace.name} 生成`,
        );
      }
      this._moveCharacter(obj, spawnPlace);
      if (obj.defaultPlaceId === null) obj.defaultPlaceId = spawnPlace.id;
    }

    this.characters.push(obj);
    if (obj.isPlayer || this.inLocalMap) this.renderCharacter(obj);
    this._updateStockPanel();
    if (obj.isPlayer) this._startTurnSystem();
  }

  addBuilding(obj) {
    this.surroundings.push(obj);
    this.renderBuilding(obj);
  }

  _renderContent(obj) {
    if (obj instanceof Character) {
      return `<img class="map" src="${obj.imgUrl}" alt="${obj.name}" draggable="false">`;
    }
    if (obj.imgUrl != null) {
      return `<img class="map" src="${obj.imgUrl}" alt="${obj.name}" draggable="false">
      <div class="label">${obj.name}</div>`;
    }
    return `<div class="label">${obj.name}</div>`;
  }

  _createElement(obj, className) {
    const element = document.createElement("div");
    element.className = className;
    element.id = obj.id;
    element.style.top = `${obj.top}px`;
    element.style.left = `${obj.left}px`;
    element.innerHTML = this._renderContent(obj);
    return element;
  }

  _getPlace(placeId) {
    return (
      this.localPlaces.find((place) => place.id === placeId) ??
      this.places.find((place) => place.id === placeId)
    );
  }

  _isNearby(first, second) {
    if (!first || !second) return false;
    if (first.locationId === second.locationId) return true;
    const firstPlace = this._getPlace(first.locationId);
    const secondPlace = this._getPlace(second.locationId);
    if (!firstPlace || !secondPlace) return false;
    const distance = Math.hypot(
      firstPlace.left - secondPlace.left,
      firstPlace.top - secondPlace.top,
    );
    return distance <= this.attackRange;
  }

  _placeDistance(first, second) {
    return Math.hypot(first.left - second.left, first.top - second.top);
  }

  _occupant(placeId, except = null) {
    return this.characters.find(
      (character) =>
        character !== except &&
        character.locationId === placeId &&
        character.hp > 0 &&
        (this.inLocalMap || character.isPlayer),
    );
  }

  _moveCharacter(character, target) {
    const occupiedBy = this._occupant(target.id, character);
    if (occupiedBy) {
      this._setStatus(`${target.name} 已有 ${occupiedBy.name}，无法到达`);
      return false;
    }

    character.locationId = target.id;
    character.top = target.top + (target.offsetT ?? this.DEFAULT_OFFSET_T);
    character.left = target.left + (target.offsetL ?? this.DEFAULT_OFFSET_L);
    const element = document.getElementById(character.id);
    if (element) {
      element.style.top = `${character.top}px`;
      element.style.left = `${character.left}px`;
      this.mapDom.appendChild(element);
    }
    return true;
  }

  _movePlayerTo(target) {
    const player = this.characters.find(
      (character) => character.id === "player1",
    );
    if (!player || player.hp <= 0) return;
    if (!this._canAct(player)) return;
    if (this._moveCharacter(player, target)) {
      this._playSound("move");
      this._setStatus(`主角到达了 ${target.name}`);
      this.currentLocalPlace = target;
      if (this.entryDom && this.entryNameDom) {
        this.entryNameDom.textContent = target.name;
        this.entryDom.hidden = false;
      }
      this._endTurn(player);
    }
  }

  _moveLocalCharacter(character, target) {
    const occupiedBy = this._occupant(target.id, character);
    if (occupiedBy) {
      this._setStatus(`${target.name} 已有 ${occupiedBy.name}，无法到达`);
      return false;
    }
    character.locationId = target.id;
    character.top = target.top + this.DEFAULT_OFFSET_T;
    character.left = target.left + this.DEFAULT_OFFSET_L;
    const element = document.getElementById(character.id);
    if (element) {
      element.hidden = false;
      element.style.top = `${character.top}px`;
      element.style.left = `${character.left}px`;
      this.mapDom.appendChild(element);
    }
    return true;
  }

  _moveLocalPlayerTo(target) {
    const player = this.characters.find((character) => character.isPlayer);
    if (!player || !this._canAct(player)) return;
    const current = this._getPlace(player.locationId);
    if (current && !current.neighbors.includes(target.id)) {
      this._setStatus(`${target.name} 不在当前建筑的通路上`);
      return;
    }
    if (this._moveLocalCharacter(player, target)) {
      this._playSound("move");
      this._setStatus(`主角到达了 ${target.name}`);
      this._endTurn(player);
      this._updateReachableLocalPlaces();
    }
  }

  _updateReachableLocalPlaces() {
    if (!this.inLocalMap) return;
    const player = this.characters.find((character) => character.isPlayer);
    const current = this._getPlace(player?.locationId);
    const reachable = new Set(current?.neighbors ?? []);
    this.localPlaces.forEach((localPlace) => {
      const element = document.getElementById(`local-${localPlace.id}`);
      const occupied = Boolean(this._occupant(localPlace.id, player));
      if (element)
        element.classList.toggle(
          "reachable",
          reachable.has(localPlace.id) && !occupied,
        );
    });
  }

  attack(attacker, defender) {
    if (!this._canAct(attacker)) return false;
    if (
      attacker.hp <= 0 ||
      defender.hp <= 0 ||
      !this._isNearby(attacker, defender)
    ) {
      this._setStatus("目标不在攻击范围内");
      return false;
    }
    if (attacker.faction !== "无" && attacker.faction === defender.faction) {
      this._setStatus(`${attacker.name} 不会攻击同阵营的 ${defender.name}`);
      return false;
    }

    this._playSound(attacker.id === "player1" ? "playerAttack" : "enemyAttack");
    defender.hp = Math.max(0, defender.hp - attacker.atk);
    this._updateCharacterElement(defender);
    const result = `${attacker.name} 攻击 ${defender.name}，造成 ${attacker.atk} 点伤害（${defender.hp}/${defender.maxHp}）`;
    if (defender.hp === 0) {
      if (attacker.id === "player1" && defender.id !== "player1") {
        this._gainExperience(attacker, 50);
      }
      if (defender.id === "player1") {
        this._respawnPlayerAtTown();
        this._setStatus(
          `${result}，主角已在${this._getPlace("town").name}复活`,
        );
      } else {
        const worldPlaceId = defender.id.split("-")[0];
        const pool = this.creaturePools[worldPlaceId];
        if (pool) pool.remaining = Math.max(0, pool.remaining - 1);
        defender.pendingRevive = defender.count > 0;
        defender.reviveAtTurn = this.turn + 2 + Math.floor(Math.random() * 5);
        if (defender.count > 0) defender.count -= 1;
        this._removeCharacterElement(defender);
        this._updateStockPanel();
        this._setStatus(
          `${result}，${defender.name} 已倒下，将在1回合后复活（剩余 ${defender.count}）`,
        );
      }
    } else {
      this._setStatus(result);
    }
    return true;
  }

  _gainExperience(character, amount) {
    character.exp += amount;
    while (character.exp >= character.expToNext) {
      character.exp -= character.expToNext;
      character.level += 1;
      character.expToNext = Math.floor(character.expToNext * 1.25);
      character.maxHp += 20;
      character.atk += 3;
      character.hp = character.maxHp;
      this._setStatus(
        `${character.name} 击杀敌人，升到 ${character.level} 级（攻击 ${character.atk}）`,
      );
    }
    this._updateCharacterElement(character);
  }

  _canAct(character) {
    if (this.activeCharacter === character) return true;
    if (character.isPlayer) {
      this._setStatus(
        `当前是 ${this.activeCharacter?.name ?? "其他角色"} 的回合，请等待`,
      );
    }
    return false;
  }

  _endTurn(character) {
    if (this.activeCharacter !== character) return;
    if (character.isPlayer) {
      character.hp = Math.min(
        character.maxHp,
        character.hp + Math.max(1, Math.floor(character.maxHp * 0.1)),
      );
      this._updateCharacterElement(character);
    }
    character.nextTurn =
      this.turn + Math.max(1, Math.ceil(10 / character.speed));
    this.activeCharacter = null;
    this._grantNextTurn();
  }

  _respawnPlayerAtTown() {
    const player = this.characters.find((character) => character.isPlayer);
    const town = this.places.find((place) => place.id === "town");
    if (!player || !town) return;
    if (this.inLocalMap) this._leaveLocalMap();
    player.hp = player.maxHp;
    player.locationId = null;
    this._moveCharacter(player, town);
    player.defaultPlaceId = town.id;
    const element = document.getElementById(player.id);
    if (element) element.hidden = false;
    this._updateCharacterElement(player);
  }

  _grantNextTurn() {
    const candidates = this.characters.filter(
      (character) =>
        character.hp > 0 &&
        !character.pendingRevive &&
        (character.isPlayer || this.inLocalMap),
    );
    if (!candidates.length) return;
    const nextCharacter = candidates.reduce((current, character) =>
      character.nextTurn < current.nextTurn ? character : current,
    );
    this.turn = Math.max(this.turn + 1, nextCharacter.nextTurn);
    this.characters.forEach((character) => {
      if (
        character.pendingRevive &&
        character.count !== null &&
        character.reviveAtTurn <= this.turn
      ) {
        if (this._reviveCharacter(character)) character.pendingRevive = false;
      }
    });
    this.activeCharacter = nextCharacter;
    this._updateTurnPanel();
    if (nextCharacter.ai) {
      window.setTimeout(() => this._takeAiTurn(nextCharacter), 250);
    }
  }

  _reviveCharacter(character) {
    const localMode = this.inLocalMap;
    const defaultPlace = localMode
      ? this.localPlaces[0]
      : this._getPlace(character.defaultPlaceId);
    const revivePlaces = localMode ? this.localPlaces : this.places;
    const availablePlaces = revivePlaces.filter(
      (place) =>
        place.id !== character.locationId &&
        !this._occupant(place.id, character),
    );
    const candidates = [
      defaultPlace,
      ...availablePlaces.filter((place) => place !== defaultPlace),
    ].filter(Boolean);
    for (const target of candidates) {
      const moved = localMode
        ? this._moveLocalCharacter(character, target)
        : this._moveCharacter(character, target);
      if (moved) {
        character.hp = character.maxHp;
        this.renderCharacter(character);
        this._updateCharacterElement(character);
        return true;
      }
    }
    character.reviveAtTurn = this.turn + 1;
    return false;
  }

  _takeAiTurn(character) {
    if (this.activeCharacter !== character || character.hp <= 0) return;
    const place = this._getPlace(character.locationId);
    const player = this.characters.find(
      (item) => item.id === "player1" && item.hp > 0,
    );
    if (player && this._isNearby(character, player)) {
      this.attack(character, player);
      this._endTurn(character);
      return;
    }
    const playerPlace = this._getPlace(player?.locationId);
    const destinations = (place?.neighbors ?? [])
      .map((id) => this._getPlace(id))
      .filter(
        (destination) =>
          destination && !this._occupant(destination.id, character),
      );
    if (destinations.length && playerPlace) {
      destinations.sort(
        (first, second) =>
          this._placeDistance(first, playerPlace) -
          this._placeDistance(second, playerPlace),
      );
      const moved = this.inLocalMap
        ? this._moveLocalCharacter(character, destinations[0])
        : this._moveCharacter(character, destinations[0]);
      if (moved) this._playSound("move");
    }
    this._endTurn(character);
  }

  _updateTurnPanel() {
    if (!this.turnDom || !this.activeCharacter) return;
    this.turnDom.textContent = `回合 ${this.turn}｜当前行动：${this.activeCharacter.name}（速度 ${this.activeCharacter.speed}）`;
  }

  _playSound(name) {
    const sound = this.sounds[name];
    if (!sound) return;
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  _buildLocalPlaces(worldPlace) {
    const layouts = {
      mountain: [
        ["grove", "林间空地", 370, 35, "tree.png"],
        ["cliff", "山崖", 70, 500, "mountain.png"],
        ["stream", "溪边", 40, 270, "waterfall.png"],
        ["shrine", "石台", 350, 420, "rock.png"],
        ["hall", "古殿", 760, 245, "tree.png"],
        ["well", "古井", 60, 28, "rock.png"],
      ],
      town: [
        ["grove", "林间空地", 40, 25, "tree.png"],
        ["stream", "溪边", 350, 250, "waterfall.png"],
        ["shrine", "石台", 700, 35, "rock.png"],
        ["cliff", "山崖", 70, 520, "mountain.png"],
        ["pond", "血池", 720, 520, "mountain.png"],
      ],
      forest: [
        ["grove", "林间空地", 330, 30, "tree.png"],
        ["cliff", "山崖", 50, 500, "mountain.png"],
        ["stream", "溪边", 300, 260, "waterfall.png"],
        ["shrine", "石台", 620, 420, "rock.png"],
        ["hall", "古殿", 780, 180, "tree.png"],
        ["well", "古井", 50, 80, "rock.png"],
      ],
      river: [
        ["stream", "溪边", 60, 200, "waterfall.png"],
        ["grove", "林间空地", 380, 40, "tree.png"],
        ["cliff", "山崖", 760, 120, "mountain.png"],
        ["shrine", "石台", 260, 440, "rock.png"],
        ["pond", "血池", 700, 480, "mountain.png"],
      ],
      inn: [
        ["well", "古井", 60, 50, "rock.png"],
        ["grove", "林间空地", 400, 20, "tree.png"],
        ["cliff", "山崖", 760, 120, "mountain.png"],
        ["shrine", "石台", 180, 430, "rock.png"],
        ["stream", "溪边", 520, 480, "waterfall.png"],
      ],
      cave: [
        ["cliff", "山崖", 60, 60, "mountain.png"],
        ["grove", "林间空地", 400, 80, "tree.png"],
        ["shrine", "石台", 750, 80, "rock.png"],
        ["stream", "溪边", 200, 330, "waterfall.png"],
        ["tower", "积雷塔", 550, 380, "waterfall.png"],
        ["pond", "血池", 800, 480, "mountain.png"],
      ],
      blood_pond: [
        ["pond", "血池", 400, 20, "mountain.png"],
        ["cliff", "山崖", 760, 250, "mountain.png"],
        ["shrine", "石台", 400, 400, "rock.png"],
        ["stream", "溪边", 50, 450, "waterfall.png"],
        ["grove", "林间空地", 60, 80, "tree.png"],
      ],
    };
    const extraBuildings =
      worldPlace.id === "town"
        ? [
            ["camp", "临时营地", 360, 20, "tree.png"],
            ["shoal", "浅滩", 350, 520, "waterfall.png"],
            ["rocks", "乱石坡", 700, 270, "rock.png"],
            ["outpost", "边寨", 60, 270, "mountain.png"],
          ]
        : [
            ["camp", "临时营地", 520, 190, "tree.png"],
            ["shoal", "浅滩", 300, 690, "waterfall.png"],
            ["rocks", "乱石坡", 820, 350, "rock.png"],
            ["outpost", "边寨", 680, 20, "mountain.png"],
          ];
    const layout = [
      ...(layouts[worldPlace.id] ?? layouts.mountain),
      ...extraBuildings,
    ];
    const seed = [...worldPlace.id].reduce(
      (total, letter) => total + letter.charCodeAt(0),
      0,
    );
    const nodes = layout.map(([id, name, left, top, image], index) => {
      const horizontalJitter = Math.round(
        (Math.sin(seed * 11 + index * 17) * 0.5 + 0.5) * 60 - 30,
      );
      const verticalJitter = Math.round(
        (Math.cos(seed * 7 + index * 23) * 0.5 + 0.5) * 60 - 30,
      );
      return {
        id: `${worldPlace.id}-${id}`,
        name,
        top: Math.max(0, top + verticalJitter),
        left: Math.max(0, left + horizontalJitter),
        imgUrl: `src/building/${image}`,
        neighbors: [],
      };
    });
    nodes.forEach((node, index) => {
      const originalLeft = node.left;
      const originalTop = node.top;
      let bestPosition = null;
      for (let row = 0; row <= 35; row += 1) {
        for (let column = 0; column <= 35; column += 1) {
          const left = column * 24;
          const top = row * 24;
          const overlaps = nodes
            .slice(0, index)
            .some(
              (other) =>
                left < other.left + 200 &&
                left + 200 > other.left &&
                top < other.top + 200 &&
                top + 200 > other.top,
            );
          if (overlaps) continue;
          const distance = Math.hypot(left - originalLeft, top - originalTop);
          if (!bestPosition || distance < bestPosition.distance) {
            bestPosition = { left, top, distance };
          }
        }
      }
      if (bestPosition) {
        node.left = bestPosition.left;
        node.top = bestPosition.top;
      }
    });
    const connect = (first, second) => {
      if (!first.neighbors.includes(second.id)) first.neighbors.push(second.id);
      if (!second.neighbors.includes(first.id)) second.neighbors.push(first.id);
    };
    for (let firstIndex = 0; firstIndex < nodes.length; firstIndex += 1) {
      for (
        let secondIndex = firstIndex + 1;
        secondIndex < nodes.length;
        secondIndex += 1
      ) {
        const first = nodes[firstIndex];
        const second = nodes[secondIndex];
        if (Math.hypot(first.left - second.left, first.top - second.top) <= 420)
          connect(first, second);
      }
    }
    const connected = new Set([nodes[0].id]);
    while (connected.size < nodes.length) {
      let closestPair = null;
      nodes.forEach((first) => {
        if (!connected.has(first.id)) return;
        nodes.forEach((second) => {
          if (connected.has(second.id)) return;
          const distance = Math.hypot(
            first.left - second.left,
            first.top - second.top,
          );
          if (!closestPair || distance < closestPair.distance)
            closestPair = { first, second, distance };
        });
      });
      if (!closestPair) break;
      connect(closestPair.first, closestPair.second);
      connected.add(closestPair.second.id);
    }
    return nodes.map((node) => new Place(node));
  }

  _enterLocalMap(place) {
    this.inLocalMap = true;
    this._clearLocalCreatures();
    if (!this.localScene) {
      this.localScene = document.createElement("div");
      this.localScene.className = "local-scene";
      this.mapDom.appendChild(this.localScene);
    }
    this.localPlaces = this._buildLocalPlaces(place);
    this.localScene.innerHTML = `<div class="local-scene-title">${place.name}</div>`;
    this.localPlaces.forEach((localPlace, index) => {
      const element = document.createElement("div");
      element.className = "place local-place";
      element.id = `local-${localPlace.id}`;
      element.style.setProperty("--float-delay", `${(index % 4) * 0.18}s`);
      element.style.left = `${localPlace.left}px`;
      element.style.top = `${localPlace.top}px`;
      element.innerHTML = `<img class="map" src="${localPlace.imgUrl}" alt="">`;
      element.addEventListener("click", (event) => {
        event.stopPropagation();
        this._moveLocalPlayerTo(localPlace);
      });
      this.localScene.appendChild(element);
    });
    this.localScene.hidden = false;
    this.mapDom.classList.add("local-mode");
    this.mapDom
      .querySelectorAll(":scope > .place, :scope > .building")
      .forEach((element) => {
        element.hidden = true;
      });
    const player = this.characters.find((character) => character.isPlayer);
    if (player) this._moveLocalCharacter(player, this.localPlaces[0]);
    this._spawnLocalCreatures(place.id);
    this.characters.forEach((character) => {
      const element = document.getElementById(character.id);
      if (!element) return;
      const isHere = character.hp > 0;
      element.hidden = !isHere;
    });
    this._updateReachableLocalPlaces();
    if (this.entryDom) this.entryDom.hidden = true;
    if (this.leaveButton) this.leaveButton.hidden = false;
    this._updateStockPanel();
    this._setStatus(`已进入 ${place.name}`);
  }

  _leaveLocalMap() {
    this.inLocalMap = false;
    this.localScene?.setAttribute("hidden", "");
    this.mapDom.classList.remove("local-mode");
    const player = this.characters.find((character) => character.isPlayer);
    if (player && this.currentLocalPlace)
      player.locationId = this.currentLocalPlace.id;
    this.mapDom
      .querySelectorAll(":scope > .place, :scope > .building")
      .forEach((element) => {
        element.hidden = false;
      });
    this.characters
      .filter((character) => !character.isPlayer)
      .forEach((character) => {
        this._removeCharacterElement(character);
        character.locationId =
          this.currentLocalPlace?.id ?? character.defaultPlaceId;
      });
    this.localPlaces = [];
    this.characters.forEach((character) => {
      const element = document.getElementById(character.id);
      if (!element) return;
      element.hidden = character.hp <= 0 || !character.isPlayer;
      const place = character.isPlayer ? this.currentLocalPlace : null;
      if (place) {
        element.style.left = `${place.left + (place.offsetL ?? this.DEFAULT_OFFSET_L)}px`;
        element.style.top = `${place.top + (place.offsetT ?? this.DEFAULT_OFFSET_T)}px`;
      }
    });
    if (this.leaveButton) this.leaveButton.hidden = true;
    this._updateStockPanel();
    this._setStatus("已返回大地图");
  }

  _recoverCounts() {
    const now = Date.now();
    if (now - this.lastCountRecovery >= 5 * 60 * 1000) {
      this.characters.forEach((character) => {
        if (character.count !== null) {
          character.count = Math.min(character.maxCount, character.count + 1);
          this._updateCharacterElement(character);
        }
      });
      this.lastCountRecovery = now;
    }
    if (now - this.lastCreatureRecovery >= 5 * 60 * 1000) {
      Object.values(this.creaturePools).forEach((pool) => {
        pool.current = Math.min(pool.max, pool.current + 1);
        pool.remaining = Math.min(pool.max, pool.remaining + 1);
      });
      this.lastCreatureRecovery = now;
    }
    this._updateStockPanel();
  }

  _clearLocalCreatures() {
    this.characters
      .filter((character) => !character.isPlayer)
      .forEach((character) => this._removeCharacterElement(character));
    this.characters = this.characters.filter((character) => character.isPlayer);
  }

  _spawnLocalCreatures(worldPlaceId) {
    const pool = this.creaturePools[worldPlaceId];
    const list = this.creatureLists[worldPlaceId] ?? [];
    if (!pool || !list.length) return;
    const freePlaces = [...this.localPlaces].slice(1);
    const spawned = [];
    while (spawned.length < 3 && freePlaces.length) {
      const candidates = list
        .map((creatureId) => ({
          id: creatureId,
          definition: this.creatureDefinitions[creatureId],
        }))
        .filter(
          ({ definition }) => definition && definition.weight <= pool.current,
        )
        .filter(({ id, definition }) => {
          const previous = this.lastSpawnedCreature[worldPlaceId];
          return !previous || previous !== id || definition.weight <= 2;
        });
      if (!candidates.length) break;
      const totalWeight = candidates.reduce(
        (total, candidate) => total + candidate.definition.weight,
        0,
      );
      let roll = Math.random() * totalWeight;
      const definition = candidates.find((candidate) => {
        roll -= candidate.definition.weight;
        return roll <= 0;
      }).definition;
      const place = freePlaces.shift();
      const creatureId = Object.keys(this.creatureDefinitions).find(
        (id) => this.creatureDefinitions[id] === definition,
      );
      const character = new Character({
        id: `${worldPlaceId}-${creatureId}-${this.turn}-${spawned.length}`,
        name: definition.name,
        hp: definition.hp,
        atk: definition.atk,
        speed: definition.speed,
        faction: "野兽",
        imgUrl: `src/character/${definition.img}`,
        ai: "hunt",
        maxCount: 20,
        creatureId,
        spawnWeight: definition.weight,
      });
      character.level = 1 + Math.floor(Math.random() * definition.maxLevel);
      character.maxHp = Math.round(definition.hp * (1 + 0.25 * (character.level - 1)));
      character.hp = character.maxHp;
      character.atk = Math.round(definition.atk * (1 + 0.18 * (character.level - 1)));
      character.speed = definition.speed + Math.floor((character.level - 1) / 2);
      character.expToNext = 100 * character.level;
      character.locationId = place.id;
      character.defaultPlaceId = place.id;
      character.nextTurn = this.turn + spawned.length + 1;
      pool.current -= definition.weight;
      this.lastSpawnedCreature[worldPlaceId] = creatureId;
      this.characters.push(character);
      this._moveLocalCharacter(character, place);
      this.renderCharacter(character);
      this._updateStockPanel();
      spawned.push(character);
    }
  }

  _updateStockPanel() {
    if (!this.stockDom) return;
    this.stockDom.hidden = !this.inLocalMap;
    if (!this.inLocalMap) return;
    const remaining = Math.max(
      0,
      5 * 60 * 1000 - (Date.now() - this.lastCreatureRecovery),
    );
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    const pools = Object.entries(this.creaturePools)
      .filter(
        ([placeId]) =>
          this.inLocalMap && placeId === this.currentLocalPlace?.id,
      )
      .map(
        ([, pool]) =>
          `<div>本地图剩余生物数量${pool.remaining}，下次恢复时间${minutes}:${seconds}</div>`,
      );
    this.stockDom.innerHTML = pools.join("");
  }

  _updateCharacterElement(character) {
    const element = document.getElementById(character.id);
    if (!element) return;
    element.classList.toggle("defeated", character.hp <= 0);
    element.title = `${character.name}｜阵营：${character.faction}｜等级：${character.level}｜速度：${character.speed}｜点击攻击`;
    const name = element.querySelector(".character-name");
    if (name) name.textContent = `${character.name} Lv.${character.level}`;
    const health = element.querySelector(".health");
    const healthFill = element.querySelector(".health-fill");
    const exp = element.querySelector(".exp");
    const expFill = element.querySelector(".exp-fill");
    if (health) {
      health.textContent = `${character.hp}/${character.maxHp}`;
    }
    if (healthFill) {
      healthFill.style.width = `${Math.max(0, character.hp / character.maxHp) * 100}%`;
    }
    if (exp) exp.textContent = `${character.exp}/${character.expToNext}`;
    if (expFill)
      expFill.style.width = `${Math.max(0, character.exp / character.expToNext) * 100}%`;
  }

  _removeCharacterElement(character) {
    this.mapDom.querySelectorAll(".player").forEach((element) => {
      if (element.id === character.id) element.remove();
    });
  }

  _setStatus(message) {
    if (this.statusDom) this.statusDom.textContent = message;
  }

  _startTurnSystem() {
    if (this.aiTimer) return;
    this.aiTimer = true;
    this._grantNextTurn();
  }

  renderPlace(obj) {
    const element = this._createElement(obj, "place");
    element.addEventListener("click", () => this._movePlayerTo(obj));
    this.mapDom.appendChild(element);
  }

  renderCharacter(char) {
    this._removeCharacterElement(char);
    const element = this._createElement(char, "player");
    element.title = `${char.name}｜阵营：${char.faction}｜等级：${char.level}｜速度：${char.speed}｜点击攻击`;
    element.innerHTML += `<div class="character-info"><span class="character-name">${char.name} Lv.${char.level}</span><div class="health-bar"><div class="health-fill" style="width:${Math.max(0, char.hp / char.maxHp) * 100}%"></div><span class="health">${char.hp}/${char.maxHp}</span></div><div class="exp-bar"><div class="exp-fill" style="width:${Math.max(0, char.exp / char.expToNext) * 100}%"></div><span class="exp">${char.exp}/${char.expToNext}</span></div></div>`;
    element.addEventListener("click", (event) => {
      event.stopPropagation();
      if (char.hp <= 0) return;
      const player = this.characters.find(
        (character) => character.id === "player1",
      );
      if (player && char !== player && this.attack(player, char))
        this._endTurn(player);
    });
    this.mapDom.appendChild(element);
  }

  renderBuilding(build) {
    const element = this._createElement(build, "building");
    element.addEventListener("click", () => this._movePlayerTo(build));
    this.mapDom.appendChild(element);
  }
}
