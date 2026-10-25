export type Category = "Food" | "Museum" | "Sightseeing" | "Outdoor" | "Chill";
export type Slot = "Morning" | "Afternoon" | "Evening";
export type Activity = {
  id: string;
  time: string;
  name: string;
  category: Category;
  cost: number;
  duration: number;
  tip: string;
  slot: Slot;
};
export type Budget = "budget" | "balanced" | "splurge";

let n = 0;
const a = (slot: Slot, time: string, name: string, category: Category, cost: number, duration: number, tip: string): Activity => ({
  id: `a${++n}`, slot, time, name, category, cost, duration, tip,
});

export const dcPreset = {
  destination: "Washington, D.C.",
  days: 3,
  budget: "balanced" as Budget,
  notes: "Air & Space Museum, Hirshhorn, grab ramen",
  itinerary: [
    [
      a("Morning", "9:00 AM", "National Air & Space Museum", "Museum", 0, 120, "Reserve free timed-entry passes online the night before."),
      a("Morning", "11:15 AM", "Hirshhorn Sculpture Garden", "Outdoor", 0, 45, "The sunken garden is quietest right before lunch."),
      a("Afternoon", "12:15 PM", "Mitsitam Native Foods Café", "Food", 18, 60, "Try the fry bread — it's the café's signature."),
      a("Afternoon", "2:00 PM", "National Mall Monument Walk", "Sightseeing", 0, 90, "Walk west to the Lincoln Memorial for golden-hour views."),
      a("Evening", "6:30 PM", "Daikaya Ramen", "Food", 22, 60, "Go before 7 PM to dodge the downstairs queue."),
    ],
    [
      a("Morning", "9:30 AM", "National Museum of Natural History", "Museum", 0, 105, "Hope Diamond room is empty right at opening."),
      a("Afternoon", "12:00 PM", "Eastern Market", "Food", 15, 60, "Blueberry buckwheat pancakes at the Market Lunch counter."),
      a("Afternoon", "2:00 PM", "Library of Congress", "Sightseeing", 0, 75, "Look up in the Great Hall — the ceiling is the show."),
      a("Evening", "5:30 PM", "Georgetown Waterfront", "Chill", 8, 90, "Grab a gelato and watch the rowers on the Potomac."),
    ],
    [
      a("Morning", "10:00 AM", "National Gallery of Art", "Museum", 0, 90, "The underground walkway between wings has a light tunnel."),
      a("Afternoon", "12:00 PM", "Tidal Basin Loop", "Outdoor", 0, 75, "Rent a paddleboat if the weather cooperates."),
      a("Afternoon", "1:45 PM", "The Wharf Fish Market", "Food", 20, 45, "Oldest continuously running fish market in the U.S."),
      a("Evening", "7:00 PM", "Kennedy Center Millennium Stage", "Chill", 0, 60, "Free nightly performance at 6 PM — arrive early."),
    ],
  ] as Activity[][],
};

export const umdPreset = {
  destination: "College Park, MD",
  days: 1,
  budget: "budget" as Budget,
  notes: "McKeldin Mall, Testudo, Board & Brew",
  itinerary: [
    [
      a("Morning", "9:30 AM", "McKeldin Mall & Testudo Statue", "Sightseeing", 0, 45, "Rub Testudo's nose for luck — everyone does."),
      a("Morning", "10:30 AM", "UMD Arboretum Walk", "Outdoor", 0, 60, "The trail behind the chapel is the prettiest stretch."),
      a("Afternoon", "12:00 PM", "Marathon Deli", "Food", 12, 45, "A campus-legend gyro, cheap and huge."),
      a("Afternoon", "1:30 PM", "The Clarice Arts Center", "Museum", 0, 60, "Check the lobby for free student showcase pieces."),
      a("Evening", "5:00 PM", "Board & Brew", "Chill", 14, 90, "Hundreds of board games — ask staff for a pick."),
    ],
  ] as Activity[][],
};
