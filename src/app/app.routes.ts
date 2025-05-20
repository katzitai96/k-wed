import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'invitees',
    loadComponent: () =>
      import('./components/invitee-form/invitee-list.component').then(
        (m) => m.InviteeListComponent
      ),
  },
  {
    path: 'invitees/new',
    loadComponent: () =>
      import('./components/invitee-form/invitee-form.component').then(
        (m) => m.InviteeFormComponent
      ),
  },
  {
    path: 'invitees/edit/:id',
    loadComponent: () =>
      import('./components/invitee-form/invitee-form.component').then(
        (m) => m.InviteeFormComponent
      ),
  },
  {
    path: 'messages',
    loadComponent: () =>
      import('./components/message-templates/template-list.component').then(
        (m) => m.TemplateListComponent
      ),
  },
  {
    path: 'messages/new',
    loadComponent: () =>
      import('./components/message-templates/template-form.component').then(
        (m) => m.TemplateFormComponent
      ),
  },
  {
    path: 'messages/edit/:id',
    loadComponent: () =>
      import('./components/message-templates/template-form.component').then(
        (m) => m.TemplateFormComponent
      ),
  },
  {
    path: 'responses',
    loadComponent: () =>
      import('./components/rsvp-responses/response-list.component').then(
        (m) => m.ResponseListComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
