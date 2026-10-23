import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, MotionConfig } from "framer-motion";
import { cn } from "@/lib/utils";

const REFERENCES = [
  {
    id: 1,
    title: "Discovery",
    body: "Queries arXiv, Semantic Scholar, OpenAlex, CrossRef and Papers With Code in parallel, deduplicates the overlap, and ranks what remains.",
    meta: "5 sources · one query",
  },
  {
    id: 2,
    title: "Knowledge graph",
    body: "Papers become nodes, citations become edges. Pull the map apart by venue, year or author, and export what you find.",
    meta: "interactive · exportable",
  },
  {
    id: 3,
    title: "Literature review",
    body: "A draft organised by theme, where every claim carries a link back to the paper it came from.",
    meta: "citation-grounded",
  },
  {
    id: 4,
    title: "Gap finder",
    body: "Clusters the questions your collected papers raise but none of them answer — the publishable intersections.",
    meta: "underexplored territory",
  },
  {
    id: 5,
    title: "Timeline",
    body: "Sets the field in order: when it accelerated, who drove it, and what changed after each inflection point.",
    meta: "chronology",
  },
  {
    id: 6,
    title: "Datasets & benchmarks",
    body: "Collects the code, datasets and benchmarks researchers ship alongside their papers.",
    meta: "artifacts",
  },
];

const METHOD = [
  {
    n: "01",
    title: "Pose the question",
    body: "Type any topic in plain language. \u201Cmicroplastics in agricultural soil\u201D works as well as \u201Ctransformer interpretability\u201D.",
  },
  {
    n: "02",
    title: "Let it read",
    body: "Discovery runs across all five sources while the workspace fills with papers, authors, figures and code. No query syntax to learn.",
  },
  {
    n: "03",
    title: "Work the map",
    body: "Filter, annotate, bookmark, export. Everything stays in the workspace between sessions — yours to keep.",
  },
];

