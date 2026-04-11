/* =========================================================
   vfs.js — Virtual File System
   A fake Unix-like filesystem for the interactive terminal.
   ========================================================= */

const MMC_VFS = (() => {
  // ---------- File tree ----------
  const tree = {
    "/": {
      type: "dir",
      children: {
        "etc": {
          type: "dir",
          children: {
            "about.txt": {
              type: "file",
              content: `Mohamed Melek Chtourou
Ingénieur Flutter & Node.js
Tunisia → Worldwide
3 apps live in production.`
            },
            "location.txt": {
              type: "file",
              content: "Tunisia, Earth (for now)"
            },
            "education.txt": {
              type: "file",
              content: "Esprit — École d'Ingénieurs"
            },
            "hostname": {
              type: "file",
              content: "chtourou.sh"
            },
            "shadow": {
              type: "file",
              perm: "root",
              content: `# CLASSIFIED — SUDO ACCESS REQUIRED
#
# Gur svany fgrc vf n pynffvp unpxre zbivr sebz '95.
# Gur fhcrepbzchgre va gung zbivr vf gur svany nafjre.
# Gbby: ~$ ebg13 gb qrpbqr gur nobir
#
# Once you have the answer, run: unlock <answer>`
            },
            "motd": {
              type: "file",
              content: "Welcome to NeoLinux v2.0.26 — the shell that dreams in code."
            },
            "ssh": {
              type: "dir",
              children: {
                "config": {
                  type: "file",
                  content: `# SSH client configuration
# Managed by /etc/ssh — do not edit by hand.

Host *
  IdentityFile ~/.ssh/id_rsa
  ServerAliveInterval 60
  StrictHostKeyChecking ask

Host admin
  HostName 10.0.0.5
  Port 4242
  User root
  StrictHostKeyChecking no
  # Elite access — production admin box

Host backup
  HostName backup.chtourou.sh
  Port 22
  User backup

Host dev
  HostName 192.168.1.10
  Port 22
  User chtourou`
                },
                "sshd_config": {
                  type: "file",
                  perm: "root",
                  content: `# sshd server config
Port 22
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes`
                }
              }
            }
          }
        },
        "home": {
          type: "dir",
          children: {
            "chtourou": {
              type: "dir",
              children: {
                ".bashrc": {
                  type: "file",
                  content: `# ~/.bashrc
export PS1="\\[\\e[36m\\]root@chtourou:\\w\\$\\[\\e[0m\\] "
alias ll='ls -la'
alias cls='clear'
alias coffee='echo "☕ +50 HP"'
# Toujours debug — never give up`
                },
                ".bash_history": {
                  type: "file",
                  content: `flutter build ipa --release
git commit -m "fix: last bug i swear"
sudo systemctl restart nginx
docker-compose up -d
node index.js
npm install --save-dev
export ADMIN_TOKEN="blackwall-2077"
ssh admin
code .
exit 0`
                },
                ".ssh": {
                  type: "dir",
                  children: {
                    "authorized_keys": {
                      type: "file",
                      content: `# Only Mohamed's keys allowed.
# If you found this, congrats. Keep exploring.`
                    },
                    "id_rsa": {
                      type: "file",
                      perm: "owner",
                      content: "-----BEGIN PRIVATE KEY-----\n[redacted — nice try]\n-----END PRIVATE KEY-----"
                    }
                  }
                },
                "README.md": {
                  type: "file",
                  content: `# Welcome, explorer.
#
# You're reading my home directory. Curious geek, huh?
#
# ═══════════════════════════════════════════════════
#   🔐 CTF CHALLENGE — for real geeks only
# ═══════════════════════════════════════════════════
#
# If you want to find the hidden /gibson page, you'll
# have to earn it. Five steps. Real crypto. Real knowledge.
#
# Type:    ctf start
#
# ───────────────────────────────────────────────────
#   NEXT STEP — decode me:
#
#   RmluZCB0aGUgc2VjcmV0IGZpbGU6IHN1ZG8gY2F0IC9ldGMvc2hhZG93
#
#   (hint: ~$ base64 -d <the string above>)
# ───────────────────────────────────────────────────
#
# Tools available in this terminal:
#   base64 -d <string>    decode base64
#   rot13 <string>        decode ROT13 (symmetric)
#   hex -d <string>       decode hex
#   find <path>           find files
#   sudo [-p <pw>] <cmd>  run as root
#
# Good luck. The Gibson awaits.`
                },
                "todo.txt": {
                  type: "file",
                  content: `[ ] Ship the next Flutter app
[ ] Write more tests (always)
[x] Build cyberpunk portfolio
[x] Add easter eggs
[x] Sleep 8h  ← lol
[ ] Learn Rust deeply
[ ] Contribute to an OSS project`
                },
                "cv.txt": {
                  type: "file",
                  content: `═══════════════════════════════════════
  MOHAMED MELEK CHTOUROU — CV (plain text)
═══════════════════════════════════════
ROLE      Ingénieur Flutter & Node.js
SCHOOL    Esprit — École d'Ingénieurs
STATUS    Open to ambitious missions
EMAIL     contact@mohamedmelekchtourou.com

SKILLS
  Mobile   Flutter, Dart, Swift, Kotlin
  Backend  Node.js, Express, Spring Boot
  Web      React, JavaScript, HTML/CSS
  DB       MySQL, MongoDB, Firebase
  DevOps   Docker, VPS OVH, Git

SHIPPED
  1. The Landlord   — Flutter + Node.js (LIVE)
  2. Lost & Found   — iOS/Android/Huawei (LIVE)
  3. Artisan d'Art  — SwiftUI + React + Node
  4. TESA           — Flutter + Challonge API
  5. Randev         — Flutter + Spring Boot
  6. Esprit App     — Swift 5 + UIKit

Want the pretty version? → Home page → Télécharger le CV`
                },
                ".secrets": {
                  type: "dir",
                  children: {
                    "diary.md": {
                      type: "file",
                      content: `# Dev diary — private

Day 1382 of coding: still haven't figured out why CSS grid
behaves differently on Safari. Might just blame Apple.

Day 1390: shipped The Landlord to the App Store.
Felt like finishing a long quest. Cried a bit.

Day 1411: started this cyberpunk portfolio.
Found a bug in the matrix rain. Fixed it with love.`
                    }
                  }
                },
                "projects": {
                  type: "dir",
                  children: {
                    "thelandlord": { type: "link", target: "/projects/thelandlord.html" },
                    "lost-found": { type: "link", target: "/projects/lost-found.html" },
                    "tesa": { type: "link", target: "/projects/tesa.html" },
                    "randev": { type: "link", target: "/projects/randev.html" },
                    "artisan-dart": { type: "link", target: "/projects/artisan-dart.html" },
                    "esprit-app": { type: "link", target: "/projects/esprit-app.html" }
                  }
                }
              }
            }
          }
        },
        "var": {
          type: "dir",
          children: {
            "log": {
              type: "dir",
              children: {
                "system.log": {
                  type: "file",
                  content: `[2026-04-11 00:01:42] INFO  boot: kernel loaded
[2026-04-11 00:01:43] INFO  net: eth0 up
[2026-04-11 00:01:44] INFO  coffee.service: started, level=100%
[2026-04-11 00:01:45] OK    neural_net.sys: online
[2026-04-11 00:01:46] OK    creativity.core: mounted
[2026-04-11 00:01:47] WARN  coffee.service: level dropping
[2026-04-11 00:02:00] INFO  portfolio.exe: visitor detected`
                },
                "boot.log": {
                  type: "file",
                  content: "[OK] All systems nominal. You are now inside chtourou.sh"
                },
                "secure.log": {
                  type: "file",
                  content: `[2077-01-15 03:42:10] sshd: connection from 10.0.0.42 port 58231
[2077-01-15 03:42:11] sshd: accepted publickey for chtourou from 10.0.0.42
[2077-01-15 03:42:15] auth: session opened for user: chtourou (uid=1000)
[2077-01-15 03:42:17] auth: session opened for user: oracle (uid=0)
[2077-01-15 03:42:18] auth: privilege escalation GRANTED to user: oracle
[2077-01-15 03:42:19] auth: /root/.access_token written by user: oracle
[2077-01-15 03:42:20] auth: session closed for user: oracle
[2077-01-15 03:42:22] sshd: connection closed from 10.0.0.42`
                }
              }
            }
          }
        },
        "tmp": {
          type: "dir",
          children: {
            ".cache": {
              type: "file",
              content: "# cached dreams and half-compiled ideas"
            }
          }
        }
      }
    }
  };

  // ---------- State ----------
  const state = {
    cwd: "/home/chtourou",
    sudoUnlocked: false
  };

  // ---------- Helpers ----------
  function normalize(path) {
    if (!path) return state.cwd;
    // Expand ~ to home
    if (path.startsWith("~")) path = "/home/chtourou" + path.slice(1);
    // Absolute vs relative
    if (!path.startsWith("/")) path = state.cwd.replace(/\/$/, "") + "/" + path;
    // Split and resolve . and ..
    const parts = path.split("/").filter(Boolean);
    const stack = [];
    for (const p of parts) {
      if (p === ".") continue;
      if (p === "..") stack.pop();
      else stack.push(p);
    }
    return "/" + stack.join("/");
  }

  function resolve(path) {
    const norm = normalize(path);
    const parts = norm.split("/").filter(Boolean);
    let node = tree["/"];
    for (const p of parts) {
      if (!node || node.type !== "dir" || !node.children[p]) return null;
      node = node.children[p];
    }
    return { path: norm, node };
  }

  function ls(path) {
    const res = resolve(path || state.cwd);
    if (!res) return { err: `ls: cannot access '${path}': No such file or directory` };
    if (res.node.type !== "dir") return { err: `ls: ${path}: Not a directory` };
    return {
      path: res.path,
      entries: Object.entries(res.node.children).map(([name, node]) => ({
        name,
        type: node.type,
        perm: node.perm
      }))
    };
  }

  function cat(path) {
    const res = resolve(path);
    if (!res) return { err: `cat: ${path}: No such file or directory` };
    if (res.node.type === "dir") return { err: `cat: ${path}: Is a directory` };
    if (res.node.type === "link") return { content: `[symlink to ${res.node.target}]` };
    // Permission check
    if (res.node.perm === "root" && !state.sudoUnlocked) {
      return { err: `cat: ${path}: Permission denied (sudo required)` };
    }
    if (res.node.perm === "owner") {
      return { err: `cat: ${path}: Permission denied (only owner)` };
    }
    return { content: res.node.content };
  }

  function cd(path) {
    const res = resolve(path || "/home/chtourou");
    if (!res) return { err: `cd: ${path}: No such file or directory` };
    if (res.node.type !== "dir") return { err: `cd: ${path}: Not a directory` };
    state.cwd = res.path;
    return { path: res.path };
  }

  function pwd() {
    return state.cwd;
  }

  function tree_view(path, depth = 0, maxDepth = 4, prefix = "") {
    const res = resolve(path || state.cwd);
    if (!res) return [`tree: ${path}: No such file or directory`];
    const lines = [];
    lines.push((prefix || "") + (depth === 0 ? res.path : ""));
    function walk(node, currentPrefix, d) {
      if (d >= maxDepth || node.type !== "dir") return;
      const entries = Object.entries(node.children);
      entries.forEach(([name, child], i) => {
        const isLast = i === entries.length - 1;
        const connector = isLast ? "└── " : "├── ";
        const marker = child.type === "dir" ? "/" : (child.type === "link" ? "@" : "");
        lines.push(currentPrefix + connector + name + marker);
        if (child.type === "dir") {
          walk(child, currentPrefix + (isLast ? "    " : "│   "), d + 1);
        }
      });
    }
    walk(res.node, "", depth);
    return lines;
  }

  function find(startPath, pattern) {
    const res = resolve(startPath || state.cwd);
    if (!res) return { err: `find: ${startPath}: No such file or directory` };
    const results = [];
    const rx = new RegExp(pattern.replace(/\./g, "\\.").replace(/\*/g, ".*"));
    function walk(node, currentPath) {
      if (node.type === "dir") {
        for (const [name, child] of Object.entries(node.children)) {
          const childPath = currentPath === "/" ? "/" + name : currentPath + "/" + name;
          if (rx.test(name)) results.push(childPath);
          walk(child, childPath);
        }
      }
    }
    walk(res.node, res.path);
    return { results };
  }

  function grep(pattern, path) {
    const results = [];
    const rx = new RegExp(pattern, "i");
    function walk(node, currentPath) {
      if (node.type === "file" && typeof node.content === "string") {
        const lines = node.content.split("\n");
        lines.forEach((line, i) => {
          if (rx.test(line)) {
            results.push({ file: currentPath, line: i + 1, text: line });
          }
        });
      }
      if (node.type === "dir") {
        for (const [name, child] of Object.entries(node.children)) {
          const childPath = currentPath === "/" ? "/" + name : currentPath + "/" + name;
          walk(child, childPath);
        }
      }
    }
    const res = resolve(path || "/");
    if (!res) return { err: `grep: ${path}: No such file or directory` };
    walk(res.node, res.path);
    return { results };
  }

  function sudo(password) {
    if (password === "42") {
      state.sudoUnlocked = true;
      return { ok: true };
    }
    return { ok: false };
  }

  function reset() {
    state.cwd = "/home/chtourou";
    state.sudoUnlocked = false;
  }

  return { tree, state, resolve, normalize, ls, cat, cd, pwd, tree_view, find, grep, sudo, reset };
})();

window.MMC_VFS = MMC_VFS;
