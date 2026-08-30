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
