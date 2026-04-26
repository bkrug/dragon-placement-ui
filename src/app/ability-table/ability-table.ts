import { Component, OnInit, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Popover, PopoverModule } from 'primeng/popover';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
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
export class PopoverDatatableDemo {
  abilities = signal<PokemonAbility[]>([]);
  selectedAbility = signal<PokemonAbility | null>(null);
  totalRecords = signal(0);
  readonly pageSize = 20;

  onPageChange(event: TableLazyLoadEvent) {
    console.log("Loading  page data", event.first);
    const offset = event.first || 0;
    fetch(`https://pokeapi.co/api/v2/ability/?offset=${offset}&limit=${this.pageSize}`)
      .then(response => response.json())
      .then(json => {
        const pagedData = json as PokemonAbilityPage;
        this.abilities.set(pagedData.results);
        this.totalRecords.set(pagedData.count);
      });    
  }
}