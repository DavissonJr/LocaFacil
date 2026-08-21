import { animate, style, transition, trigger, query, stagger } from '@angular/animations';

/** Backdrop: fade suave de entrada/saída. */
export const backdropFade = trigger('backdropFade', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('180ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('150ms cubic-bezier(0.4, 0, 1, 1)', style({ opacity: 0 }))
  ])
]);

/** Modal: entra com "mola" (overshoot leve), sai com um fade+scale rápido. */
export const modalSpring = trigger('modalSpring', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(18px) scale(0.94)' }),
    animate('320ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
  ]),
  transition(':leave', [
    animate('160ms cubic-bezier(0.4, 0, 1, 1)', style({ opacity: 0, transform: 'translateY(8px) scale(0.97)' }))
  ])
]);

/** Lista: cada item entra escalonado (stagger), com leve subida + fade. */
export const listStagger = trigger('listStagger', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(14px) scale(0.98)' }),
      stagger(45, [
        animate('380ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ])
    ], { optional: true })
  ])
]);
