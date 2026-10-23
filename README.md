# Journey Home — The Fall

A browser-based, choice-driven survival game about getting home as a mysterious environmental threat spreads. Each decision affects your supplies, your route, and how the story ends.

**Built with:** JavaScript, HTML, and CSS.

## Play locally

1. Clone the repository:
   ```bash
   git clone https://github.com/nevaeh-ix/journey-home.git
   cd journey-home
   ```
2. Open `index.html` in a browser.

No account, installation, or API key is required.

## How it works

- **Manage resources:** Track food, fuel, health, inventory, and distance remaining.
- **Make choices:** Respond to randomized events that affect your progress.
- **Explore changing areas:** Travel through three regions with different resource costs and event probabilities.
- **See consequences:** Earlier choices can affect what happens at the end of the journey.
- **Follow the diary:** A running log records the story and your decisions.

## Technical overview

The game keeps its state in a JavaScript object and updates the interface using DOM operations. Each travel turn advances the journey, adjusts resources, checks for region changes, and may trigger a random event. Event choices use action identifiers, and the game tracks inventory and flags to make later decisions matter.

## Project files

- `index.html` — game layout and status display
- `style.css` — styling, backgrounds, and environment animation
- `game.js` — state management, events, decisions, and game progression

## Ideas for future updates

Add automated gameplay tests, a save-and-continue option, and keyboard accessibility improvements.
