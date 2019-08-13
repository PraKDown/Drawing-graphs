import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.css']
})
export class LegendComponent implements OnInit {

  color;
  coordinates;

  constructor() { }

  ngOnInit() {
    this.color = {
      hex: 16711684,
      hexString: '#FF0004',
      hsl: {hue: 359.09289262156943, saturation: 100, lightness: 50},
      rgb: {red: 255, green: 0, blue: 4}
    };
  }

  changeCoordinates(event) {
  // console.log(event.srcElement.value.split('\n'));
  }

}
