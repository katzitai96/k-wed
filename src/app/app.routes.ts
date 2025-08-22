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
    path: 'ui/invitees',
    loadComponent: () =>
      import('./components/invitee-form/invitee-list.component').then(
        (m) => m.InviteeListComponent
      ),
  },
  {
    path: 'ui/invitees/new',
    loadComponent: () =>
      import('./components/invitee-form/invitee-form.component').then(
        (m) => m.InviteeFormComponent
      ),
  },
  {
    path: 'ui/invitees/edit/:id',
    loadComponent: () =>
      import('./components/invitee-form/invitee-form.component').then(
        (m) => m.InviteeFormComponent
      ),
  },
  {
    path: 'ui/messages',
    loadComponent: () =>
      import('./components/message-templates/template-list.component').then(
        (m) => m.TemplateListComponent
      ),
  },
  {
    path: 'ui/messages/new',
    loadComponent: () =>
      import('./components/message-templates/template-form.component').then(
        (m) => m.TemplateFormComponent
      ),
  },
  {
    path: 'ui/messages/edit/:id',
    loadComponent: () =>
      import('./components/message-templates/template-form.component').then(
        (m) => m.TemplateFormComponent
      ),
  },
  {
    path: 'ui/responses',
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
