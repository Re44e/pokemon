import express from 'express';
import { routes } from './communication/index'
import compression from 'express'
import helmet from 'helmet'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import fs from 'fs'
import yaml from 'js-yaml'

const fileContents = fs.readFileSync('swagger.yml', 'utf8');
const swaggerDocument = yaml.loadAll(fileContents);

const app = express();
app.use(express.json());

app.use(compression());
app.use(helmet())
app.use(cors());

app.use(routes);
app.use('/pokemons-doc/v1', swaggerUi.serve, swaggerUi.setup(swaggerDocument[0], { explorer: true }));



export { app };
