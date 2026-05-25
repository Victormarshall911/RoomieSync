# Contributing to RoomieSync

First off, thank you for considering contributing to RoomieSync! It's people like you that make this app such a great tool for students.

## Workflow
1. **Fork** the repo on GitHub
2. **Clone** the project to your own machine
3. **Commit** changes to your own branch
4. **Push** your work back up to your fork
5. Submit a **Pull Request** so that we can review your changes

## Branching Strategy
We use a simple `main` (or `master`) + `feature/*` branch workflow. Please do not commit directly to the main branch. Instead, create a new branch for your feature or bugfix:
`git checkout -b feature/your-feature-name`

## Development
- Install dependencies: `npm install`
- Start the Expo development server: `npm start`
- Run type checks: `npx tsc --noEmit`
- Run tests: `npm test`

Please ensure your code passes type checking and all tests before submitting a Pull Request.

## Code Style
- We use TypeScript for all new files.
- We use React functional components with Hooks.
- Follow existing patterns for styling (`StyleSheet.create` with `theme.ts` tokens).
