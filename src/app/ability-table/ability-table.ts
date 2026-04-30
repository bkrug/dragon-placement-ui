import { Component, OnInit, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Popover, PopoverModule } from 'primeng/popover';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PokemonAbilityHttpClient, PokemonAbility } from '../../httpClients/pokemon-ability-http-client';

@Component({
  standalone: true,
  selector: 'app-ability-table',
  templateUrl: './ability-table.html',
  styleUrl: './ability-table.scss',
  imports: [ButtonModule, PopoverModule, TableModule, TagModule],
  providers: []
})
export class PopoverDatatableDemo {
  lazyLoadingService = inject(PokemonAbilityHttpClient);

  abilities = signal<PokemonAbility[]>([]);
  selectedAbility = signal<PokemonAbility | null>(null);
  totalRecords = signal(0);
  readonly pageSize = 20;

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