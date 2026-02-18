# Rockwell_ot_cybersecurity_backend
Backend repository for Rockwell Cybersecurity OT subject Software Construction FJ2026


<img width="100" height="100" alt="image" src="https://github.com/user-attachments/assets/be49b4e5-4890-4b8f-8565-d09b92f57841" />
<img width="100" height="100" alt="image" src="https://github.com/user-attachments/assets/ab5e90da-5030-4cd9-855b-1016c53dd2d4" />

### Developers:
- A01278612 Jorge Arturo Montiel Navarro
- A01831673 Francisco Nassif Membrive
- A00842029 José Daniel Salazar Cavazos
- A00842208 Ian Eduardo Thomas Morales


Summary for devs

# 📌 Collaboration & Repository Workflow Summary

This repository follows a **strict Git workflow** to ensure code quality, protect the `main` branch, and maintain a structured review process.  
All contributors **must follow these rules**.

---

## 🔒 1. Core Rules

- ❌ **Never commit directly to `main`.**
- ✅ All work must be done in a separate branch.
- ✅ Every change must go through a **Pull Request (PR)**.
- ✅ A PR requires **at least 2 approvals** before merging.

---

## 📂 2. Repositories

There are two repositories:

### Backend
https://github.com/jorgenavarro13/rockwell_ot_cybersecurity_backend

## Frontend
https://github.com/jorgenavarro13/rockwell_ot_cybersecurity_frontend


Clone the repository you are working on:

```
git clone <repo-url>
cd <repo-folder>
``` 

## 🔄 3. Always Stay Updated (Daily)

Before starting any work:
```
git checkout main
git pull origin main
```

## 🌿 4. Branching Workflow

For every task (feature, fix, documentation, etc.), create a new branch from main:
```
git checkout main
git pull origin main
git checkout -b feature/your-task-name
```

### Branch Naming Convention

- feature/ → New feature
- fix/ → Bug fix
- docs/ → Documentation

Examples:

- feature/user-creation
- fix/login-error


## 💾 5. Commit Guidelines

Make small, clear, and frequent commits:
```
git add .
git commit -m "feat: Add user registration validation"
```
### Commit Message Convention (Required)

feat: → New feature
fix: → Bug fix
docs: → Documentation only
style: → Formatting changes
refactor: → Code restructuring (no behavior change)
test: → Adding/updating tests
chore: → Config or dependency updates


##🚀 6. Pull Requests (PR)

After finishing your task:

```
git push origin feature/your-task-name
```

Then create a PR on GitHub:

- Source branch: your branch
-Target branch: main

PR Must Include

- ✔ Clear and descriptive title
- ✔ Detailed explanation (what & why)
- ✔ Checklist of completed tasks
- ✔ Reference to related issues (e.g., Closes #123)
- ✔ Self-review confirmation:

- Code runs without errors
- Tests updated if needed
- Style guidelines followed
