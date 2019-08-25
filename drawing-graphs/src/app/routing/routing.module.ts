import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { LegendComponent } from '../legend/legend.component';
import { GraphComponent } from '../graph/graph.component';

const routes: Routes = [
  { path: 'main', component: LegendComponent },
  { path: 'graph', component: GraphComponent },
  { path: '**', redirectTo: 'main' }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [ RouterModule ]
})
export class RoutingModule { }
