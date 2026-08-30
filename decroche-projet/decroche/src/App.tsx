import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  BookOpen,
  ChevronRight,
  Copy,
  Cpu,
  Download,
  FileText,
  Folder,
  FolderOpen,
  Gauge,
  HardDrive,
  Layers3,
  Maximize2,
  Minimize2,
  Network,
  Plus,
  RefreshCw,
  Search,
  Server,
  Settings,
  Shield,
  SquareTerminal,
  Trash2,
  Upload,
  Wifi,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";


type NodeType = "dir" | "file";

type FSNode = {
  type: NodeType;
  name: string;
  mode: string;
  owner: string;
  group: string;
  content?: string;
  children?: Record<string, FSNode>;
};

type UserName = "guest" | "user" | "admin" | "root";

type TerminalLine = {
  id: number;
  kind: "input" | "output" | "error" | "system";
  text: string;
};

type Session = {
  id: string;
  title: string;
  user: UserName;
  cwd: string;
  input: string;
  history: string[];
  historyIndex: number;
  env: Record<string, string>;
  aliases: Record<string, string>;
  lines: TerminalLine[];
  shellStack: string[];
  passwordMode?: UserName | null;
  passwordTarget?: UserName | null;
};

const COMMANDS = [
  "alias", "apt", "apt-get", "awk", "banner", "bash", "bg", "cat", "cd", "chmod", "chown", "clear", "cp", "curl", "date", "df", "dig", "dkpg", "dpkg", "du", "echo", "env", "exit", "export", "fastfetch", "fg", "find", "free", "grep", "groups", "gunzip", "head", "help", "history", "hostname", "htop", "id", "ifconfig", "ip", "jobs", "kill", "less", "ls", "lsblk", "lscpu", "lspci", "lsusb", "matrix", "mkdir", "motd", "mv", "nano", "neofetch", "netstat", "network", "nslookup", "passwd", "ping", "pkill", "printenv", "ps", "pwd", "reboot", "rm", "rmdir", "route", "service", "shutdown", "ss", "su", "sudo", "sysinfo", "systemctl", "tail", "tar", "timedatectl", "top", "touch", "tracepath", "traceroute", "uname", "unzip", "uptime", "users", "wget", "whoami", "which", "zip",
];

const USERS: Record<UserName, { uid: number; gid: number; groups: string[]; home: string; shell: string; password: string }> = {
  guest: { uid: 1001, gid: 1001, groups: ["guest"], home: "/home/guest", shell: "/bin/bash", password: "guest" },
  user: { uid: 1000, gid: 1000, groups: ["users", "sudo"], home: "/home/henry", shell: "/bin/bash", password: "henry" },
  admin: { uid: 900, gid: 900, groups: ["admin", "sudo", "users"], home: "/home/admin", shell: "/bin/bash", password: "admin" },
  root: { uid: 0, gid: 0, groups: ["root", "sudo", "admin"], home: "/root", shell: "/bin/bash", password: "root" },
};

