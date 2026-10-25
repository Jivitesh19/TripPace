import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Sparkles, Minus, Plus, Trash2, ChevronDown, MapPin, Clock, Wallet, Sun, Sunset, Moon, Loader2, ArrowUpRight, Compass, Check, CalendarDays, Footprints, Lightbulb, Landmark, Utensils, Trees, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import washingtonPhoto from "@/assets/washington-dc.jpg";
import { Slider } from "@/components/ui/slider";
import { dcPreset, umdPreset, type Activity, type Budget, type Category, type Slot } from "@/lib/trip-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TripPace — Smart Itinerary & Pacing Planner" },
      { name: "description", content: "Build paced travel itineraries with live fatigue and budget estimates." },
      { property: "og:title", content: "TripPace — Smart Itinerary & Pacing Planner" },
      { property: "og:description", content: "Build paced travel itineraries with live fatigue and budget estimates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const BUDGETS: { id: Budget; sym: string; label: string; desc: string; perDay: number }[] = [
  { id: "budget", sym: "$", label: "Budget", desc: "Thrifty (~$40/day) - Free sights & quick bites", perDay: 40 },
  { id: "balanced", sym: "$$", label: "Balanced", desc: "Moderate (~$95/day) - Casual dining & paid exhibits", perDay: 95 },
  { id: "splurge", sym: "$$$", label: "Premium", desc: "Premium (~$200+/day) - Sit-down dining & tours", perDay: 200 },
];
const MULT: Record<Budget, number> = { budget: 1, balanced: 2, splurge: 4 };
const CAT: Record<Category, string> = {
  Food: "category-food", Museum: "category-museum", Sightseeing: "category-sightseeing", Outdoor: "category-outdoor", Chill: "category-chill",
};
const CATEGORY_ICONS = { Food: Utensils, Museum: Landmark, Sightseeing: MapPin, Outdoor: Trees, Chill: Coffee };
const SLOTS: { s: Slot; Icon: typeof Sun }[] = [
  { s: "Morning", Icon: Sun }, { s: "Afternoon", Icon: Sunset }, { s: "Evening", Icon: Moon },
];
const clone = (x: Activity[][]) => x.map((d) => d.map((i) => ({ ...i })));

// Scale the base itinerary to N days by cycling sample days.
function build(base: Activity[][], days: number) {
  return Array.from({ length: days }, (_, i) =>
    (base[i % base.length] ?? []).map((x) => ({ ...x, id: `${x.id}-${i}-${Math.random().toString(36).slice(2, 6)}` })),
  );
}

