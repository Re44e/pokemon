import { IGameRepository } from '../business/aggregate-root/game-interface'
import { Pokemons } from '../../infrastructure/postgres/entities/pokemons'
import { IPlayGame, IGameWinner, IGameLoser } from '../business/value-object/pokemons-dto';
import { mainGame } from '../business/value-object/game-resources';
import { sequelize } from '../../infrastructure/orm';

export class GameRepository implements IGameRepository {

  public async battle(pokemonAId: string, pokemonBId: string) {

    const t = await sequelize.transaction();
    try {

      const pokemonA = await Pokemons.findOne({
        attributes: ['nivel', 'tipo', 'treinador'],
        where: { id: pokemonAId }
      });
      const pokemonB = await Pokemons.findOne({
        attributes: ['nivel', 'tipo', 'treinador'],
        where: { id: pokemonBId }
      });

      // Player configuration
      const playerA: IPlayGame = {
        id: pokemonAId,
        level: pokemonA?.getDataValue('nivel'),
        kind: pokemonA?.getDataValue('tipo'),
        coach: pokemonA?.getDataValue('treinador'),
      }
      const playerB: IPlayGame = {
        id: pokemonBId,
        level: pokemonB?.getDataValue('nivel'),
        kind: pokemonB?.getDataValue('tipo'),
        coach: pokemonB?.getDataValue('treinador'),
      }

      // Get the result of the game
      const result = mainGame(playerA, playerB);

      // Update levels
      await Pokemons.update({ nivel: result?.winner.level },
        {
          where: { id: result?.winner.id },
          transaction: t
        });

      if (result?.loser.level === 0) {
        await Pokemons.destroy({ where: { id: result?.loser.id }, transaction: t });
      } else {
        await Pokemons.update({ nivel: result?.loser.level },
          {
            where: { id: result?.loser.id },
            transaction: t
          });
      }

      // Return result payload 
      const payload: IGameWinner | IGameLoser = {
        vencedor: {
          id: result?.winner.id,
          tipo: result?.winner.kind,
          treinador: result?.winner.coach,
          nivel: result?.winner.level
        },
        perdedor: {
          id: result?.loser.id,
          tipo: result?.loser.kind,
          treinador: result?.loser.coach,
          nivel: result?.loser.level
        }

      }
      await t.commit();
      return payload;

    }
    catch (error) { await t.rollback(); throw error; }
  }


}