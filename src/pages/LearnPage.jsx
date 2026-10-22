import React from 'react';
import { m } from 'motion/react';
import { ArrowRight, ChevronDown, MessageCircle } from '../components/icons/index.jsx';
import PublicFrame from '../components/shell/PublicFrame.jsx';
import AppLink from '../components/ui/AppLink.jsx';
import { useApp } from '../context/AppContext.jsx';
import useContent from '../hooks/useContent.js';
import { guideIn } from '../content/index.js';
import { localeInfo } from '../content/locales.js';

function LearnIndex() {
  const { ui, guides } = useContent();
  const t = ui.learn;
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-20 pt-8 sm:px-8 lg:pt-14">
      <p className="eyebrow">{t.eyebrow}</p>
      <h1 className="mt-2 text-4xl sm:text-5xl">{t.title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        {t.sub}
      </p>
      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {guides.map((g, i) => (
          <m.div key={g.slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <AppLink page="learn" param={g.slug} className="card group block h-full p-6 transition-colors hover:border-accent/40">
              <h2 className="text-xl group-hover:text-accent">{g.title}</h2>
              <p className="mt-2 text-sm text-muted">{g.short}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                {t.read} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </AppLink>
          </m.div>
        ))}
      </div>
    </div>
  );
}

function Article({ guide }) {
  const app = useApp();
  const content = useContent();
  const { ui, learnUpdated } = content;
  const t = ui.learn;
  const related = guide.related.map((slug) => guideIn(content, slug)).filter(Boolean);
  const updated = new Date(learnUpdated).toLocaleDateString(localeInfo(app.locale).hreflang, { day: 'numeric', month: 'long', year: 'numeric' });
  const askOwn = () => app.startChat(guide.ask);

  return (
    <article className="mx-auto w-full max-w-3xl px-4 pb-20 pt-6 sm:px-8 lg:pt-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><AppLink page="splash" className="hover:text-accent">{ui.nav.home}</AppLink></li>
          <li aria-hidden="true">/</li>
          <li><AppLink page="learn" className="hover:text-accent">{ui.nav.learn}</AppLink></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">{guide.title}</li>
        </ol>
      </nav>

      <h1 className="mt-6 text-4xl sm:text-5xl">{guide.title}</h1>
      <p className="mt-3 text-sm text-muted">{t.updated} {updated}</p>

      <section aria-label={t.short} className="mt-8 rounded-2xl border border-accent/30 bg-accent-soft/40 p-5 sm:p-6">
        <p className="eyebrow">{t.short}</p>
        <p className="mt-2 text-lg leading-relaxed">{guide.short}</p>
      </section>

      <div className="mt-10 space-y-10">
        {guide.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-2xl">{s.heading}</h2>
            {s.paragraphs.map((p, i) => (
              <p key={i} className="mt-3 text-[16.5px] leading-[1.75] text-ink/90">{p}</p>
            ))}
            {s.list && (
              <ul className="mt-3 list-disc space-y-1.5 pl-6 text-[16.5px] leading-[1.7] text-ink/90">
                {s.list.map((item) => <li key={item}>{item}</li>)}
              </ul>
            )}
          </section>
        ))}
      </div>

      <aside className="card mt-12 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="font-display text-xl">{t.ctaTitle}</p>
          <p className="mt-1 text-sm text-muted">{t.ctaSub}</p>
        </div>
        <button type="button" className="btn-primary" onClick={askOwn}>
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          {t.ctaButton}
        </button>
      </aside>

      <section className="mt-12" aria-labelledby="guide-faq">
        <h2 id="guide-faq" className="text-2xl">{t.faqs}</h2>
        <div className="mt-4 divide-y divide-line rounded-2xl border border-line bg-panel/80">
          {guide.faqs.map((f) => (
            <details key={f.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {f.q}
                <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="mt-2 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <nav className="mt-12" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-2xl">{t.related}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {related.map((r) => (
              <li key={r.slug}>
                <AppLink page="learn" param={r.slug} className="card block h-full p-4 hover:border-accent/40">
                  <span className="font-semibold">{r.title}</span>
                </AppLink>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {guide.sources?.length > 0 && (
        <section className="mt-12" aria-labelledby="guide-sources">
          <h2 id="guide-sources" className="text-lg">{t.sources}</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {guide.sources.map((src) => (
              <li key={src.url}>
                <a href={src.url} className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">{src.title}</a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-12 text-xs text-muted">
        {t.disclaimer}
      </p>
    </article>
  );
}

export default function LearnPage() {
  const { routeParam, setCurrentPage } = useApp();
  const content = useContent();
  const t = content.ui.learn;
  const guide = routeParam ? guideIn(content, routeParam) : null;

  return (
    <PublicFrame footer>
      {routeParam && !guide ? (
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="text-3xl">{t.notFound}</h1>
          <button type="button" className="btn-primary mt-6" onClick={() => setCurrentPage('learn')}>{t.seeAll}</button>
        </div>
      ) : guide ? (
        <Article key={guide.slug} guide={guide} />
      ) : (
        <LearnIndex />
      )}
    </PublicFrame>
  );
}
