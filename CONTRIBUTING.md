# Contributing to Game Room Scoreboard

Thank you for your interest in contributing! This project welcomes contributions from the community.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/game-room-scoreboard.git
   cd game-room-scoreboard
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Set up Supabase** (see [README.md](README.md) for details)
5. **Run the dev server:**
   ```bash
   npm run dev
   ```

## Development Workflow

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Run tests:
   ```bash
   npm run test:e2e
   ```
4. Run type checking:
   ```bash
   npx tsc --noEmit
   ```
5. Commit your changes (see commit message guidelines below)
6. Push to your fork and open a Pull Request

## Code Style

- **TypeScript** strict mode enabled
- **Functional components** with hooks (no class components)
- **No `any` types** except where absolutely necessary for Supabase
- **Tailwind CSS** for styling (use design tokens from theme)
- **56px minimum** touch targets for all interactive elements

## Commit Messages

Follow conventional commit format:

```
type: short description

[optional body]
```

Types:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: add bulk import for scores
fix: correct time parsing for sub-minute times
docs: update developer guide with deployment steps
```

## Pull Request Guidelines

- **One feature per PR** - Keep PRs focused and reviewable
- **Update documentation** - If your change affects docs, update them
- **Add tests** - For new features or bug fixes in critical paths
- **Test on mobile** - Ensure changes work on both kiosk and mobile viewports
- **Reference issues** - Link to related issues in the PR description

## Project Constraints

Keep these hardware constraints in mind:

| Constraint | Value | Reason |
|------------|-------|--------|
| Kiosk display | 800×480px | Raspberry Pi 7" touchscreen |
| Touch targets | ≥56px | Finger-friendly |
| Base font | ≥18px | Readable from across room |
| Leaderboard rows | 4-5 max | Limited vertical space |

## Testing

We use Playwright for E2E testing:

```bash
npm run test:e2e         # Run all tests (headless)
npm run test:e2e:ui      # Interactive test UI
npm run test:e2e:headed  # Watch tests run in browser
```

Tests run at 800×480 viewport to match the kiosk.

## Reporting Bugs

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) and include:
- Steps to reproduce
- Expected vs actual behavior
- Browser/device information
- Screenshots if applicable

## Requesting Features

Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) and check [FUTURE_ENHANCEMENTS.md](FUTURE_ENHANCEMENTS.md) first to see if it's already planned.

## Questions?

- Open a [GitHub Discussion](../../discussions) for questions
- Check existing issues and discussions before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make Game Room Scoreboard better! 🎮
