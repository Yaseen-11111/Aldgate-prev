import { CheckCircle2 } from 'lucide-react';
import { STEPS } from './steps-data';

const REASSURANCE_POINTS = [
  'No obligation, no pushy sales — just an honest quote',
  'Every window measured individually, never estimated',
  'Fitted and finished by the same team who measured it',
];

/** Static recap of each step below the scroll sequence, plus trust points. */
export function ProcessDetailGrid() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-20 md:py-28">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-serif mb-4">Every Detail, Considered</h2>
        <p className="text-foreground/70 font-light leading-relaxed">
          The Hillarys-style model exists for a reason: window dressings bought sight-unseen,
          without a real measurement, are the single biggest cause of a disappointing fit.
          Here's what that means for you at each stage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
        {STEPS.map((step, i) => {
          const StepIcon = step.icon;
          return (
            <div key={step.title} className="flex gap-6">
              <div className="shrink-0 w-14 h-14 bg-secondary flex items-center justify-center">
                <StepIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  {String(i + 1).padStart(2, '0')} — {step.duration}
                </span>
                <h3 className="text-xl font-medium mt-1 mb-3">{step.title}</h3>
                <p className="text-sm text-foreground/70 font-light leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border pt-12">
        {REASSURANCE_POINTS.map((point) => (
          <div key={point} className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/80 font-light">{point}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
