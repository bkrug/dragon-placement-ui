import { Injectable } from '@angular/core';

export interface PokemonAbilityPage {
  count: number
  next: string | null
  previous: string | null
  results: PokemonAbility[]
}

export interface PokemonAbility {
  name: string
  url: string
}

@Injectable({
  providedIn: 'root',
})
export class PokemonAbilityHttpClient {
  async getOnePage(offset: number, limit: number) {
    const response = await fetch(`https://pokeapi.co/api/v2/ability/?offset=${offset}&limit=${limit}`);
    const json = await response.json();
    return json as PokemonAbilityPage;    
  }
}
