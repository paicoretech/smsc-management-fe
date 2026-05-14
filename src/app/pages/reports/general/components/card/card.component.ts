import { Component } from '@angular/core';
import { TotalI } from '@app/core';

@Component({
  selector: 'app-cards',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {

  public totalList: TotalI[] = [
    {
      title: 'SMS Out',
      total: '62342654',
      icon: 'bx bx-mail-send',
    }, 
    {
      title: 'Total SMS in Q',
      total: '583/439',
      icon: 'bx bx-money',
    },
    {
      title: 'Retry SMS in Q',
      total: '3',
      icon: 'bx bx-envelope',
    },
  ];
}
