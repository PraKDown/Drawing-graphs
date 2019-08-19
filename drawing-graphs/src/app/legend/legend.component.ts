import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataGraphService } from '../data-graph.service';

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.css']
})
export class LegendComponent implements OnInit {

  @ViewChild('coordinates', { static: false }) coordinates: ElementRef;

  color;
  name: string;

  constructor(private dataGraphService: DataGraphService) { }

  ngOnInit() {
    this.color = {
      hex: 16711684,
      hexString: '#FF0004',
      hsl: { hue: 359.09289262156943, saturation: 100, lightness: 50 },
      rgb: { red: 255, green: 0, blue: 4 }
    };
  }

  addChart() {
    const coordinates = this.coordinates.nativeElement.value.split('\n');
    const dataPoints = coordinates.map((elem) => {
      const points = elem.split(':');
      return { x: +points[0], y: +points[1] };
    })
    this.dataGraphService.graphs.push({
      data: dataPoints,
      color: this.color.hexString,
      name: this.name
    })
  }

  deleteChart(index) {
    this.dataGraphService.graphs.splice(index, 1);
  }

}