function Cite({
  n,
  active,
  onActivate,
}: {
  n: number;
  active: number | null;
  onActivate: (n: number | null) => void;
}) {
  return (
    <a
      href={`#ref-${n}`}
      onMouseEnter={() => onActivate(n)}
      onMouseLeave={() => onActivate(null)}
      onFocus={() => onActivate(n)}
      onBlur={() => onActivate(null)}
      aria-label={`Reference ${n}`}
      className={cn(
        "mx-0.5 inline-flex h-[1.05rem] min-w-[1.05rem] items-center justify-center rounded-[3px] px-1 align-super font-mono text-[10px] leading-none transition-colors duration-150",
        active === n
          ? "bg-highlight text-highlight-foreground"
          : "text-stamp hover:bg-stamp/10"
      )}
    >
      {n}
    </a>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeRef, setActiveRef] = useState<number | null>(null);

  const abstract: { text: string; cite?: number }[] = [
    { text: "We present ResearchOS, a workspace that takes a single research question and returns the landscape around it. Given a topic, it queries five sources", cite: 1 },
    { text: ", maps the results into a citation graph you can pull apart by hand", cite: 2 },
    { text: ", drafts a literature review with every claim anchored to its source", cite: 3 },
    { text: ", and marks the intersections nobody has published on yet", cite: 4 },
    { text: ". A timeline" },
    { text: " shows when the field moved and who moved it; datasets and benchmarks", cite: 5 },
    { text: " stay attached to the papers they belong to", cite: 6 },
    { text: ". Workspaces persist, so the second pass through a field starts where the first one ended." },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-background text-foreground">
        {/* ── Masthead ─────────────────────────────────────────── */}
        <header className="glass fixed top-0 z-50 w-full border-b">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
            <Link to="/" className="font-serif text-[17px] font-semibold tracking-tight">
              Research<span className="text-stamp">OS</span>.
            </Link>
            <div className="flex items-center gap-5">
              <button
                onClick={() => navigate("/app")}
                className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign in
              </button>
              <button
                onClick={() => navigate("/app/new-workspace")}
                className="rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Get started
              </button>
            </div>
          </div>
        </header>

        <main>
          {/* ── § Abstract — the hero is a preprint ─────────────── */}
          <section className="relative mx-auto max-w-6xl px-6 pt-32 pb-24 sm:pt-40">
            {/* running head */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="mb-14 hidden items-baseline justify-between border-b border-border pb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground md:flex"
            >
              <span>Working paper Nº 001</span>
              <span>Revised August 2026</span>
            </motion.div>

            <div className="relative max-w-[44rem]">
              {/* the stamp — the one risk this page takes */}
              <motion.div
                initial={{ opacity: 0, scale: 1.5, rotate: -14 }}
                animate={{ opacity: 1, scale: 1, rotate: -6 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 320, damping: 16 }}
                aria-hidden="true"
                className="absolute -top-10 right-0 select-none rounded-sm border-2 border-stamp/70 px-3 py-1.5 text-center font-mono uppercase text-stamp/80 sm:-right-8 lg:-right-20"
              >
                <span className="block text-[13px] tracking-[0.22em]">Preprint</span>
                <span className="mt-0.5 block text-[8px] tracking-[0.18em]">not peer reviewed</span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="eyebrow mb-5"
              >
                § 1 · Abstract
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.15 }}
                className="text-balance text-4xl leading-[1.08] sm:text-5xl lg:text-[3.4rem]"
              >
                One question in.
                <br />
                The entire field out.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.35 }}
                className="mt-5 font-mono text-xs tracking-wide text-muted-foreground"
              >
                The ResearchOS Working Group · preprint · v2.0
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="mt-8 text-[15.5px] leading-[1.75] text-foreground/85"
              >
                {abstract.map((part, i) => (
                  <span key={i}>
                    {part.text}
                    {part.cite && (
                      <Cite n={part.cite} active={activeRef} onActivate={setActiveRef} />
                    )}
                  </span>
                ))}
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.55 }}
                className="mt-6 font-mono text-xs leading-relaxed text-muted-foreground"
              >
                <span className="italic">keywords:</span> discovery · citation graphs · literature
                review · research gaps · timelines
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.65 }}
                className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3"
              >
                <button
                  onClick={() => navigate("/app/new-workspace")}
                  className="group inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Start your first workspace
                  <span className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </button>
                <a
                  href="#references"
                  className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-stamp"
                >
                  Read the references ↓
                </a>
              </motion.div>
            </div>
          </section>

          {/* ── References — features as a bibliography ─────────── */}
          <section id="references" className="border-t border-border">
            <div className="mx-auto max-w-6xl px-6 py-24">
              <div className="max-w-[44rem]">
                <p className="eyebrow mb-5">§ 2 · References</p>
                <h2 className="text-balance text-3xl leading-tight">
                  What the workspace does with your question
                </h2>
              </div>

              <ol className="mt-12 max-w-[52rem] space-y-px">
                {REFERENCES.map((ref, i) => (
                  <motion.li
                    key={ref.id}
                    id={`ref-${ref.id}`}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.4, delay: i * 0.04 }}
                    onMouseEnter={() => setActiveRef(ref.id)}
                    onMouseLeave={() => setActiveRef(null)}
                    className={cn(
                      "scroll-mt-28 flex flex-col gap-1 border-l-2 px-4 py-5 transition-colors duration-150 sm:flex-row sm:gap-6 sm:px-5",
                      activeRef === ref.id
                        ? "border-highlight bg-highlight/25"
                        : "border-transparent hover:border-border"
                    )}
                  >
                    <span className="w-8 shrink-0 pt-[3px] font-mono text-[13px] text-stamp">
                      [{ref.id}]
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="inline font-serif text-[17px] italic">{ref.title}</h3>
                      <span className="ml-3 hidden align-middle font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:inline">
                        {ref.meta}
                      </span>
                      <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                        {ref.body}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>
          </section>

          {/* ── Method ───────────────────────────────────────────── */}
          <section className="border-t border-border bg-card">
            <div className="mx-auto max-w-6xl px-6 py-24">
              <p className="eyebrow mb-5">§ 3 · Method</p>
              <h2 className="max-w-lg text-balance text-3xl leading-tight">
                Three steps between you and the landscape
              </h2>

              <div className="mt-12 grid gap-px overflow-hidden border-y border-border md:grid-cols-3">
                {METHOD.map((step) => (
                  <div key={step.n} className="border-border px-0 py-2 md:px-6 md:first:pl-0 md:last:pr-0">
                    <div className="flex h-full flex-col border-border md:border-l md:first:border-l-0 md:py-6">
                      <span className="font-mono text-xs text-stamp">{step.n}</span>
                      <h3 className="mt-3 text-lg">{step.title}</h3>
                      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                        {step.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-14 flex justify-center">
                <button
                  onClick={() => navigate("/app/new-workspace")}
                  className="group inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Open ResearchOS
                  <span className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* ── Colophon ─────────────────────────────────────────── */}
        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>
              Research<span className="text-stamp">OS</span>. — set in STIX Two Text &amp; IBM Plex
            </span>
            <span>v2.0 · MMXXVI</span>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
