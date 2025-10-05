# Contributing to KubeDeploy

Thank you for considering contributing to KubeDeploy! 🎉

## How to Contribute

### 1. Fork the Repository
Click the "Fork" button at the top right of this page.

### 2. Clone Your Fork
```bash
git clone https://github.com/YOUR_USERNAME/kube-deploy.git
cd kube-deploy
```

### 3. Create a Branch
```bash
git checkout -b feature/my-new-feature
```

### 4. Make Your Changes
- Follow the existing code style
- Write clear commit messages
- Add tests if applicable
- Update documentation

### 5. Test Your Changes
```bash
# Backend tests
cd backend
go test ./...

# Frontend tests
cd frontend
npm test
```

### 6. Commit Your Changes
```bash
git add .
git commit -m "Add: brief description of your changes"
```

### 7. Push to Your Fork
```bash
git push origin feature/my-new-feature
```

### 8. Create a Pull Request
Go to the original repository and click "New Pull Request"

## Development Setup

Follow the [QUICKSTART.md](QUICKSTART.md) guide to set up your development environment.

## Code Style Guidelines

### Backend (Go)
- Follow standard Go formatting (`gofmt`)
- Write meaningful function/variable names
- Add comments for complex logic
- Handle errors properly

### Frontend (React/TypeScript)
- Use functional components with hooks
- Follow React best practices
- Use TypeScript for type safety
- Keep components small and focused

## What to Contribute

### Bug Reports
- Use GitHub Issues
- Include steps to reproduce
- Provide error messages
- Mention your environment

### Feature Requests
- Describe the feature clearly
- Explain why it's useful
- Provide examples if possible

### Code Contributions
- Bug fixes
- New features
- Performance improvements
- Documentation improvements
- Tests

## Questions?

Feel free to open an issue for questions or discussions!

**Thank you for contributing! 🚀**
