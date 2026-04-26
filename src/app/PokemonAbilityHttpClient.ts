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
  getOnePage(offset: number, limit: number) {
    return fetch(`https://pokeapi.co/api/v2/ability/?offset=${offset}&limit=${limit}`)
      .then(response => response.json())
      .then(json => {
        return json as PokemonAbilityPage;
      });    
  }
}
