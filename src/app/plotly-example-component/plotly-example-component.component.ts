import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as Plotly from 'plotly.js';

@Component({
  selector: 'app-plotly-example-component',
  templateUrl: './plotly-example-component.component.html',
  styleUrls: ['./plotly-example-component.component.css']
})
export class PlotlyExampleComponentComponent implements OnInit {

  public barChart: any;

  ngOnInit(): void {
    this.createBarChart();
  }

  createBarChart() {
    const trace = {
      x: ['Category A', 'Category B', 'Category C'],
      y: [20, 35, 10],
      type: 'bar'
    };

    const data = [trace];

    const layout = {
      title: 'Simple Bar Chart Example',
      xaxis: {
        title: 'Categories'
      },
      yaxis: {
        title: 'Values'
      }
    };

    this.barChart = { data, layout };
  }
}
