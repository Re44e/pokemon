import { IPokemonsRepository } from '../business/aggregate-root/pokemons-interface'
import { IPokemonsDTO } from '../business/value-object/pokemons-dto'
import { Pokemons } from '../../infrastructure/postgres/entities/pokemons'

export class PokemonsRepository implements IPokemonsRepository {

  public async addPokemons(data:IPokemonsDTO) {
    try {
      // Enforce to the standard format
      data.tipo = data.tipo.toLowerCase();
      return await Pokemons.create({ ...data, nivel: 1 });
    }
    catch (error){ throw error; }
  }
  
}