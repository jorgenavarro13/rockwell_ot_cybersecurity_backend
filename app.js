import express,{json} from 'express';
import {corsMiddleware} from './middlewares/cors.js'
import {createRockwellRouter} from './routes/rockwell.js'


export const App = ({model}) => {
  const app = express();
  app.use(json());
  app.use(corsMiddleware());
  app.disable('x-powered-by');

  app.use('/', createRockwellRouter({model}));

  const PORT = process.env.PORT ?? 3000;

  app.get('/', (req, res) => {
    res.send('Hello, World!');
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
  });
};
