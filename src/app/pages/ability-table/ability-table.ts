import { Component, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { PAGE_SIZE } from '../../../global-consts';
import { PokemonAbility, PokemonAbilityHttpClient } from '../../../httpClients/pokemon-ability-http-client';

@Component({
  standalone: true,
  selector: 'app-ability-table',
  templateUrl: './ability-table.html',
  styleUrl: './ability-table.scss',
  imports: [ButtonModule, TableModule],
  providers: []
})
export class AbilityTable {
  lazyLoadingService = inject(PokemonAbilityHttpClient);

  abilities = signal<PokemonAbility[]>([]);
  selectedAbility = signal<PokemonAbility | null>(null);
  totalRecords = signal(0);
  readonly pageSize = PAGE_SIZE;

  onPageChange(event: TableLazyLoadEvent) {
    const offset = event.first || 0;
    this.lazyLoadingService
      .getOnePage(offset, this.pageSize)
      .then(pagedData => {
        this.abilities.set(pagedData.results);
        this.totalRecords.set(pagedData.count);
      });
  }
}