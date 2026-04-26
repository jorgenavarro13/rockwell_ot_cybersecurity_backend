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
        
        if (!userData || !userData.user_id) {
            return res.status(400).json({ success: false, message: 'Invalid user data' });
        }
        console.log('Received game data:', userData); // Debugging line
        // Check if the user exists in the database before creating a game
        const userExists = await this.model.getById({ userData });
        if (!userExists) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const game = await this.model.createGame({ userData });
        if(!game){ return res.status(500).json({ success: false, message: 'Failed to create game' });}
        return res.status(201).json(game);
    }
        
    getGame = async (req, res) => {
        const userData = req.body;
        //console.log('Received request for game data with:', userData); // Debugging line
        const gameData = await this.model.getGame({ userData });
        if(!gameData) return res.status(404).json({ success: false, message: 'Game not found' });
        return res.status(200).json(gameData);
    }

    gameOver= async (req, res) => {
        const matchData = req.body;
        console.log('Received game over data:', matchData); // Debugging line
        const result = await this.model.GameOver({matchData});
        if(!result) return res.status(404).json({ success: false, message: 'Game not found' });
        return res.status(200).json(result);
    }

    updateScore = async (req, res) => {
        const gameData = req.body;
        console.log('Received score update data:', gameData); // Debugging line
        const result = await this.model.updateScore({gameData});
        if(!result) return res.status(404).json({ success: false, message: 'Game not found' });
        return res.status(200).json(result);
    }

}
