# Monitorly

## Frontend architecture

The UI is modernized around Tailwind CSS v4 design tokens and reusable, accessible primitives. Shared controls use Radix-based shadcn-style composition, `clsx` + `tailwind-merge` via `cn`, CVA button variants, Lucide icons, Framer Motion dialogs, Sonner notifications, and React Hook Form with Zod validation for authentication and monitor creation.

The existing stylesheet remains in place to preserve the established marketing and dashboard visual language while screens are progressively migrated to the Tailwind component layer.

A Vite + React + TypeScript marketing site with an embedded interactive product-dashboard demo.

## Getting started

```bash
npm install
npm run dev      # start local dev server
npm run build    # type-check and build for production
npm run preview  # preview the production build
npm run lint      # lint the project
```

## Project structure

```
src/
  main.tsx                     # app entry point, mounts <App />
  App.tsx                      # top-level page composition
  styles/
    global.css                 # global styles (design tokens, layout, components)
  types/
    dashboard.ts                # shared domain types (Monitor, AlertEvent, ...)
  data/                         # static content & seed data, kept out of components
    monitors.ts, responseTimeGraph.ts, incidentHistory.ts, alerts.ts,
    navigation.ts, features.ts, flowSteps.ts, whyPoints.ts, uptimeBars.ts,
    pricingPlans.ts, faqs.ts, footerLinks.ts
  utils/
    number.ts                   # clamp()
    path.ts                     # buildSmoothPath() for the response-time line graph
    incidents.ts                 # downtimeMinutes(), used by the uptime-history bar chart
    responseTimeGraph.ts         # yToLatency(), xToTime(), nearestIndex()
  hooks/
    useDashboardState.ts         # shared state + handlers for the dashboard demo
  components/
    layout/                      # Nav, Footer
    sections/                    # one component per marketing section
    dashboard/                   # the interactive dashboard preview
      panels/                    # one panel per sidebar section
    common/                      # small reusable pieces (Toggle)
```

## Notes

This is a structural refactor of a single-file prototype into a conventional
Vite project layout. No UI or behavior was intentionally changed — components
were extracted 1:1 from the original markup, styles were moved verbatim into
`src/styles/global.css`, and all hardcoded data was lifted into `src/data`.
