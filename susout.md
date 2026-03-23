Project Spec: "SusOut" (Word Deduction Game)
Core Logic: A single-device "pass-and-play" in person game where players describe a secret word using only one word each. One or two "Impostors" know the category but not the word.

Phase 1: Landing Page (Setup)
Player Registration: A list to add/remove player names (3–9 players).

Impostor Count: A toggle/dropdown to select 1 or 2 Impostors.

Category Selection: A grid of clickable categories (e.g., Food, Movies, Travel, Animals).

"Start Game" Button: Disabled until at least 3 names are entered.

Phase 2: Role Reveal (Secret Information)
The Grid: Display a box for each player’s name.

The Reveal: When a player clicks their box, a modal/overlay appears:

Civilians: Show the Category and the Secret Word.

Impostors: Show only the Category and the text "You are the Impostor!"

Partner Reveal: If 2 Impostors are selected, the Impostor screen also says: "Your partner is: [Name]."

The Pass: A "Got it!" button closes the reveal and prompts: "Pass the phone to [Next Name]."

Phase 3: Game Phase (The Loop)
Starting Player: The AI randomly selects one player to start.

The "Double Loop" Rule: 1.  The selected player says their one-word clue.
2.  Play moves in a circle (clockwise) until everyone has said one word.
3.  The starting player says a second word to end the round (completing the loop).

UI Elements:

Large text showing whose turn it is.

A Timer (Elapsed Time) counting up from 0:00 for group reference.

"End Round" Button: Visible to everyone once the loop finishes.

Phase 4: Deliberation & Voting
Secret Ballot: The phone is passed around for private voting.

Voting Screen: Shows a list of all player names.

Selection Logic: * If 1 Impostor: Users can select 0 to 1 people.

If 2 Impostors: Users can select 0 to 2 people.

Confirmation: Clicking a name marks it; clicking "Confirm" cast the vote and clears the screen for the next person.

Progress Tracker: Display a counter (e.g., "Votes Cast: 3/6") so the group knows when to pass.

Phase 5: Reveal & Final Guess
The Results: Display the Top 2 people who received the most votes.

The Verdict:

If Impostor(s) Missed: Show "IMPOSTORS WIN!" and reveal who they were.
Show "Exit Game" button.

If All Impostors Caught: Show "IMPOSTORS VOTED OUT! One last chance to guess..."
Show "Exit Game" button.

In person, if they verbally guess the word they win.

If they miss, CIVILIANS WIN!
