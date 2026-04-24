import { Component, OnInit, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Popover, PopoverModule } from 'primeng/popover';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

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

@Component({
  standalone: true,
  selector: 'app-ability-table',
  templateUrl: './ability-table.html',
  styleUrl: './ability-table.scss',
  imports: [ButtonModule, PopoverModule, TableModule, TagModule],
  providers: []
})
export class PopoverDatatableDemo implements OnInit {
  abilities = signal<PokemonAbility[]>([]);
  selectedAbility = signal<PokemonAbility | null>(null);

  ngOnInit() {
    console.log('on init is triggered');

    fetch('https://pokeapi.co/api/v2/ability/')
      .then(response => response.json())
      .then(json => {
        const pagedData = json as PokemonAbilityPage;
        this.abilities.set(pagedData.results);
      });
  }
}