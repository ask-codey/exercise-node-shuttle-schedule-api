// The campus shuttle's three routes. server.js saves them in MongoDB the first time it starts, and the tests save
// them in their throwaway database. Ready to use: you don't need to change this file.
export const sampleRoutes = [
  {
    id: "blue-loop",
    name: "Blue Loop",
    every: 10,
    firstBus: "7:00",
    lastBus: "22:50",
    stops: ["library", "science-hall", "stadium", "north-dorms"],
  },
  {
    id: "gold-line",
    name: "Gold Line",
    every: 15,
    firstBus: "7:00",
    lastBus: "22:45",
    stops: ["library", "union", "rec-center", "south-dorms"],
  },
  {
    id: "night-owl",
    name: "Night Owl",
    every: 20,
    firstBus: "19:00",
    lastBus: "1:40",
    stops: ["library", "union", "north-dorms", "south-dorms"],
  },
];
