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
  constructor(
    id,
    name,
    top,
    left,
    imgUrl = null,
    offsetT = null,
    offsetL = null,
  ) {
    super(id, name, top, left, imgUrl, offsetT, offsetL);
  }
}

class Character extends Pos {
  constructor(id, name, top, left, hp, atk, imgUrl = null) {
    super(id, name, top, left, imgUrl);
    this.hp = hp;
    this.atk = atk;
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
    this.characters = [];
    this.surroundings = [];
    this.mapDom = document.querySelector(".map-container");
  }

  addPlace(obj) {
    this.places.push(obj);
    this.renderPlace(obj);
  }

  addCharacter(obj) {
    this.characters.push(obj);
    this.renderCharacter(obj);
  }

  addBuilding(obj) {
    this.surroundings.push(obj);
    this.renderBuilding(obj);
  }

  _renderContent(obj) {
    if (obj instanceof Character) {
      return `<div style="width:100%;height:100%;display:flex;justify-content:center;align-items:center;">
      <img class="map" src="${obj.imgUrl}" alt="${obj.name}">
    </div>`;
    }
    if (obj.imgUrl != null) {
      return `<div style="width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;">
      <img class="map" src="${obj.imgUrl}" alt="${obj.name}">
      <div>${obj.name}</div>
    </div>`;
    } else {
      return `<div style="width:100%;height:100%;display:flex;justify-content:center;align-items:center;">${obj.name}</div>`;
    }
  }

  renderPlace(obj) {
    const div = document.createElement("div");
    div.className = "place";
    div.id = obj.id;
    div.style.top = obj.top + "px";
    div.style.left = obj.left + "px";
    div.innerHTML = this._renderContent(obj);

    div.addEventListener("click", () => {
      const player = this.characters[0];
      if (player) {
        const offT = obj.offsetT !== null ? obj.offsetT : this.DEFAULT_OFFSET_T;
        const offL = obj.offsetL !== null ? obj.offsetL : this.DEFAULT_OFFSET_L;
        player.top = obj.top + offT;
        player.left = obj.left + offL;
        const playerDom = document.getElementById(player.id);
        if (playerDom) {
          playerDom.style.top = player.top + "px";
          playerDom.style.left = player.left + "px";
          playerDom.parentNode.appendChild(playerDom);
        }
        alert(`你到达了 ${obj.name}`);
      }
    });
    this.mapDom.appendChild(div);
  }

  renderCharacter(char) {
    const div = document.createElement("div");
    div.className = "player";
    div.id = char.id;
    div.style.top = char.top + "px";
    div.style.left = char.left + "px";
    div.innerHTML = this._renderContent(char);
    this.mapDom.appendChild(div);
  }

  renderBuilding(build) {
    const div = document.createElement("div");
    div.className = "building";
    div.id = build.id;
    div.style.top = build.top + "px";
    div.style.left = build.left + "px";
    div.innerHTML = this._renderContent(build);
    div.addEventListener("click", () => {
      const player = this.characters[0];
      if (player) {
        const offT =
          build.offsetT !== null ? build.offsetT : this.DEFAULT_OFFSET_T;
        const offL =
          build.offsetL !== null ? build.offsetL : this.DEFAULT_OFFSET_L;
        player.top = build.top + offT;
        player.left = build.left + offL;
        const playerDom = document.getElementById(player.id);
        if (playerDom) {
          playerDom.style.top = player.top + "px";
          playerDom.style.left = player.left + "px";
          playerDom.parentNode.appendChild(playerDom);
        }
        alert(`你到达了 ${build.name}`);
      }
    });
    this.mapDom.appendChild(div);
  }
}

const gameMap = new GameMap();

gameMap.addPlace(
  new Place("mountain", "青云山", 20, 450, "src/building/greenmountion.png"),
);
gameMap.addPlace(
  new Place("town", "青石小镇", 220, 80, "src/building/town (2).png"),
);
gameMap.addPlace(
  new Place("forest", "黑风密林", 220, 820, "src/building/tree2.png"),
);
gameMap.addPlace(
  new Place("river", "忘忧瀑布", 420, 450, "src/building/waterfall.png"),
);
gameMap.addPlace(
  new Place("inn", "积雷塔", 620, 80, "src/building/tower.png", 68, 90),
);
gameMap.addPlace(
  new Place("cave", "古树", 620, 820, "src/building/red_tree (2).png"),
);
gameMap.addPlace(
  new Place("blood_pond", "血池", 420, 820, "src/building/blood_pond.png"),
);

gameMap.addCharacter(
  new Character(
    "player1",
    "主角",
    220 + 68,
    80 + 68,
    100,
    12,
    "src/character/major_character.png",
  ),
);
