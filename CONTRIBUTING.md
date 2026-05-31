# Contributing to Pleasure Control

Thank you for your interest in contributing to Pleasure Control! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help create a welcoming environment for all contributors

## How to Contribute

### Reporting Bugs

Before creating a bug report:
1. Check existing issues to avoid duplicates
2. Use the latest version to verify the bug still exists
3. Collect relevant information (browser, OS, device type)

When creating a bug report, include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser console errors

### Suggesting Features

Feature suggestions are welcome! Please:
- Check if the feature has already been requested
- Clearly describe the use case
- Explain why it would benefit users
- Consider privacy and security implications

### Pull Requests

1. **Fork the repository** and create a branch from `main`
2. **Follow the code style** - use the existing patterns
3. **Write clear commit messages** - describe what and why
4. **Test your changes** - ensure nothing breaks
5. **Update documentation** - if you change functionality
6. **Keep PRs focused** - one feature/fix per PR

#### Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/pleasure-control.git
cd pleasure-control

# Install dependencies
cd app
npm install

# Start development server
npm run dev

# Run linter
npm run lint
```

#### Code Style

- Use TypeScript for type safety
- Follow existing naming conventions
- Use functional components with hooks
- Keep components focused and reusable
- Add comments for complex logic
- Use Tailwind CSS for styling

#### Commit Messages

Use clear, descriptive commit messages:
- `feat: add new pattern editor feature`
- `fix: resolve battery indicator display issue`
- `docs: update installation instructions`
- `refactor: simplify device connection logic`
- `test: add tests for pattern validation`

### Areas for Contribution

We especially welcome contributions in:

#### Features
- New pattern presets
- Additional game modes
- UI/UX improvements
- Accessibility enhancements
- Mobile optimizations

#### Documentation
- Tutorial videos or guides
- Translation to other languages
- Device compatibility testing
- Troubleshooting guides

#### Code Quality
- Bug fixes
- Performance optimizations
- Test coverage
- Code refactoring
- Security improvements

## Development Guidelines

### Privacy & Security

This project prioritizes user privacy:
- All data must stay local (no external servers)
- No analytics or tracking code
- No third-party services that collect data
- Clear user consent for permissions (microphone, etc.)

### Device Safety

When working with device control:
- Always respect intensity limits
- Implement proper error handling
- Add safety timeouts
- Test thoroughly before submitting

### Testing

Before submitting a PR:
- Test with real devices if possible
- Test in multiple browsers (Chrome, Firefox, Edge)
- Test on mobile devices
- Verify no console errors
- Check that builds complete successfully

### Documentation

Update documentation when you:
- Add new features
- Change existing behavior
- Fix bugs that affect usage
- Modify configuration options

## Project Structure

```
pleasure-control/
├── app/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and helpers
│   │   ├── pages/          # Page components
│   │   └── types/          # TypeScript types
│   ├── public/             # Static assets
│   └── package.json        # Dependencies
├── docs/                   # Documentation
├── CHANGELOG.md            # Version history
└── README.md               # Project overview
```

## Getting Help

- Check the [documentation](docs/)
- Review existing [issues](https://github.com/yourusername/pleasure-control/issues)
- Ask questions in issue discussions
- Be patient - maintainers are volunteers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- The project README
- Release notes for significant contributions
- The project's contributor list

Thank you for helping make Pleasure Control better! 🎉
