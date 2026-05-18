import { Component } from '@angular/core';
import { DragonTableType } from '../../poco/enums';
import { DragonTable } from '../dragon-table/dragon-table';

//The dragon table is consumed in different places.
//We need this almost empty class, so that we can specify that the dragon table is supposed to display "all dragons",
//instead of just assigned or unassigned dragons.
@Component({
  selector: 'app-dragon-list',
  imports: [ DragonTable ],
  templateUrl: './dragon-list.html',
  styleUrl: './dragon-list.scss',
})
export class DragonList {
  DragonTableType = DragonTableType;
}