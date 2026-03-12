# Contributing to CodeOrch

## Code Style

- **Python**: Follow PEP 8
- **JavaScript**: Use vanilla JS, no external frameworks
- **Naming**: Use snake_case for Python, camelCase for JavaScript

## Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and test locally**
   ```bash
   # If using local dev setup
   docker-compose up -d
   # Make your changes
   # Test at http://localhost:8000
   ```

3. **Commit with clear messages**
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve bug #123"
   ```

4. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## Commit Message Format

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring (no feature changes)
- `test:` - Test additions/changes
- `chore:` - Build, deps, CI/CD changes

Example: `git commit -m "feat: add task filtering by status"`

## Testing

- Write tests for new features
- Run tests before submitting PR: `pytest`
- Ensure CI passes on GitHub

## Before Submitting a PR

- [ ] Code follows PEP 8 style guide
- [ ] All tests pass locally
- [ ] New features have tests
- [ ] Documentation is updated
- [ ] Commit messages are clear and descriptive
- [ ] No __pycache__ or .env files committed

## Release Process

1. Update version in relevant files
2. Update CHANGELOG.md
3. Create a release tag: `git tag v3.1.0`
4. Push tag: `git push origin v3.1.0`

## Questions?

Open an issue or discussion on GitHub for questions or suggestions.
