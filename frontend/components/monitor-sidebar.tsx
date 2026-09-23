const navigationItems = [
  { name: "Dashboard", active: true },
  { name: "Live Monitoring", active: false },
  { name: "Signals", active: false },
  { name: "Risk History", active: false },
  { name: "Events", active: false },
  { name: "System", active: false },
];

export default function MonitorSidebar() {
  return (
    <aside className="flex w-64 flex-col border-r border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            NA
          </div>

          <div>
            <p className="font-semibold text-white">
              Neonatal Monitor
            </p>
            <p className="text-xs text-slate-500">
              Edge Monitoring System
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3">
        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-slate-600">
          Monitoring
        </p>

        <div className="space-y-1">
          {navigationItems.map((item) => (
            <button
              key={item.name}
              className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                item.active
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="rounded-lg bg-slate-950 p-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-sm text-slate-300">
              Raspberry Pi
            </span>
          </div>

          <p className="mt-1 pl-4 text-xs text-slate-600">
            Device connected
          </p>
        </div>
      </div>
    </aside>
  );
}
