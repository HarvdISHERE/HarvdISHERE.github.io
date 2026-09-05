const gameMap = new GameMap();

const places = [
  {
    id: "mountain",
    name: "青云山",
    top: 20,
    left: 450,
    imgUrl: "src/building/greenmountion.png",
    neighbors: ["town", "river"],
  },
  {
    id: "town",
    name: "清风小镇",
    top: 220,
    left: 80,
    imgUrl: "src/building/town (2).png",
    neighbors: ["mountain", "forest", "river"],
  },
  {
    id: "forest",
    name: "黑风密林",
    top: 220,
    left: 820,
    imgUrl: "src/building/tree2.png",
    neighbors: ["town", "river", "cave"],
  },
  {
    id: "river",
    name: "忘忧瀑布",
    top: 420,
    left: 450,
    imgUrl: "src/building/waterfall.png",
    neighbors: ["mountain", "town", "forest", "blood_pond"],
  },
  {
    id: "inn",
    name: "积雷塔",
    top: 620,
    left: 80,
    imgUrl: "src/building/tower.png",
    offsetT: 68,
    offsetL: 90,
    neighbors: ["blood_pond"],
  },
  {
    id: "cave",
    name: "古树",
    top: 620,
    left: 820,
    imgUrl: "src/building/red_tree (2).png",
    neighbors: ["forest", "blood_pond"],
  },
  {
    id: "blood_pond",
    name: "血池",
    top: 420,
    left: 820,
    imgUrl: "src/building/blood_pond.png",
    neighbors: ["river", "inn", "cave"],
  },
];

places.forEach((placeData) => gameMap.addPlace(new Place(placeData)));

gameMap.addCharacter(
  new Character({
    id: "player1",
    name: "主角",
    hp: 180,
    atk: 24,
    speed: 12,
    faction: "无",
    imgUrl: "src/character/major_character.png",
    isPlayer: true,
    defaultPlaceId: "town",
  }),
  "清风小镇",
);
