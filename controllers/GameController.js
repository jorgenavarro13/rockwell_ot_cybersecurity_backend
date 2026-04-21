import { validateUser, validatePartialUser } from '../schemas/users.js'
import jwt from 'jsonwebtoken'

export class GameController { 

    constructor ({ model }) {
        this.model = model
    }

    createGame = async (req, res) => {
        const gameData = req.body;
        console.log('Received game data:', gameData); // Debugging line
        const game = await this.model.createGame({ gameData });
        return res.status(201).json(game);
    }
        
    getGame = async (req, res) => {
        const userData = req.body;
        const gameData = await this.model.getGameData(userData);
        return res.status(200).json(gameData);
    }

    gameOver= async (req, res) => {
        const finalGameData = req.body;
        const result = await this.model.GameOver(finalGameData);
        return res.status(200).json(result);
    }

}
