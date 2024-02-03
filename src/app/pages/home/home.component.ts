import { Component } from '@angular/core';
import { Vector } from 'src/app/core/Vector';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  v:Vector = new Vector();

}
