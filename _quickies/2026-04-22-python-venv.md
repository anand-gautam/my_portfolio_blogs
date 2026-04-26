---
title: Python Virtual Environments
date: 2026-04-22
author: Your Name
---

**Always use virtual environments!** They isolate project dependencies and prevent conflicts.

Create one:
```
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

This keeps your system Python clean and your projects reproducible. Pro move: add `venv/` to `.gitignore`.
