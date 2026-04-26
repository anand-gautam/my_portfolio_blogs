---
title: Quick Bash Tip: Directory Navigation
date: 2026-04-25
author: Your Name
---

**Pro Tip:** Use `cd -` to quickly toggle between your current directory and the previous one. This is incredibly useful when working across multiple directories.

Example:
```
$ cd /var/log
$ cd /home/user/projects
$ cd -  # Takes you back to /var/log
```

Also, `~` always refers to your home directory, and `..` goes up one directory level. Chain them together: `cd ../../..` to go up three levels!