const initialFiles: FSNode = {
  type: "dir", name: "/", mode: "drwxr-xr-x", owner: "root", group: "root", children: {
    bin: { type: "dir", name: "bin", mode: "drwxr-xr-x", owner: "root", group: "root", children: {
      bash: { type: "file", name: "bash", mode: "-rwxr-xr-x", owner: "root", group: "root", content: "ELF 64-bit virtual bash binary" },
      sh: { type: "file", name: "sh", mode: "-rwxr-xr-x", owner: "root", group: "root", content: "ELF 64-bit virtual sh binary" },
    } },
    boot: { type: "dir", name: "boot", mode: "drwxr-xr-x", owner: "root", group: "root", children: { "vmlinuz-6.8.0": { type: "file", name: "vmlinuz-6.8.0", mode: "-rw-r--r--", owner: "root", group: "root", content: "Ubuntu virtual kernel 6.8.0" } } },
    dev: { type: "dir", name: "dev", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
    etc: { type: "dir", name: "etc", mode: "drwxr-xr-x", owner: "root", group: "root", children: {
      hostname: { type: "file", name: "hostname", mode: "-rw-r--r--", owner: "root", group: "root", content: "henry\n" },
      os-release: { type: "file", name: "os-release", mode: "-rw-r--r--", owner: "root", group: "root", content: "PRETTY_NAME=\"Ubuntu Simulator\"\nNAME=\"Ubuntu\"\nVERSION=\"24.04 LTS (Noble Numbat)\"\n" },
      hosts: { type: "file", name: "hosts", mode: "-rw-r--r--", owner: "root", group: "root", content: "127.0.0.1 localhost\n127.0.1.1 henry\n" },
    } },
    home: { type: "dir", name: "home", mode: "drwxr-xr-x", owner: "root", group: "root", children: {
      henry: { type: "dir", name: "henry", mode: "drwxr-x---", owner: "user", group: "users", children: {
        Desktop: { type: "dir", name: "Desktop", mode: "drwxr-xr-x", owner: "user", group: "users", children: {} },
        Documents: { type: "dir", name: "Documents", mode: "drwxr-xr-x", owner: "user", group: "users", children: { "welcome.txt": { type: "file", name: "welcome.txt", mode: "-rw-r--r--", owner: "user", group: "users", content: "Welcome to henry's Ubuntu simulator.\n" } } },
        Downloads: { type: "dir", name: "Downloads", mode: "drwxr-xr-x", owner: "user", group: "users", children: {} },
        Pictures: { type: "dir", name: "Pictures", mode: "drwxr-xr-x", owner: "user", group: "users", children: {} },
        Videos: { type: "dir", name: "Videos", mode: "drwxr-xr-x", owner: "user", group: "users", children: {} },
      } },
      guest: { type: "dir", name: "guest", mode: "drwxr-x---", owner: "guest", group: "guest", children: {} },
      admin: { type: "dir", name: "admin", mode: "drwxr-x---", owner: "admin", group: "admin", children: {} },
    } },
    lib: { type: "dir", name: "lib", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
    media: { type: "dir", name: "media", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
    mnt: { type: "dir", name: "mnt", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
    opt: { type: "dir", name: "opt", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
    proc: { type: "dir", name: "proc", mode: "dr-xr-xr-x", owner: "root", group: "root", children: {} },
    root: { type: "dir", name: "root", mode: "drwx------", owner: "root", group: "root", children: { ".bashrc": { type: "file", name: ".bashrc", mode: "-rw-------", owner: "root", group: "root", content: "# root shell configuration\n" } } },
    run: { type: "dir", name: "run", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
    sbin: { type: "dir", name: "sbin", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
    srv: { type: "dir", name: "srv", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
    sys: { type: "dir", name: "sys", mode: "dr-xr-xr-x", owner: "root", group: "root", children: {} },
    tmp: { type: "dir", name: "tmp", mode: "drwxrwxrwt", owner: "root", group: "root", children: {} },
    usr: { type: "dir", name: "usr", mode: "drwxr-xr-x", owner: "root", group: "root", children: {
      bin: { type: "dir", name: "bin", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
      local: { type: "dir", name: "local", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
      share: { type: "dir", name: "share", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
    } },
    var: { type: "dir", name: "var", mode: "drwxr-xr-x", owner: "root", group: "root", children: {
      log: { type: "dir", name: "log", mode: "drwxr-xr-x", owner: "root", group: "root", children: { "syslog": { type: "file", name: "syslog", mode: "-rw-r-----", owner: "root", group: "adm", content: "Aug 30 17:50 henry systemd[1]: Starting simulated services...\n" } } },
      www: { type: "dir", name: "www", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
    } },
  }
};

const cloneFS = (node: FSNode): FSNode => JSON.parse(JSON.stringify(node));

const splitPath = (p: string) => p.split("/").filter(Boolean);

function resolvePath(cwd: string, target = ".") {
  const raw = target.startsWith("/") ? target : `${cwd}/${target}`;
  const parts: string[] = [];
  raw.split("/").forEach((part) => {
    if (!part || part === ".") return;
    if (part === "..") parts.pop(); else parts.push(part);
  });
  return "/" + parts.join("/");
}

function getNode(root: FSNode, path: string): FSNode | null {
  if (path === "/") return root;
  let current: FSNode = root;
  for (const part of splitPath(path)) {
    if (current.type !== "dir" || !current.children?.[part]) return null;
    current = current.children[part];
  }
  return current;
}

function getParent(root: FSNode, path: string) {
  const normalized = resolvePath("/", path);
  const pieces = splitPath(normalized);
  const name = pieces.pop() || "";
  const parentPath = "/" + pieces.join("/");
  const parent = getNode(root, parentPath || "/");
  return { parent, name, parentPath: parentPath || "/" };
}

function formatPrompt(user: UserName, cwd: string) {
  const display = user === "root" ? (cwd === "/root" || cwd === "/" ? "~" : cwd) : (cwd === USERS[user].home ? "~" : cwd);
  return `${user}@henry:${display}${user === "root" ? "#" : "$"}`;
}

function tokenize(input: string) {
  const tokens: string[] = [];
  let current = "";
  let quote: "'" | '"' | null = null;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (ch === "\\" && i + 1 < input.length) { current += input[++i]; continue; }
    if (quote) { if (ch === quote) quote = null; else current += ch; continue; }
    if (ch === "'" || ch === '"') { quote = ch; continue; }
    if (/\s/.test(ch)) { if (current) { tokens.push(current); current = ""; } continue; }
    if ([">", "|", ";", "&"].includes(ch)) {
      if (current) { tokens.push(current); current = ""; }
      if (ch === ">" && input[i + 1] === ">") { tokens.push(">>"); i += 1; } else if (ch === "&" && input[i + 1] === "&") { tokens.push("&&"); i += 1; } else tokens.push(ch);
      continue;
    }
    current += ch;
  }
  if (current) tokens.push(current);
  return tokens;
}

function expandVars(value: string, session: Session) {
  return value.replace(/\$(\w+|\{[^}]+\})/g, (_, raw) => {
    const key = raw.startsWith("{") ? raw.slice(1, -1) : raw;
    if (key === "HOME") return USERS[session.user].home;
    if (key === "USER") return session.user;
    if (key === "PWD") return session.cwd;
    return session.env[key] ?? "";
  });
}

function pathDisplayFor(nodePath: string) {
  return nodePath === "/" ? "/" : nodePath.replace(/^\//, "");
}

const line = (kind: TerminalLine["kind"], text: string, idRef: { value: number }): TerminalLine => ({ id: idRef.value++, kind, text });

function getSavedFS(): FSNode {
  try {
    const raw = localStorage.getItem("henry-linux-fs");
    return raw ? JSON.parse(raw) : cloneFS(initialFiles);
  } catch { return cloneFS(initialFiles); }
}

function getInitialSession(): Session {
  return {
    id: crypto.randomUUID(),
    title: "henry",
    user: "user",
    cwd: "/",
    input: "",
    history: [],
    historyIndex: -1,
    env: { LANG: "en_US.UTF-8", SHELL: "/bin/bash", TERM: "xterm-256color", EDITOR: "nano", PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" },
    aliases: {},
    lines: [
      { id: 1, kind: "system", text: "Ubuntu Simulator 24.04 LTS · kernel 6.8.0-virtual · bash 5.2" },
      { id: 2, kind: "system", text: "This is a safe browser sandbox. System commands never execute on your computer." },
      { id: 3, kind: "system", text: "Type `help` for commands. Try `neofetch`, `ls -la`, or `curl https://api.github.com`." },
    ],
    shellStack: [],
  };
}

const BASE_PROCESSES = [
  [1, "root", "0.0", "0.1", "systemd --system"],
  [412, "root", "0.1", "0.4", "systemd-journald"],
  [621, "root", "0.0", "0.2", "NetworkManager"],
  [731, "root", "0.2", "0.7", "sshd: /usr/sbin/sshd"],
  [1042, "user", "1.3", "2.1", "bash"],
  [1180, "user", "0.5", "1.0", "terminal-ui"],
];

function App() {
  const [fs, setFs] = useState<FSNode>(() => getSavedFS());
  const [sessions, setSessions] = useState<Session[]>(() => [getInitialSession()]);
  const [activeId, setActiveId] = useState(() => sessions[0].id);
  const [panel, setPanel] = useState<"files" | "processes" | "system" | "network" | "settings" | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fullscreen, setFullscreen] = useState(false);
  const [nano, setNano] = useState<{ path: string; content: string } | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(100);

  const active = sessions.find((s) => s.id === activeId) ?? sessions[0];

  const persistFS = useCallback((next: FSNode) => {
    setFs(next);
    try { localStorage.setItem("henry-linux-fs", JSON.stringify(next)); } catch { /* storage is optional */ }
  }, []);

  const updateActive = useCallback((patch: Partial<Session>) => {
    setSessions((current) => current.map((s) => s.id === activeId ? { ...s, ...patch } : s));
  }, [activeId]);

  useEffect(() => {
    terminalRef.current?.scrollTo({ top: terminalRef.current.scrollHeight, behavior: "smooth" });
  }, [active.lines.length]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === "l") { event.preventDefault(); updateActive({ lines: [] }); }
      if (event.ctrlKey && event.key.toLowerCase() === "f") { event.preventDefault(); setSearchOpen(true); }
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "c") { event.preventDefault(); navigator.clipboard?.writeText(active.lines.map((l) => l.text).join("\n")); }
      if (event.key === "Escape" && searchOpen) setSearchOpen(false);
      if (event.key === "Tab" && document.activeElement === inputRef.current) { event.preventDefault(); autoComplete(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const autoComplete = useCallback(() => {
    const raw = active.input;
    const last = raw.split(/\s+/).pop() ?? "";
    if (!last) return;
    const matches = COMMANDS.filter((c) => c.startsWith(last));
    if (matches.length === 1 && !raw.includes(" ")) updateActive({ input: raw.slice(0, -last.length) + matches[0] + " " });
    else if (matches.length > 1 && !raw.includes(" ")) appendOutput(matches.join("  "));
    else {
      const parent = raw.includes("/") ? raw.slice(0, raw.lastIndexOf("/") + 1) : "";
      const prefix = last.includes("/") ? last.slice(last.lastIndexOf("/") + 1) : last;
      const dir = resolvePath(active.cwd, parent || ".");
      const node = getNode(fs, dir);
      const items = node?.children ? Object.keys(node.children).filter((name) => name.startsWith(prefix)) : [];
      if (items.length === 1) updateActive({ input: raw.slice(0, -prefix.length) + items[0] + (node?.children?.[items[0]]?.type === "dir" ? "/" : " ") });
      else if (items.length > 1) appendOutput(items.join("  "));
    }
  }, [active.input, active.cwd, fs, updateActive]);

  const appendOutput = useCallback((text: string, kind: TerminalLine["kind"] = "output") => {
    setSessions((current) => current.map((s) => s.id === activeId ? { ...s, lines: [...s.lines, ...text.split("\n").map((t) => line(kind, t, idRef))] } : s));
  }, [activeId]);

  const permissionDenied = (cmd: string) => `${cmd}: permission denied (try sudo)`;

  const listDirectory = (path: string, all: boolean, long: boolean) => {
    const node = getNode(fs, path);
    if (!node || node.type !== "dir") return { error: `ls: cannot access '${pathDisplayFor(path)}': No such file or directory` };
    const entries = Object.values(node.children ?? {}).filter((n) => all || !n.name.startsWith("."));
    if (!long) return { text: entries.map((n) => n.name + (n.type === "dir" ? "/" : "")).join("  ") };
    const rows = entries.map((n) => `${n.mode}  1 ${n.owner.padEnd(6)} ${n.group.padEnd(6)} ${String((n.content ?? "").length).padStart(5)} Aug 30 17:50 ${n.name}${n.type === "dir" ? "/" : ""}`);
    return { text: rows.join("\n") };
  };

  const isPrivileged = active.user === "root";

  const executeSimple = async (argv: string[], stdin = ""): Promise<{ output: string; error?: boolean; nextFs?: FSNode; nextSession?: Partial<Session>; stop?: boolean }> => {
    if (!argv[0]) return { output: "" };
    const command = expandVars(argv[0], active);
    const args = argv.slice(1).map((a) => expandVars(a, active));
    const fsWork = cloneFS(fs);
    const current = active.cwd;
    const user = active.user;

    if (active.aliases[command] && !args.length) return executeSimple(tokenize(active.aliases[command]), stdin);

    switch (command) {
      case "help":
        return { output: "Core: ls cd pwd mkdir rmdir touch cat less head tail cp mv rm find grep nano clear history\nShell: bash sh sudo su exit echo export env printenv alias\nSystem: uname hostname uptime free df du lsblk lscpu lspci lsusb ps top htop\nNetwork: ip ifconfig ping traceroute tracepath curl wget dig nslookup host netstat ss route\nPackages: apt apt-get dpkg · Services: systemctl service journalctl · Other: tar gzip gunzip zip unzip date timedatectl which whoami id users groups passwd chmod chown kill pkill jobs bg fg\nSpecial: neofetch fastfetch matrix banner motd sysinfo network about" };
      case "about":
        return { output: "henry · Ubuntu Simulator\nA full Linux-like command environment implemented in the browser.\nVirtual filesystem: localStorage · Network: browser fetch only · Host OS: never accessed." };
      case "motd": return { output: "Welcome to Ubuntu Simulator.\n\n * Documentation:  `help`\n * Safe sandbox:    no host commands are executed\n * Persistence:     localStorage enabled" };
      case "banner": return { output: " _   _ _____ _   _ ______   __\n| | | | ____| | | |  _  \\ \\ / /\n| |_| | |__ | | | | | | |\\ V /\n|  _  |  __|| | | | | | | > <\n| | | | |___| |_| | |/ / / . \\ \n\\_| |_/____/ \\___/|___/ /_/ \\_\\" };
      case "matrix": return { output: ["0 1 1 0 0 1 0 1 1 0 1", "1 0 0 1 1 0 1 0 1 0 0", "0 1 0 1 0 0 1 1 0 1 1", "1 1 1 0 1 0 0 1 1 0 1"].join("\n") };
      case "neofetch":
      case "fastfetch":
        return { output: `user@henry                     Ubuntu Simulator 24.04 LTS\n-------------------            ---------------------------\nOS: Ubuntu Simulator x86_64\nHost: Browser Virtual Machine\nKernel: 6.8.0-virtual\nShell: ${active.env.SHELL.split("/").pop()}\nTerminal: xterm-256color\nCPU: Virtual CPU (8 cores)\nMemory: 16 GiB (3.4 GiB / 16 GiB)\nDisk: 128 GiB virtual disk\nUptime: 02:14:37\nPackages: 1842 (apt)\nResolution: ${window.innerWidth}x${window.innerHeight}\nTheme: Henry Dark\nNetwork: browser bridge online` };
      case "sysinfo": return { output: `Hostname: henry\nOS: Ubuntu Simulator 24.04 LTS\nKernel: 6.8.0-virtual\nArchitecture: x86_64\nCPU: 8 vCPU\nRAM: 16 GiB\nStorage: 128 GiB virtual disk\nShell: ${active.env.SHELL}\nInit: systemd (simulated)` };
      case "network": return { output: "Interface  State     Address\nlo         UP        127.0.0.1/8\neth0       UP        192.168.1.42/24\n             gateway  192.168.1.1\n             dns      1.1.1.1, 8.8.8.8" };
      case "whoami": return { output: user };
      case "id": return { output: `uid=${USERS[user].uid}(${user}) gid=${USERS[user].gid}(${user}) groups=${USERS[user].groups.map((g) => `${USERS[user].gid}(${g})`).join(",")}` };
      case "users": return { output: "user admin guest" };
      case "groups": return { output: USERS[user].groups.join(" ") };
      case "hostname": return { output: args[0] === "-f" ? "henry" : "henry" };
      case "pwd": return { output: active.cwd };
      case "cd": {
        const target = args[0] ?? "~";
        const resolved = target === "~" ? USERS[user].home : resolvePath(active.cwd, target);
        const destination = getNode(fs, resolved);
        if (!destination || destination.type !== "dir") return { output: `bash: cd: ${target}: No such file or directory`, error: true };
        return { output: "", nextSession: { cwd: resolved } };
      }
      case "ls": {
        const flags = args.filter((a) => a.startsWith("-"));
        const all = flags.some((f) => f.includes("a"));
        const long = flags.some((f) => f.includes("l"));
        const target = args.find((a) => !a.startsWith("-")) ?? active.cwd;
        const resolved = target === "~" ? USERS[user].home : resolvePath(active.cwd, target);
        const result = listDirectory(resolved, all, long);
        return result.error ? { output: result.error, error: true } : { output: result.text ?? "" };
      }
      case "mkdir": {
        if (!args.length) return { output: "mkdir: missing operand", error: true };
        for (const raw of args.filter((a) => !a.startsWith("-"))) {
          const resolved = resolvePath(active.cwd, raw); const { parent, name } = getParent(fsWork, resolved);
          if (parent?.type !== "dir") return { output: `mkdir: cannot create directory '${raw}'`, error: true };
          if (!isPrivileged && parent.owner !== user) return { output: permissionDenied(`mkdir '${raw}'`), error: true };
          parent.children![name] = { type: "dir", name, mode: "drwxr-xr-x", owner: user, group: USERS[user].groups[0], children: {} };
        }
        return { output: "", nextFs: fsWork };
      }
      case "rmdir":
      case "rm": {
        const recursive = args.includes("-r") || args.includes("-rf");
        const targets = args.filter((a) => !a.startsWith("-"));
        if (!targets.length) return { output: `${command}: missing operand`, error: true };
        for (const raw of targets) {
          const resolved = resolvePath(active.cwd, raw); const { parent, name } = getParent(fsWork, resolved); const target = getNode(fsWork, resolved);
          if (!target || !parent) return { output: `${command}: cannot remove '${raw}': No such file or directory`, error: true };
          if (target.type === "dir" && command === "rmdir" && Object.keys(target.children ?? {}).length) return { output: `rmdir: failed to remove '${raw}': Directory not empty`, error: true };
          if (target.type === "dir" && !recursive && command === "rm") return { output: `rm: cannot remove '${raw}': Is a directory`, error: true };
          if (!isPrivileged && target.owner !== user && parent.owner !== user) return { output: permissionDenied(`rm '${raw}'`), error: true };
          delete parent.children![name];
        }
        return { output: "", nextFs: fsWork };
      }
      case "touch": {
        const targets = args.filter((a) => !a.startsWith("-"));
        for (const raw of targets) {
          const resolved = resolvePath(active.cwd, raw); const { parent, name } = getParent(fsWork, resolved);
          if (!parent?.children) return { output: `touch: cannot touch '${raw}': No such file or directory`, error: true };
          if (parent.children[name]) continue;
          if (!isPrivileged && parent.owner !== user) return { output: permissionDenied(`touch '${raw}'`), error: true };
          parent.children[name] = { type: "file", name, mode: "-rw-r--r--", owner: user, group: USERS[user].groups[0], content: "" };
        }
        return { output: "", nextFs: fsWork };
      }
      case "cat": {
        const targets = args.filter((a) => !a.startsWith("-"));
        if (!targets.length) return { output: stdin };
        return { output: targets.map((raw) => { const n = getNode(fs, resolvePath(active.cwd, raw)); return !n ? `cat: ${raw}: No such file or directory` : n.type === "dir" ? `cat: ${raw}: Is a directory` : n.content ?? ""; }).join("\n") };
      }
      case "head":
      case "tail": {
        const n = getNode(fs, resolvePath(active.cwd, args.find((a) => !a.startsWith("-")) ?? ""));
        if (!n) return { output: `${command}: No such file or directory`, error: true };
        const lines = (n.content ?? "").split("\n"); const count = 10; return { output: (command === "head" ? lines.slice(0, count) : lines.slice(-count)).join("\n") };
      }
      case "less": {
        const raw = args[0]; const n = raw ? getNode(fs, resolvePath(active.cwd, raw)) : null;
        if (!n) return { output: `less: ${raw ?? "missing file"}: No such file or directory`, error: true };
        return { output: `--- ${raw} ---\n${n.content ?? ""}\n--- press Ctrl+C or type q to exit ---` };
      }
      case "grep": {
        const needle = args.find((a) => !a.startsWith("-")) ?? "";
        const sourceFile = [...args].reverse().find((a) => !a.startsWith("-"));
        let source = stdin;
        if (sourceFile && sourceFile !== needle) { const n = getNode(fs, resolvePath(active.cwd, sourceFile)); source = n?.content ?? ""; }
        return { output: source.split("\n").filter((l) => l.includes(needle)).join("\n") };
      }
      case "find": {
        const start = args.find((a) => !a.startsWith("-")) ?? ".";
        const pattern = args[args.indexOf("-name") + 1] ?? "*";
        const base = resolvePath(active.cwd, start); const hits: string[] = [];
        const walk = (p: string, n: FSNode) => { if (n.name === pattern || (pattern === "*" && n.name)) hits.push(p); if (n.type === "dir') return; Object.values(n.children ?? {}).forEach((child) => walk(resolvePath(p, child.name), child)); };
        // Safe recursive walk with a corrected condition below.
        const visit = (p: string, n: FSNode) => { if (n.name === pattern || (pattern === "*" && n.name)) hits.push(p); if (n.type === "dir") Object.values(n.children ?? {}).forEach((child) => visit(resolvePath(p, child.name), child)); };
        const n = getNode(fs, base); if (n) visit(base, n);
        return { output: hits.join("\n") };
      }
      case "cp":
      case "mv": {
        const vals = args.filter((a) => !a.startsWith("-")); if (vals.length < 2) return { output: `${command}: missing destination file operand`, error: true };
        const srcPath = resolvePath(active.cwd, vals[0]); const dstPath = resolvePath(active.cwd, vals[1]); const src = getNode(fsWork, srcPath); const { parent, name } = getParent(fsWork, dstPath);
        if (!src || !parent?.children) return { output: `${command}: cannot stat '${vals[0]}': No such file or directory`, error: true };
        parent.children[name] = JSON.parse(JSON.stringify({ ...src, name }));
        if (command === "mv") { const srcParent = getParent(fsWork, srcPath).parent; if (srcParent?.children) delete srcParent.children[src.name]; }
        return { output: "", nextFs: fsWork };
      }
      case "echo": return { output: args.join(" ") };
      case "export": {
        const pairs = args.length ? args : [];
        const env = { ...active.env };
        pairs.forEach((pair) => { const [key, ...rest] = pair.split("="); if (key) env[key] = rest.join("="); });
        return { output: "", nextSession: { env } };
      }
      case "env":
      case "printenv": return { output: Object.entries(active.env).sort().map(([k, v]) => `${k}=${v}`).join("\n") };
      case "alias": {
        if (!args.length) return { output: Object.entries(active.aliases).map(([k, v]) => `alias ${k}='${v}'`).join("\n") };
        const raw = args.join(" "); const eq = raw.indexOf("="); if (eq < 0) return { output: `bash: alias: ${raw}: not found`, error: true };
        const key = raw.slice(0, eq); const value = raw.slice(eq + 1).replace(/^['"]|['"]$/g, ""); return { output: "", nextSession: { aliases: { ...active.aliases, [key]: value } } };
      }
      case "history": return { output: active.history.map((h, i) => ` ${String(i + 1).padStart(3)}  ${h}`).join("\n") };
      case "clear": return { output: "", nextSession: { lines: [] } };
      case "uname": return { output: args.includes("-a") ? "Linux henry 6.8.0-virtual #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux" : "Linux" };
      case "uptime": return { output: " 17:52:41 up 2:14, 1 user, load average: 0.12, 0.08, 0.03" };
      case "free": return { output: "               total        used        free      shared  buff/cache   available\nMem:        16384000     3481600    11821000      132096      1274496    12822144\nSwap:        4194304           0     4194304" };
      case "df": return { output: "Filesystem      Size  Used Avail Use% Mounted on\nvirtual-disk    128G   13G  115G  10% /\ntmpfs            8G   12M    8G   1% /run" };
      case "du": return { output: "12K\t/etc\n4.0K\t/tmp\n128M\t/usr\n420M\t/home/henry\n620M\t/var" };
      case "lsblk": return { output: "NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS\nvda    254:0    0   128G  0 disk\n└─vda1 254:1    0   128G  0 part /" };
      case "lscpu": return { output: "Architecture: x86_64\nCPU(s): 8\nModel name: Virtual CPU\nThread(s) per core: 2\nCore(s) per socket: 4\nVirtualization: browser" };
      case "lspci": return { output: "00:02.0 VGA compatible controller: Virtual Graphics Adapter\n00:03.0 Ethernet controller: Virtual Network Device" };
      case "lsusb": return { output: "Bus 001 Device 001: Virtual USB root hub\nBus 001 Device 002: Virtual HID device" };
      case "ps": return { output: ["  PID USER     %CPU %MEM COMMAND", ...BASE_PROCESSES.map((p) => ` ${p[0]} ${p[1].padEnd(8)} ${p[2].padStart(4)} ${p[3].padStart(4)} ${p[4]}`)].join("\n") };
      case "top":
      case "htop": return { output: "Tasks: 24 total, 1 running, 23 sleeping\n%Cpu(s): 2.1 us, 0.9 sy, 97.0 id\nMiB Mem : 16000 total, 3400 used, 11800 free\n\n  PID USER      %CPU %MEM COMMAND\n 1180 user       1.3  2.1 terminal-ui\n 1042 user       0.8  1.4 bash\n  731 root       0.2  0.7 sshd" };
      case "ip":
      case "ifconfig": return { output: "eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 192.168.1.42  netmask 255.255.255.0\nlo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n        inet 127.0.0.1  netmask 255.0.0.0" };
      case "ping": return { output: `${args[0] ?? "localhost"} (${args[0] ?? "127.0.0.1"}): simulated ICMP in browser sandbox\n64 bytes from ${args[0] ?? "localhost"}: icmp_seq=1 ttl=57 time=12.4 ms\n64 bytes from ${args[0] ?? "localhost"}: icmp_seq=2 ttl=57 time=11.8 ms\n--- ${args[0] ?? "localhost"} ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss` };
      case "traceroute":
      case "tracepath": return { output: ` 1  192.168.1.1  1.3 ms\n 2  10.0.0.1  5.7 ms\n 3  ${args[0] ?? "example.com"}  12.9 ms\n\n(simulated route; raw sockets are unavailable to a browser)` };
      case "dig":
      case "nslookup":
      case "host": return { output: `Server: 1.1.1.1\nAddress: 1.1.1.1#53\n\nName: ${args[0] ?? "example.com"}\nAddress: 93.184.216.34\n(simulated DNS response)` };
      case "curl":
      case "wget": {
        const url = args.find((a) => /^https?:\/\//i.test(a));
        if (!url) return { output: `${command}: try '${command} https://example.com'`, error: true };
        try {
          const response = await fetch(url, { headers: { Accept: "*/*" } });
          const text = await response.text();
          const clipped = text.slice(0, 6000);
          return { output: `${command}: HTTP ${response.status} ${response.statusText}\ncontent-type: ${response.headers.get("content-type") ?? "unknown"}\n\n${clipped}` };
        } catch {
          return { output: `${command}: network request blocked by browser CORS policy or unavailable host. No request was made through a server.`, error: true };
        }
      }
      case "netstat":
      case "ss": return { output: "Netid State  Local Address:Port  Peer Address:Port Process\ntcp   LISTEN  0.0.0.0:22        0.0.0.0:*     sshd (simulated)\ntcp   ESTAB   192.168.1.42:443  1.1.1.1:*     browser-fetch" };
      case "route": return { output: "Destination     Gateway         Genmask         Flags Metric Iface\n0.0.0.0         192.168.1.1     0.0.0.0         UG    100    eth0\n192.168.1.0     0.0.0.0         255.255.255.0 U     100    eth0" };
      case "which": return { output: args[0] && COMMANDS.includes(args[0]) ? `/usr/bin/${args[0]}` : "" };
      case "sudo": {
        if (user === "root") return executeSimple(args, stdin);
        const target = args[0] === "-u" ? (args[1] as UserName) : "root";
        if (target && !USERS[target]) return { output: `sudo: unknown user ${target}`, error: true };
        if (active.passwordMode) return { output: "" };
        return { output: `[sudo] password for ${user}:`, nextSession: { passwordMode: user, passwordTarget: target as UserName } };
      }
      case "su": {
        const target = (args.find((a) => !a.startsWith("-")) ?? "root") as UserName;
        if (!USERS[target]) return { output: `su: user ${target} does not exist`, error: true };
        return { output: `Password for ${target}:`, nextSession: { passwordMode: user, passwordTarget: target } };
      }
      case "passwd": return { output: "Changing password for user.\nNew password: \nRetype new password: \npasswd: password updated successfully (simulated)." };
      case "chmod":
      case "chown": {
        if (!isPrivileged) return { output: permissionDenied(command), error: true };
        const target = args.at(-1); if (!target) return { output: `${command}: missing operand`, error: true };
        const n = getNode(fsWork, resolvePath(active.cwd, target)); if (!n) return { output: `${command}: cannot access '${target}'`, error: true };
        if (command === "chmod" && args[0]) n.mode = n.type === "dir" ? `d${args[0] === "777" ? "rwxrwxrwx" : "rwxr-xr-x"}` : `-${args[0] === "777" ? "rwxrwxrwx" : "rw-r--r--"}`;
        if (command === "chown" && args[0]) { const [owner, group] = args[0].split(":"); n.owner = owner || n.owner; n.group = group || n.group; }
        return { output: "", nextFs: fsWork };
      }
      case "apt":
      case "apt-get":
      case "dpkg":
        if (!isPrivileged) return { output: permissionDenied(command), error: true };
        return { output: command === "apt" && args[0] === "update" ? "Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease\nHit:2 http://security.ubuntu.com/ubuntu noble-security InRelease\nReading package lists... Done\n1842 packages can be upgraded." : `${command}: simulated package operation completed successfully.` };
      case "systemctl":
      case "service":
        if (!isPrivileged) return { output: permissionDenied(command), error: true };
        return { output: `${command}: simulated system manager: ${args.join(" ") || "status"}\n● nginx.service - Virtual web server\n   Loaded: loaded\n   Active: active (running)` };
      case "journalctl": return { output: "Aug 30 17:50 henry systemd[1]: Started NetworkManager.\nAug 30 17:51 henry systemd[1]: Started ssh.service.\nAug 30 17:52 henry bash[1042]: terminal session ready." };
      case "shutdown":
      case "reboot": return isPrivileged ? { output: `${command}: simulated. The browser page remains running; no host shutdown is performed.` } : { output: permissionDenied(command), error: true };
      case "date": return { output: new Date().toString() };
      case "timedatectl": return { output: `               Local time: ${new Date().toLocaleString()}\n           Universal time: ${new Date().toUTCString()}\n                 Time zone: Europe/Paris\nSystem clock synchronized: yes\n              NTP service: active (simulated)` };
      case "kill":
      case "pkill": return { output: `Terminated simulated process ${args.join(" ") || "<unknown>"}.` };
      case "jobs": return { output: "[1]+  Running                 sleep 999 &" };
      case "bg":
      case "fg": return { output: `${command}: simulated job control complete` };
      case "bash":
      case "sh": return { output: `${command === "bash" ? "GNU bash, version 5.2.21" : "dash 0.5"}\nEntering nested ${command} shell. Type exit to return.`, nextSession: { shellStack: [...active.shellStack, active.env.SHELL], env: { ...active.env, SHELL: command === "bash" ? "/bin/bash" : "/bin/sh" } } };
      case "exit": return active.shellStack.length ? { output: "logout", nextSession: { shellStack: active.shellStack.slice(0, -1), env: { ...active.env, SHELL: active.shellStack.at(-1) ?? "/bin/bash" } } } : { output: "logout", stop: true };
      case "tar":
      case "gzip":
      case "gunzip":
      case "zip":
      case "unzip": return { output: `${command}: archive operation completed in virtual filesystem.` };
      default: return { output: `bash: ${command}: command not found`, error: true };
    }
  };

  const executeLine = async () => {
    if (!active.input.trim()) return;
    const commandLine = active.input.trim();
    if (active.passwordMode) {
      const target = active.passwordTarget ?? "root";
      const expected = USERS[target].password;
      const submitted = commandLine;
      if (submitted !== expected) {
        appendOutput("Sorry, try again.", "error");
        updateActive({ input: "", passwordMode: null, passwordTarget: null });
        return;
      }
      updateActive({ input: "", passwordMode: null, passwordTarget: null, user: target, cwd: target === "root" ? "/root" : USERS[target].home });
      appendOutput(formatPrompt(target, target === "root" ? "/root" : USERS[target].home));
      return;
    }
    updateActive({ input: "", history: [...active.history, commandLine], historyIndex: -1 });
    const prompt = formatPrompt(active.user, active.cwd);
    const inputLine = `${prompt} ${commandLine}`;
    setSessions((current) => current.map((s) => s.id === activeId ? { ...s, lines: [...s.lines, line("input", inputLine, idRef)] } : s));

    const tokens = tokenize(commandLine);
    const segments: string[][] = [[]];
    const connectors: string[] = [];
    for (const token of tokens) {
      if (["|", ";", "&&"].includes(token)) { connectors.push(token); segments.push([]); } else segments.at(-1)!.push(token);
    }
    let stdin = "";
    let finalNextFs: FSNode | undefined;
    let finalSession: Partial<Session> = {};
    for (let i = 0; i < segments.length; i += 1) {
      let argv = segments[i];
      if (!argv.length) continue;
      const alias = active.aliases[argv[0]]; if (alias) argv = [...tokenize(alias), ...argv.slice(1)];
      let redirect: { append: boolean; path: string } | null = null;
      const filtered: string[] = [];
      for (let j = 0; j < argv.length; j += 1) {
        if (argv[j] === ">" || argv[j] === ">>") { redirect = { append: argv[j] === ">>", path: argv[++j] ?? "" }; } else filtered.push(argv[j]);
      }
      try {
        const result = await executeSimple(filtered, stdin);
        if (result.output) stdin = result.output;
        if (result.error) { appendOutput(result.output, "error"); stdin = ""; break; }
        if (result.nextFs) finalNextFs = result.nextFs;
        if (result.nextSession) finalSession = { ...finalSession, ...result.nextSession };
        if (redirect) {
          const outPath = resolvePath(active.cwd, redirect.path);
          const f = cloneFS(finalNextFs ?? fs); const { parent, name } = getParent(f, outPath);
          if (!parent?.children) { appendOutput(`bash: ${redirect.path}: No such file or directory`, "error"); stdin = ""; break; }
          const existing = parent.children[name]; const content = redirect.append && existing ? `${existing.content ?? ""}${stdin}` : stdin;
          parent.children[name] = existing ?? { type: "file", name, mode: "-rw-r--r--", owner: active.user, group: USERS[active.user].groups[0], content };
          parent.children[name].content = content;
          finalNextFs = f;
          stdin = "";
        }
        if (connectors[i] === "|") { continue; }
        if (connectors[i] === "&&" && result.error) break;
        if (connectors[i] !== "|") { if (stdin) { appendOutput(stdin); stdin = ""; } }
      } catch {
        appendOutput("bash: execution error in simulated shell", "error");
        break;
      }
    }
    if (finalNextFs) persistFS(finalNextFs);
    if (Object.keys(finalSession).length) updateActive(finalSession);
    if (commandLine === "clear") updateActive({ lines: [] });
    inputRef.current?.focus();
  };

  const onInputKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") { event.preventDefault(); await executeLine(); return; }
    if (event.key === "ArrowUp") { event.preventDefault(); if (!active.history.length) return; const idx = active.historyIndex < 0 ? active.history.length - 1 : Math.max(0, active.historyIndex - 1); updateActive({ historyIndex: idx, input: active.history[idx] }); }
    if (event.key === "ArrowDown") { event.preventDefault(); if (!active.history.length) return; const idx = active.historyIndex < 0 ? -1 : active.historyIndex + 1; updateActive({ historyIndex: idx, input: idx >= 0 && idx < active.history.length ? active.history[idx] : "" }); }
    if (event.key === "Tab") { event.preventDefault(); autoComplete(); }
    if (event.ctrlKey && event.key === "c") { updateActive({ input: "" }); appendOutput("^C"); }
    if (event.ctrlKey && event.key === "d" && !active.input) { await executeSimple(["exit"]); }
  };

  const addTab = () => {
    const session = getInitialSession(); session.title = `terminal-${sessions.length + 1}`; session.user = active.user; session.cwd = active.cwd; session.env = { ...active.env }; session.aliases = { ...active.aliases };
    setSessions((current) => [...current, session]); setActiveId(session.id);
  };

  const closeTab = (id: string) => {
    if (sessions.length === 1) return;
    const remaining = sessions.filter((s) => s.id !== id); setSessions(remaining); if (id === activeId) setActiveId(remaining[remaining.length - 1].id);
  };

  const toggleFullscreen = async () => {
    try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); else await document.exitFullscreen(); } catch { /* fullscreen optional */ }
    setFullscreen((v) => !v);
  };

  const exportFS = () => {
    const blob = new Blob([JSON.stringify(fs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "henry-linux-filesystem.json"; a.click(); URL.revokeObjectURL(url);
  };

  const importFS = (file: File) => {
    const reader = new FileReader(); reader.onload = () => { try { const imported = JSON.parse(String(reader.result)); if (imported?.type === "dir" && imported.children) persistFS(imported); } catch { appendOutput("import: invalid virtual filesystem file", "error"); } }; reader.readAsText(file);
  };

  const filteredLines = useMemo(() => {
    if (!searchQuery) return active.lines;
    const q = searchQuery.toLowerCase(); return active.lines.filter((l) => l.text.toLowerCase().includes(q));
  }, [active.lines, searchQuery]);

  return (
    <div className="linux-app" onClick={() => inputRef.current?.focus()}>
      <header className="topbar">
        <div className="brand"><div className="brand-icon"><SquareTerminal size={18} /></div><div><strong>henry</strong><span>Ubuntu Simulator</span></div></div>
        <div className="top-actions">
          <button title="Files" onClick={(e) => { e.stopPropagation(); setPanel(panel === "files" ? null : "files"); }}><FolderOpen size={16} /></button>
          <button title="Processes" onClick={(e) => { e.stopPropagation(); setPanel(panel === "processes" ? null : "processes"); }}><Activity size={16} /></button>
          <button title="System" onClick={(e) => { e.stopPropagation(); setPanel(panel === "system" ? null : "system"); }}><Cpu size={16} /></button>
          <button title="Network" onClick={(e) => { e.stopPropagation(); setPanel(panel === "network" ? null : "network"); }}><Network size={16} /></button>
          <button title="Settings" onClick={(e) => { e.stopPropagation(); setPanel(panel === "settings" ? null : "settings"); }}><Settings size={16} /></button>
          <button title="Search (Ctrl+F)" onClick={(e) => { e.stopPropagation(); setSearchOpen(true); }}><Search size={16} /></button>
          <button title="Fullscreen" onClick={(e) => { e.stopPropagation(); void toggleFullscreen(); }}>{fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button>
        </div>
      </header>

      <div className="tabbar" onClick={(e) => e.stopPropagation()}>
        {sessions.map((s) => (
          <button key={s.id} className={`tab ${s.id === activeId ? "active" : ""}`} onClick={() => setActiveId(s.id)}>
            <span className="tab-dot" />{s.title}
            {sessions.length > 1 && <span className="tab-close" onClick={(e) => { e.stopPropagation(); closeTab(s.id); }}><X size={12} /></span>}
          </button>
        ))}
        <button className="add-tab" title="New terminal" onClick={addTab}><Plus size={15} /></button>
      </div>

      <main className="workspace">
        <section className="terminal-shell">
          <div className="terminal-titlebar">
            <div className="window-controls"><span className="wc red" /><span className="wc yellow" /><span className="wc green" /></div>
            <div className="terminal-title"><SquareTerminal size={14} /> {formatPrompt(active.user, active.cwd)}</div>
            <div className="title-spacer" />
            <span className="status-pill"><Wifi size={12} /> sandbox</span>
          </div>
          <div className="terminal-output" ref={terminalRef} onClick={() => inputRef.current?.focus()}>
            {filteredLines.map((l) => <div key={l.id} className={`terminal-line ${l.kind}`}><span>{l.text}</span></div>)}
            <div className="input-row">
              <span className="prompt">{formatPrompt(active.user, active.cwd)} </span>
              <input ref={inputRef} autoFocus value={active.input} onChange={(e) => updateActive({ input: e.target.value })} onKeyDown={(e) => void onInputKeyDown(e)} spellCheck={false} autoComplete="off" aria-label="Terminal input" />
              <span className="cursor" />
            </div>
          </div>
          <div className="terminal-footer"><span><Shield size={12} /> Browser sandbox · no host commands</span><span>Ctrl+L clear · Ctrl+F search · Tab complete · ↑↓ history</span></div>
        </section>

        <AnimatePresence>
          {panel && (
            <motion.aside initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} className="side-panel" onClick={(e) => e.stopPropagation()}>
              <div className="panel-header"><div><span className="eyebrow">SYSTEM</span><h2>{panel === "files" ? "File explorer" : panel === "processes" ? "Processes" : panel === "system" ? "System" : panel === "network" ? "Network" : "Settings"}</h2></div><button onClick={() => setPanel(null)}><X size={16} /></button></div>
              {panel === "files" && <FileExplorer root={fs} cwd={active.cwd} onNavigate={(path) => updateActive({ cwd: path })} onImport={importFS} onExport={exportFS} />}
              {panel === "processes" && <ProcessPanel />}
              {panel === "system" && <SystemPanel user={active.user} cwd={active.cwd} />}
              {panel === "network" && <NetworkPanel />}
              {panel === "settings" && <SettingsPanel sessions={sessions.length} onReset={() => { persistFS(cloneFS(initialFiles)); setSessions([getInitialSession()]); setActiveId(sessions[0].id); }} />}
            </motion.aside>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {searchOpen && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSearchOpen(false)}>
          <motion.div className="search-modal" initial={{ y: -10 }} animate={{ y: 0 }} onClick={(e) => e.stopPropagation()}>
            <Search size={17} /><input autoFocus placeholder="Search terminal output…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /><span>{filteredLines.length} matches</span><button onClick={() => setSearchOpen(false)}><X size={15} /></button>
          </motion.div>
        </motion.div>}
      </AnimatePresence>

      <AnimatePresence>
        {nano && <NanoEditor path={nano.path} content={nano.content} onClose={() => setNano(null)} onSave={(content) => { const next = cloneFS(fs); const target = getNode(next, nano.path); if (target?.type === "file") target.content = content; persistFS(next); setNano(null); appendOutput(`[ nano ] saved ${nano.path}`); }} />}
      </AnimatePresence>

      <div className="shortcut-strip"><span><Gauge size={13} /> 16 GiB</span><span><HardDrive size={13} /> 128 GiB</span><span><Server size={13} /> 8 vCPU</span><span><Network size={13} /> 192.168.1.42</span><span className="push-right">{active.user}@henry · {active.cwd}</span></div>
    </div>
  );
}

function FileExplorer({ root, cwd, onNavigate, onImport, onExport }: { root: FSNode; cwd: string; onNavigate: (path: string) => void; onImport: (file: File) => void; onExport: () => void }) {
  const node = getNode(root, cwd) ?? root;
  const entries = Object.values(node.children ?? {}).sort((a, b) => Number(b.type === "dir") - Number(a.type === "dir") || a.name.localeCompare(b.name));
  return <div className="panel-body"><div className="path-box"><span>/</span><input value={cwd} onChange={(e) => onNavigate(resolvePath("/", e.target.value))} onKeyDown={(e) => { if (e.key === "Enter") onNavigate(resolvePath("/", e.currentTarget.value)); }} /></div><div className="explorer-list">{cwd !== "/" && <button onClick={() => onNavigate(resolvePath(cwd, ".."))}><ChevronRight size={14} /> ..</button>}{entries.map((n) => <button key={n.name} onDoubleClick={() => n.type === "dir" && onNavigate(resolvePath(cwd, n.name))}><span className="file-icon">{n.type === "dir" ? <Folder size={14} /> : <FileText size={14} />}</span>{n.name}<span className="file-type">{n.type}</span></button>)}</div><div className="panel-actions"><button onClick={onExport}><Download size={14} /> Export FS</button><label><Upload size={14} /> Import FS<input type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} /></label></div></div>;
}

function ProcessPanel() { return <div className="panel-body"><div className="metric-grid"><div><strong>24</strong><span>tasks</span></div><div><strong>2.1%</strong><span>cpu</span></div><div><strong>3.4G</strong><span>memory</span></div></div><div className="table-wrap"><table><thead><tr><th>PID</th><th>USER</th><th>%CPU</th><th>COMMAND</th></tr></thead><tbody>{BASE_PROCESSES.map((p) => <tr key={p[0]}><td>{p[0]}</td><td>{p[1]}</td><td>{p[2]}</td><td>{p[4]}</td></tr>)}</tbody></table></div></div>; }

function SystemPanel({ user, cwd }: { user: UserName; cwd: string }) { return <div className="panel-body"><div className="info-card"><Cpu size={18} /><div><span>CPU</span><strong>Virtual CPU · 8 cores</strong></div></div><div className="info-card"><Layers3 size={18} /><div><span>Kernel</span><strong>Linux 6.8.0-virtual</strong></div></div><div className="info-card"><Shield size={18} /><div><span>Session</span><strong>{user}@henry · {cwd}</strong></div></div><div className="info-card"><BookOpen size={18} /><div><span>Shell</span><strong>{user === "root" ? "root shell" : "bash 5.2"}</strong></div></div></div>; }

function NetworkPanel() { return <div className="panel-body"><div className="online-banner"><span className="pulse" /> Browser network bridge available</div><div className="net-card"><div><Network size={15} /><strong>eth0</strong><span>UP</span></div><p>192.168.1.42 / 24</p><small>Gateway 192.168.1.1 · DNS 1.1.1.1</small></div><div className="net-card"><div><Wifi size={15} /><strong>HTTP</strong><span>Fetch</span></div><p>Real requests when CORS permits</p><small>Raw ICMP/TCP sockets remain simulated.</small></div></div>; }

function SettingsPanel({ sessions, onReset }: { sessions: number; onReset: () => void }) { return <div className="panel-body"><div className="settings-row"><div><strong>Tabs</strong><span>{sessions} terminal session(s)</span></div><SquareTerminal size={16} /></div><div className="settings-row"><div><strong>Persistence</strong><span>Local browser storage enabled</span></div><RefreshCw size={16} /></div><div className="settings-row"><div><strong>Host safety</strong><span>System command execution disabled</span></div><Shield size={16} /></div><button className="danger-button" onClick={onReset}><Trash2 size={14} /> Reset virtual filesystem</button></div>; }

function NanoEditor({ path, content, onClose, onSave }: { path: string; content: string; onClose: () => void; onSave: (content: string) => void }) { const [value, setValue] = useState(content); return <div className="modal-backdrop"><div className="nano"><div className="nano-title"><span>GNU nano · {path}</span><button onClick={onClose}><X size={15} /></button></div><textarea autoFocus value={value} onChange={(e) => setValue(e.target.value)} /><div className="nano-footer"><span>^X Exit</span><span>^O Write Out</span><button onClick={() => onSave(value)}>Save</button></div></div></div>; }

export default App;
