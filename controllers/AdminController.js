import { validateUser, validatePartialUser } from '../schemas/users.js'
import jwt from 'jsonwebtoken'

export class AdminController { 

    constructor ({ model }) {
        this.model = model
    }

    // Capa de seguridad necesaria para proteger todos los endpoints de admin, incluyendo el dashboard
    
    getDashboardData = async (req, res) => {
        const dashboardData = await this.model.getDashboardData();
        console.log(dashboardData)
        res.json(dashboardData);
    }

    // getDashboardStats = async (req, res) => {
    //     const stats = await this.model.getDashboardStats();
    //     console.log(stats)
    //     res.json(stats);
    // }



  }
