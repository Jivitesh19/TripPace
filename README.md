# TripPace Planner

Build a modern, ultra-clean web application called "TripPace" using React, Tailwind CSS, and Lucide icons. It is a smart travel itinerary builder focused on pacing and budget estimation.

LAYOUT:

- Two-column responsive desktop layout (collapses gracefully on mobile). Dark zinc theme with modern subtle borders (border-zinc-800) and smooth micro-interactions.

LEFT PANEL (Trip Config):

- Input: "Destination" (text input with placeholder "e.g., Washington, D.C. or College Park").

- Input: "Trip Length" (pill selector buttons for 1, 2, 3, or 4 Days; default to 3).

- Input: "Budget Style" (3 selectable cards):

    - "$" Budget: "Thrifty (~$40/day) - Free sights & quick bites"

    - "$$" Balanced: "Moderate (~$95/day) - Casual dining & paid exhibits"

    - "$$$" Splurge: "Premium (~$200+/day) - Sit-down dining & tours"

- Textarea: "Must-Visit Spots or Notes" (placeholder "e.g., Air & Space Museum, Hirshhorn, grab ramen").

- A row of 2 "Quick Demo Presets" buttons:

    - "D.C. Smithsonian Blitz (3 Days)"

    - "UMD Campus & College Park (1 Day)"

  (Clicking either pre-fills all inputs and immediately populates sample data).

- A large, animated "Generate Itinerary" button with a sparkle icon.

TOP STATS BAR (Above Timeline):

- Two live gauges side-by-side:

  1. "Pacing Gauge": Displays daily active hours (e.g., "6.5 hrs active") with an animated colored badge:

     - Under 4.5 hrs: Green badge ("Relaxed Pace")

     - 4.5 - 7.5 hrs: Blue badge ("Balanced Pace")

     - 7.5+ hrs: Amber badge ("Packed Day - High Fatigue")

  2. "Budget Summary": Displays "Est. Total Cost: $185" with a breakdown pill ("Avg $62/day").

RIGHT PANEL (Interactive Schedule):

- Day selection tabs: [Day 1] [Day 2] [Day 3].

- A clean vertical timeline divided into 3 collapsible sections: "Morning", "Afternoon", and "Evening".

- Each activity is an interactive card showing:

  - Time badge (e.g., "9:30 AM")

  - Place / Activity Name (bold)

  - Category pill badge with distinct colors: "Food" (amber), "Museum" (purple), "Sightseeing" (sky), "Outdoor" (emerald), "Chill" (slate).

  - Estimated Cost pill badge (e.g., "Free", "$15", "$35").

  - Duration controller: "90 min" with clickable minus (-) and plus (+) buttons (increments by 15 mins).

  - A small delete (trash) icon button to remove an item.

  - A 1-sentence insider tip or note.

INTERACTIVITY & STATE:

- Clicking [+] or [-] on any activity card recalculates the total active minutes and updates the top Pacing Gauge.

- Removing an item or toggling days updates both the Pacing Gauge and the Estimated Total Cost.

- Provide clean, pre-populated mock JSON data so the app looks complete and functional immediately upon loading.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ba9994d2-afae-5812-b3d0-934564701cec).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