function Index() {
  const [destination, setDestination] = useState(dcPreset.destination);
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState<Budget>(dcPreset.budget);
  const [notes, setNotes] = useState(dcPreset.notes);
  const [plan, setPlan] = useState<Activity[][]>(clone(dcPreset.itinerary));
  const [planBudget, setPlanBudget] = useState<Budget>(dcPreset.budget);
  const [day, setDay] = useState(0);
  const [open, setOpen] = useState<Record<Slot, boolean>>({ Morning: true, Afternoon: true, Evening: true });
  const [loading, setLoading] = useState(false);
  const [planDestination, setPlanDestination] = useState(dcPreset.destination);

  const applyPreset = (p: typeof dcPreset) => {
    setPlanDestination(p.destination); setDestination(p.destination); setDays(p.days); setBudget(p.budget); setNotes(p.notes);
    setPlan(clone(p.itinerary)); setPlanBudget(p.budget); setDay(0);
  };
  const generate = async () => {
    setLoading(true);

    const prompt = `You are a travel itinerary planner.
Destination: ${destination}
Trip Length: ${days} days
Budget Tier: ${budget}
Must-visit spots / Notes: ${notes || "None"}

Create a complete itinerary covering all ${days} day(s).
For each day, include 3 to 4 activities spread across "Morning", "Afternoon", and "Evening".
Valid slots: "Morning", "Afternoon", "Evening".
Valid categories: "Museum", "Food", "Sightseeing", "Outdoor", "Chill".

Output strictly valid JSON with this exact schema:
{
  "activities": [
    {
      "id": "act-1",
      "day": 1,
      "name": "Specific venue or landmark name in ${destination}",
      "category": "Sightseeing",
      "slot": "Morning",
      "time": "9:30 AM",
      "duration": 90,
      "cost": 0,
      "tip": "Short visitor tip."
    }
  ]
}`;

    try {
      const res = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3.2:3b",
          prompt: prompt,
          format: "json",
          stream: false,
          options: {
            temperature: 0.3,
          },
        }),
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      const data = await res.json();
      console.log("Raw Ollama Response:", data.response);

      const parsed = JSON.parse(data.response);
      const allActivities: (Activity & { day?: number })[] = parsed.activities || [];

      if (!Array.isArray(allActivities) || allActivities.length === 0) {
        throw new Error("No activities returned from model");
      }

      // Group flat activities into an array of days (index 0 = Day 1)
      const newPlan: Activity[][] = Array.from({ length: days }, (_, dayIdx) => {
        const targetDayNumber = dayIdx + 1;
        const dayItems = allActivities
          .filter((a) => (a.day ?? 1) === targetDayNumber)
          .map((a, i) => ({
            id: a.id || `act-${dayIdx}-${i}-${Math.random().toString(36).slice(2, 6)}`,
            name: a.name || "Local Exploration",
            category: (["Museum", "Food", "Sightseeing", "Outdoor", "Chill"].includes(a.category)
              ? a.category
              : "Sightseeing") as Category,
            slot: (["Morning", "Afternoon", "Evening"].includes(a.slot) ? a.slot : "Morning") as Slot,
            time: a.time || "10:00 AM",
            duration: Number(a.duration) || 60,
            cost: Number(a.cost) || 0,
            tip: a.tip || "Enjoy the visit.",
          }));

        return dayItems;
      });

      setPlanDestination(destination);
      setPlan(newPlan);
      setPlanBudget(budget);
      setDay(0);
    } catch (err) {
      console.warn("Generation failed or invalid schema, falling back to preset:", err);
      const base = /college|umd|maryland/i.test(destination) ? umdPreset.itinerary : dcPreset.itinerary;
      setPlanDestination(destination);
      setPlan(build(base, days));
      setPlanBudget(budget);
      setDay(0);
    } finally {
      setLoading(false);
    }
  };

  // Keep the schedule in step with the trip-length slider: trim extra days,
  // or extend by repeating the days already planned (edits carry over).
  const setTripDays = (n: number) => {
    setDays(n);
    setPlan((p) => {
      const base = p.length ? p : clone(dcPreset.itinerary);
      return Array.from({ length: n }, (_, i) =>
        (base[i % base.length] ?? []).map((x) => ({ ...x, id: `${x.id}-${i}-${Math.random().toString(36).slice(2, 6)}` })),
      );
    });
    setDay((d) => Math.min(d, n - 1));
  };

  const items = plan[day] ?? [];
  const mult = MULT[planBudget];
  const activeHrs = items.reduce((s, i) => s + i.duration, 0) / 60;
  const costOf = (i: Activity) => Math.round(i.cost * mult);
  // base daily overhead (transit + snacks) scaled with budget style
  const overhead = { budget: 12, balanced: 40, splurge: 110 }[planBudget];
  const total = useMemo(
    () => plan.reduce((s, d) => s + overhead + d.reduce((t, i) => t + Math.round(i.cost * mult), 0), 0),
    [plan, mult, overhead],
  );
  const avg = plan.length ? Math.round(total / plan.length) : 0;
  const pace = activeHrs < 4.5
    ? { label: "Relaxed Pace", cls: "pace-relaxed", bar: "bg-primary" }
    : activeHrs <= 7.5
      ? { label: "Balanced Pace", cls: "pace-balanced", bar: "bg-info" }
      : { label: "Packed Day - High Fatigue", cls: "pace-packed", bar: "bg-warning" };

  const update = (id: string, fn: (a: Activity) => Activity | null) =>
    setPlan((p) => p.map((d, i) => i !== day ? d : d.flatMap((a) => { if (a.id !== id) return [a]; const r = fn(a); return r ? [r] : []; })));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#planner" className="skip-link">Skip to planner</a>
      <header className="border-b border-border">
        <div className="page-width flex h-20 items-center justify-between">
          <a href="/" className="flex items-center gap-3" aria-label="TripPace home">
            <span className="brand-mark"><Compass className="h-6 w-6" /></span>
            <span className="font-display text-2xl font-semibold">TripPace<span className="text-primary">.</span></span>
          </a>
          <span className="flex items-center gap-2 text-sm text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> <span className="hidden sm:inline">Less rush. More discovery.</span><span className="sm:hidden">Trip planner</span></span>
        </div>
      </header>
      <main id="planner" className="page-width py-9">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div><p className="eyebrow mb-2">THE JOURNEY STARTS HERE</p><h1 className="font-display text-3xl font-medium sm:text-4xl">Your trip, your pace<span className="text-primary">.</span></h1></div>
          <span className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="h-4 w-4" /> {plan.length}-day itinerary <span className="mx-1 text-border">/</span> <span className="text-foreground">{BUDGETS.find(b => b.id === planBudget)?.label}</span></span>
        </div>
        <div className="grid items-start gap-8 lg:grid-cols-[320px_minmax(0,1fr)] xl:gap-12">
          <aside className="space-y-6 lg:sticky lg:top-6">
            <div className="flex items-center gap-2 border-b border-border pb-4"><Compass className="h-4 w-4 text-primary" /><h2 className="text-base font-semibold">Trip details</h2><span className="ml-auto font-mono text-xs text-muted-foreground">01</span></div>
            <Field label="Destination" htmlFor="destination"><div className="relative"><MapPin className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" /><input id="destination" value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g., Washington, D.C. or College Park" className="form-input pl-10" /></div></Field>
            <Field label="Trip length">
              <div className="mb-3 flex items-baseline justify-between"><span className="font-display text-2xl">{days} <span className="text-sm text-muted-foreground">day{days > 1 && "s"}</span></span><span className="text-xs text-muted-foreground">Up to two weeks</span></div>
              <Slider min={1} max={14} step={1} value={[days]} onValueChange={v => setTripDays(v[0] ?? days)} aria-label="Trip length in days" className="h-7" />
              <div className="mt-1 flex justify-between font-mono text-xs text-muted-foreground"><span>1 day</span><span>14 days</span></div>
            </Field>
            <Field label="Budget style">
              <div className="space-y-2" role="group" aria-label="Budget style">{BUDGETS.map(b => <Button key={b.id} variant="outline" onClick={() => setBudget(b.id)} aria-pressed={budget === b.id} className={`budget-option ${budget === b.id ? "budget-selected" : ""}`}><span className="budget-symbol">{b.sym}</span><span className="min-w-0 flex-1"><span className="flex items-baseline justify-between gap-2"><span className="font-semibold">{b.id === "splurge" ? "Premium" : b.label}</span><span className="text-xs text-muted-foreground">~${b.perDay}{b.id === "splurge" && "+"}/day</span></span><span className="mt-1 block text-xs font-normal text-muted-foreground">{b.desc.split(" - ")[1]}</span></span><span className="budget-check">{budget === b.id && <Check className="h-3 w-3" />}</span></Button>)}</div>
            </Field>
            <Field label="Must-visit spots & notes" htmlFor="notes"><textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Museums, local favorites, a great ramen spot…" className="form-input resize-y" /></Field>
            <Button onClick={generate} disabled={loading} className="h-12 w-full justify-between px-4 font-semibold"><span className="flex items-center gap-2">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{loading ? "Building..." : "Generate Itinerary"}</span><ArrowUpRight className="h-4 w-4" /></Button>
            <div className="border-t border-border pt-5"><p className="eyebrow mb-3">TRY A DEMO TRIP</p><div className="space-y-2"><Button variant="ghost" onClick={() => applyPreset(dcPreset)} className="demo-button"><Landmark className="text-muted-foreground" /><span className="flex-1">D.C. Smithsonian Blitz</span><span className="text-xs text-muted-foreground">3 days</span><ArrowUpRight /></Button><Button variant="ghost" onClick={() => applyPreset(umdPreset)} className="demo-button"><Trees className="text-muted-foreground" /><span className="flex-1">UMD & College Park</span><span className="text-xs text-muted-foreground">1 day</span><ArrowUpRight /></Button></div></div>
          </aside>
          <section className="min-w-0 space-y-6" aria-label="Your itinerary" aria-busy={loading}>
            <div className={`destination-cover ${/washington|d\.c\./i.test(planDestination) ? "has-photo" : ""}`}>
              <img
  key={planDestination}
  src={`https://picsum.photos/seed/${encodeURIComponent(planDestination || "travel")}/1536/512?grayscale`}
  alt={planDestination}
  className="absolute inset-0 h-full w-full object-cover brightness-50 contrast-125"
  onError={(e) => {
    e.currentTarget.style.display = "none";
  }}
