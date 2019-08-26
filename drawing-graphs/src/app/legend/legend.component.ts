import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataGraphService } from '../data-graph.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.css']
})
export class LegendComponent implements OnInit {

  @ViewChild('coordinates', { static: false }) coordinates: ElementRef;

  color;
  name: string;

  constructor(
    private dataGraphService: DataGraphService,
    private snackBar: MatSnackBar
  ) { }

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
    if (coordinates.length < 2) {
      this.snackBar.open('Enter at least two points, each with a new line', 'Ok', {
        duration: 5000
      });
      return;
    }
    let error = false;
    const dataPoints = coordinates.map((elem) => {
      const points = elem.split(':');
      if (points.length < 2) {
        error = true;
      }
      return { x: +points[0], y: +points[1] };
    })
    if (error) {
      this.snackBar.open("Enter the correct coordinates through ':'", 'Ok', {
        duration: 5000
      });
      return;
    }
    this.dataGraphService.graphs.push({
      data: dataPoints,
      color: this.color.hexString,
      name: this.name
    })
    this.coordinates.nativeElement.value = '';
  }

  deleteChart(index) {
    this.dataGraphService.graphs.splice(index, 1);
  }

}
