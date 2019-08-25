import { Component, OnInit } from '@angular/core';
import { NgxD3Service } from '@katze/ngx-d3';
import { DataGraphService } from '../data-graph.service';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit {
  private readonly d3 = this.ngxD3Service.getD3();
  chart;
  scaleX;
  scaleY;
  axis;
  marginLeft;
  marginTop;
  lastDataA = [];
  lastDataB = [];
  chartWidth;
  chartHeight;
  ticks: number = 9;
  move: boolean = false;
  left: number = 0;
  top: number = 0;
  minXValue;
  minYValue;
  maxXValue;
  maxYValue;

  constructor(private readonly ngxD3Service: NgxD3Service,
    private dataGraphService: DataGraphService) { }

  ngOnInit() {
    if (this.dataGraphService.graphs.length === 0) {
      return;
    }
    this.dataGraphService.graphs.forEach((chart) => {
      const maxXV = this.d3.max(chart.data, function (d) { return d['x']; });
      const minXV = this.d3.min(chart.data, function (d) { return d['x']; });
      const maxYV = this.d3.max(chart.data, function (d) { return d['y']; });
      const minYV = this.d3.min(chart.data, function (d) { return d['y']; });
      if (this.maxXValue === undefined || this.maxXValue < maxXV) {
        this.maxXValue = maxXV;
      }
      if (this.minXValue === undefined || this.minXValue > minXV) {
        this.minXValue = minXV;
      }
      if (this.maxYValue === undefined || this.maxYValue < maxYV) {
        this.maxYValue = maxYV;
      }
      if (this.minYValue === undefined || this.minYValue > minYV) {
        this.minYValue = minYV;
      }
    });
    this.createChart();
    this.dataGraphService.graphs.forEach((chart) => {
      this.createLine(chart.data, chart.color);
    });
  }

  createChart(scale?: string) {
    let xAxisLength;
    let yAxisLength;
    this.axis = this.d3.select('.axis svg');
    let x;
    let y;
    const getSize = () => {
      const scheme: any = this.d3.select('div.scheme');
      const width = scheme.node().clientWidth;
      const height = scheme.node().clientHeight;
      this.marginTop = height * 0.02;
      this.marginLeft = width * 0.06;
      this.chartWidth = width * 0.94;
      this.chartHeight = height * 0.93;
    }
    if (scale === undefined) {
      getSize();
      xAxisLength = this.chartWidth;
      yAxisLength = this.chartHeight;
      x = this.axis.append('g').attr('class', 'x-axis')
        .attr('transform', 'translate(' + this.marginLeft + ', ' + (yAxisLength + this.marginTop) + ')')
        .attr('opacity', '0.7');
      y = this.axis.append('g').attr('class', 'y-axis')
        .attr('transform', 'translate(' + this.marginLeft + ', ' + this.marginTop + ')')
        .attr('opacity', '0.7');
      this.ticks = 8;
    } else {
      xAxisLength = this.chart.node().clientWidth;
      yAxisLength = this.chart.node().clientHeight;
      x = this.d3.select('.axis svg').select('g.x-axis');
      y = this.d3.select('.axis svg').select('g.y-axis');
      if (scale === 'resize') {
        const oldWidth = this.chartWidth;
        const oldHeight = this.chartHeight;
        getSize();
        const scaleWidth = oldWidth / this.chartWidth;
        const scaleHeight = oldHeight / this.chartHeight;
        this.left /= scaleWidth;
        xAxisLength /= scaleWidth;
        yAxisLength /= scaleHeight;
        x.attr('transform', 'translate(' + this.marginLeft + ', ' + (yAxisLength + this.marginTop) + ')');
        y.attr('transform', 'translate(' + this.marginLeft + ', ' + this.marginTop + ')');
      } else if (scale === 'increase') {
        this.left *= 1.1;
        xAxisLength *= 1.1;
        this.ticks *= 1.08;
      } else if (scale === 'reduce') {
        this.left /= 1.1;
        xAxisLength /= 1.1;
        this.ticks /= 1.08;
      }
      this.d3.selectAll('.chart svg line').remove();
      this.clear();
      this.chart.selectAll('path').remove();
    }

    this.scaleX = this.d3.scaleLinear()
      .domain([this.minXValue, this.maxXValue])
      .range([0, xAxisLength]);

    this.scaleY = this.d3.scaleLinear()
      .domain([this.maxYValue, this.minYValue])
      .range([0, yAxisLength]);

    // const timeSet = this.d3.timeHour.range(this.minDate, this.maxDate);
    // let divider = Math.floor(timeSet.length / this.ticks);
    // if (divider === 0) {
    //   divider = 1;
    // }

    const xAxis = this.d3.axisBottom(this.scaleX);
      // .tickValues(timeSet.filter((elem, index) => index % divider === 0))
      // .tickFormat(this.d3.timeFormat('%e.%m %H:%M'));

    const yAxis = this.d3.axisLeft(this.scaleY);

    x.call(xAxis)

    y.call(yAxis);
    const d3 = this.d3;

    this.chart = this.d3.select('.chart svg')
      .attr('width', `${xAxisLength}`)
      .attr('height', `${yAxisLength}`);

    const chart = this.chart;
    this.d3.selectAll('g.x-axis g.tick').each(function (d) {
      const transform = d3.select(this).attr('transform');
      chart.append('line').attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('stroke', 'white')
        .attr('stroke-opacity', '0.2')
        .attr('y2', yAxisLength)
        .attr('transform', transform);
    })
    .select('text')
    .attr('fill', 'white')
    .attr('font-weight', 'bold');

    this.d3.selectAll('g.y-axis g.tick').each(function (d) {
      const transform = d3.select(this).attr('transform');
      chart.append('line').attr('x1', 0)
        .attr('y1', 0)
        .attr('stroke', 'white')
        .attr('stroke-opacity', '0.2')
        .attr('x2', xAxisLength)
        .attr('y2', 0)
        .attr('transform', transform);
    })
    .select('text')
    .attr('fill', 'white')
    .attr('font-weight', 'bold');
  }

  createLine(data, color) {
    const d3 = this.d3;
    const line = d3.line()
      .x((d) => { return this.scaleX(d['x']); })
      .y((d) => { return this.scaleY(d['y']); })
      .curve(d3.curveLinear);

    this.chart.append('path')
      .attr('d', line(data))
      .attr('fill', 'none')
      // .attr('shape-rendering', 'optimizeSpeed')
      .style('stroke', color)
      .style('stroke-width', 2)
  }

  clear() {
    if (this.chart !== undefined) {
      this.chart.select('g.position').remove();
      this.axis.select('rect.x').remove();
      this.axis.select('rect.y').remove();
      this.axis.select('text.x').remove();
      this.axis.select('text.y').remove();
    }
  }

  moveChart() {
    this.clear();
    if (this.left > 0) {
      this.left = 0;
    }
    const width = this.chart.node().clientWidth;
    if (width + this.left < this.chartWidth) {
      this.left = this.chartWidth - width;
    }
    this.chart.style('left', `${this.left}px`);
    this.axis.select('g.x-axis').attr('transform', 'translate(' + (this.marginLeft + this.left) + ', ' + (this.chartHeight + this.marginTop) + ')');
  }

  stopAction() {
    this.move = false;
    this.clear();
  }

  drawPosition(event) {
    if (this.chart === undefined || event.layerX < this.marginLeft || event.layerY < this.marginTop ||
      event.layerX > this.marginLeft + this.chartWidth || event.layerY > this.marginTop + this.chartHeight) {
      this.stopAction();
      return
    }
    if (this.move) {
      this.left += event.movementX;
      this.moveChart();
    } else {
      let g = this.chart.select('g.position');
      if (g.node() === null) {
        g = this.chart.append('g')
          .classed('position', true);
        g.append('line')
          .classed('x', true);
        g.append('line')
          .classed('y', true);
        this.axis.append('rect')
          .classed('x', true)
          .attr('width', '100')
          .attr('height', '30')
          .attr('rx', '10')
          .attr('ry', '10')
          .attr('fill', 'none');
        this.axis.append('rect')
          .classed('y', true)
          .attr('width', '80')
          .attr('height', '30')
          .attr('rx', '10')
          .attr('ry', '10')
          .attr('fill', 'none');
        this.axis.append('text')
          .classed('x', true)
          .attr('dominant-baseline', 'middle')
          .attr('text-anchor', 'middle');
        this.axis.append('text')
          .classed('y', true)
          .attr('dominant-baseline', 'middle')
          .attr('text-anchor', 'middle');
      }

      const lineX = g.select('line.x');
      const lineY = g.select('line.y');
      const textX = this.axis.select('text.x');
      const textY = this.axis.select('text.y');
      const rectX = this.axis.select('rect.x');
      const rectY = this.axis.select('rect.y');
      const width = this.chart.node().clientWidth;
      const height = this.chart.node().clientHeight;

      lineX.attr('x1', '0')
        .attr('y1', `${event.layerY - this.marginTop}`)
        .attr('x2', `${width}`)
        .attr('y2', `${event.layerY - this.marginTop}`)
        .attr('stroke', 'white')
        .attr('stroke-dasharray', '4');

      lineY.attr('x1', `${event.layerX - this.marginLeft - this.left}`)
        .attr('y1', '0')
        .attr('x2', `${event.layerX - this.marginLeft - this.left}`)
        .attr('y2', `${height}`)
        .attr('stroke', 'white')
        .attr('stroke-dasharray', '4');

      textY.attr('x', `${this.marginLeft - 40}`)
        .attr('y', `${event.layerY + 1}`)
        .text(`${this.scaleY.invert(event.layerY - this.marginTop).toFixed(2)}`)
        .attr('fill', 'white');

      rectY.attr('x', `${this.marginLeft - 80}`)
        .attr('y', `${event.layerY - 15}`)
        .attr('fill', 'black');

      textX.attr('x', `${event.layerX}`)
        .attr('y', `${this.chartHeight + this.marginTop + 18}`)
        .text(`${this.scaleX.invert(event.layerX - this.marginLeft - this.left).toFixed(2)}`)
        .attr('fill', 'white');

      rectX.attr('x', `${event.layerX - 50}`)
        .attr('y', `${this.chartHeight + this.marginTop + 2}`)
        .attr('fill', 'black');
    }
  }

}
