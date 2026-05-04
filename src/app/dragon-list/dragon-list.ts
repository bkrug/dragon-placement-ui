import { Component } from '@angular/core';
import { DragonTable } from '../dragon-table/dragon-table';
import { DragonTableType } from '../../poco/enums';

@Component({
  selector: 'app-dragon-list',
  imports: [ DragonTable ],
  templateUrl: './dragon-list.html',
  styleUrl: './dragon-list.scss',
})
export class DragonList {
  DragonTableType = DragonTableType;
}