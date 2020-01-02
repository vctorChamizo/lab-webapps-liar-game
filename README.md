# Lab | Web Apps - The Liar Game

## Introduction

The liar is a card game. The player who starts the game deposits one, two or three cards face down and says out loud a combination of cards (all of the same number), and that will be the play that claims to have thrown (for example, 1 two, 2 horses, 3 kings, etc.)

If the next player (the one who is located immediately on his right), believes him, he must continue depositing one or several cards on the table, coinciding in the number of the deck, but not necessarily in the number of cards deposited, explicitly saying how many they are the cards he deposits (for example, "another horse", or "other two").

On the contrary, if a player, regardless of his turn, mistrusts the cards and decides to verify their accuracy, he must say so and raise the player's cards. If the play were true, the unbeliever will take all the cards from the pile. If, on the contrary, the unbeliever had guessed correctly, the preceding player will collect all the cards from the pile.

It will begin to throw cards again, which may not be of the same suit as before, the player to the right of who took the cards in the previous trick.

The player who gets rid of his cards as soon as possible wins. Once the player runs out of cards the other players will not be able to distrust her.

## Documentation
This website is developed with the **SPA (Single Page Application)** pattern consisting of a web application contained in a single document
HTML. The components of this document are shown or hidden as the user interact with the web application.

## Project Content

```
.
├── doc.pdf
├── README.md
└── src
    ├── app.js
    ├── certificados
    ├── config.js
    ├── dao
    │   ├── dao_partidas.js
    │   └── dao_usuarios.js
    ├── package.json
    ├── practica2.sql
    └── public
        ├── fonts
        ├── img
        ├── index.html
        ├── js
        │   ├── index.js
        └── static
            └── index_estatico.html
```

## Setup
### Welcome Page Example
![welcome](https://user-images.githubusercontent.com/32466953/71678026-6adca700-2d84-11ea-860d-a320ea383db5.png)

---

### Game Play Example
![turn](https://user-images.githubusercontent.com/32466953/71677899-2c46ec80-2d84-11ea-9a34-2151c8f28f14.png)
 
## Technologies
- **HTML - CSS**: used for project web layout.
- **JavaScript**: used for the development of game logic and the treatment of game DOM.
 
## Author
The project has been carried out by [Victor Chamizo](https://github.com/vctorChamizo).
 
Happy coding! 💻