/>
              <div className="cover-content"><span className="cover-eyebrow"><MapPin className="h-3.5 w-3.5" /> YOUR DESTINATION</span><h2 className="font-display text-3xl font-medium sm:text-4xl">{planDestination || "Your next destination"}</h2><span className="mt-2 flex items-center gap-2 text-sm"><CalendarDays className="h-4 w-4" /> {plan.length} day{plan.length > 1 && "s"} <span className="cover-dot" /> {plan.reduce((n, d) => n + d.length, 0)} experiences</span></div>
              <span className="cover-stamp"><Compass className="h-6 w-6" /></span>
            </div>
            <div className="metrics-grid">
              <div className="metric-block"><div className="eyebrow flex items-center gap-2"><Footprints className="h-4 w-4" /> DAY {day + 1} PACING</div><div className="mt-3 flex flex-wrap items-baseline gap-2"><span className="font-display text-3xl tabular-nums">{activeHrs.toFixed(1)}</span><span className="text-sm text-muted-foreground">hours active</span><span className={`pace-tag ${pace.cls}`}>{pace.label}</span></div><div className="mt-4 flex gap-1.5" aria-label={`${activeHrs.toFixed(1)} hours active`}>{Array.from({length:20}, (_, i) => <span key={i} className={`h-1.5 flex-1 rounded-sm ${i < Math.min(20, activeHrs * 2) ? pace.bar : "bg-muted"}`} />)}</div></div>
              <div className="metric-block"><div className="eyebrow flex items-center gap-2"><Wallet className="h-4 w-4" /> ESTIMATED TRIP COST</div><div className="mt-3 flex flex-wrap items-baseline gap-2"><span className="font-display text-3xl tabular-nums">${total}</span><span className="text-sm text-muted-foreground">/ {plan.length} day{plan.length > 1 && "s"}</span><span className="ml-auto text-sm text-primary">${avg}<span className="text-xs text-muted-foreground"> / day</span></span></div><p className="mt-3 text-xs text-muted-foreground">Including transit & snacks</p></div>
            </div>
            <div className="flex items-center justify-between pt-1"><h2 className="font-display text-xl font-semibold">The daily plan</h2><span className="text-xs text-muted-foreground">{items.length} stops today</span></div>
            <div className="flex flex-wrap gap-2 border-b border-border pb-4" role="group" aria-label="Itinerary days">{plan.map((_, i) => <Button key={i} variant={day === i ? "secondary" : "ghost"} onClick={() => setDay(i)} aria-pressed={day === i} className={`h-10 px-4 ${day === i ? "day-selected" : "text-muted-foreground"}`}>Day {String(i + 1).padStart(2, "0")}</Button>)}</div>
            <div className="space-y-5">{SLOTS.map(({s, Icon}) => {
              const list = items.filter(i => i.slot === s);
              return <div key={s}><Button variant="ghost" onClick={() => setOpen(o => ({...o, [s]: !o[s]}))} aria-expanded={open[s]} className="slot-heading"><Icon className="text-muted-foreground" /><span>{s}</span><span className="text-xs font-normal text-muted-foreground">{list.length} stop{list.length !== 1 && "s"}</span><span className="ml-2 h-px flex-1 bg-border" /><ChevronDown className={`ml-2 text-muted-foreground transition-transform ${open[s] ? "" : "-rotate-90"}`} /></Button>
              {open[s] && <div className="timeline">{list.length === 0 && <p className="py-4 text-sm text-muted-foreground">Nothing planned — free time.</p>}{list.map(a => { const CategoryIcon = CATEGORY_ICONS[a.category]; return <article key={a.id} className="activity-card"><span className="timeline-dot" /><div className="flex items-start gap-3"><span className={`activity-icon ${CAT[a.category]}`}><CategoryIcon className="h-5 w-5" /></span><div className="min-w-0 flex-1"><div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1"><span className="font-mono text-xs text-muted-foreground">{a.time}</span><span className={`category-label ${CAT[a.category]}`}>{a.category}</span><span className="ml-auto text-xs font-medium text-muted-foreground">{costOf(a) === 0 ? "Free" : `$${costOf(a)}`}</span></div><h3 className="text-base font-semibold leading-snug">{a.name}</h3></div><Button variant="ghost" size="icon" onClick={() => update(a.id, () => null)} aria-label={`Remove ${a.name}`} title="Remove activity" className="remove-button"><Trash2 /></Button></div><div className="activity-bottom"><p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"><Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-tip" />{a.tip}</p><div className="duration-control"><Button variant="ghost" size="icon" onClick={() => update(a.id, x => ({...x, duration: Math.max(15, x.duration - 15)}))} aria-label={`Decrease duration of ${a.name}`} title="Decrease by 15 minutes"><Minus /></Button><span className="w-16 text-center font-mono text-xs tabular-nums">{a.duration} min</span><Button variant="ghost" size="icon" onClick={() => update(a.id, x => ({...x, duration: x.duration + 15}))} aria-label={`Increase duration of ${a.name}`} title="Increase by 15 minutes"><Plus /></Button></div></div></article>; })}</div>}</div>;
            })}</div>
            <div className="flex items-center justify-center gap-2 border-t border-border py-5 text-xs text-muted-foreground"><Compass className="h-4 w-4 text-primary" /> A good trip leaves room to wander.</div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return <div><label htmlFor={htmlFor} className="mb-2.5 block text-sm font-medium">{label}</label>{children}</div>;
}
