import { validateUser, validatePartialUser } from '../schemas/users.js'
import jwt from 'jsonwebtoken'

export class GameController { 

    constructor ({ model }) {
        this.model = model
    }

    // TODO ! Add error handling to all these endpoints

    // TODO ! Validate security of these endpoints, maybe add a middleware that checks if the user is authenticated, and if the token is valid, and if the user has the right permissions to access these endpoints

    createGame = async (req, res) => {
        const userData = req.body;
        console.log('Received game data:', userData); // Debugging line
        const game = await this.model.createGame({ userData });
        return res.status(201).json(game);
    }
        
    getGame = async (req, res) => {
        const userData = req.body;
        //console.log('Received request for game data with:', userData); // Debugging line
        const gameData = await this.model.getGame({ userData });
        return res.status(200).json(gameData);
    }

    gameOver= async (req, res) => {
        const finalGameData = req.body;
        const result = await this.model.GameOver(finalGameData);
        return res.status(200).json(result);
    }

}
