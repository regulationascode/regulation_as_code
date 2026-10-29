# Architecture

The repository contains one browser application and a separate portable catalog scaffold. Both are static projects. There is no backend service.

| Area | Implementation |
| --- | --- |
| Workspace | React and TypeScript entry at `src/main.tsx`; views and scenario state in `src/App.tsx` |
| Timing calculation | `src/rule-timing.ts` implements three selected weekday only branches |
| Pilot economics | `src/economics-model.ts` calculates scenario estimates and descriptive observations |
| Reusable interface | Components in `src/components/` and `src/components/ui/` |
| Portable catalog | Catalog schemas and one synthetic CFTC example in `portable-source/` |
| Local catalog validation | `scripts/validate-catalog.mjs` checks the repository catalog copy in `catalog/` |
| Development and build | Vite configuration in `vite.config.ts`; static output in `dist/` |
| Automated checks | Source tests in `tests/` and GitHub Actions in `.github/workflows/ci.yml` |

The main app presents source references, human selected interpretation, a draft rule, candidate data mappings, a deterministic timing check, an evaluation envelope, an impact replay, governance notes, adoption guidance, pilot economics, and presenter mode. The calculation uses a fixed synthetic date and counts weekdays only.

Scenario and pilot values are stored in browser local storage. Downloads are created in the browser. Nothing connects to an institution, a regulator, or an external service.

The portable catalog has schemas for source, interpretation, rule, test plan, and catalog index. Catalog validation is separate from the app. No catalog rule is loaded or executed by the workspace.

Public work can contain source references, generic interpretations, synthetic fixtures, and tests. Institution data, mappings, policies, credentials, approvals, and run evidence belong in systems controlled by the institution.
