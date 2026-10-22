import React from 'react';
import { ArrowRight, Mail } from '../components/icons/index.jsx';
import PublicFrame from '../components/shell/PublicFrame.jsx';
import AppLink from '../components/ui/AppLink.jsx';
import { useApp } from '../context/AppContext.jsx';
import useContent from '../hooks/useContent.js';
import { CONTACT, INFO_PAGES, NOT_FOUND, PAGES_UPDATED } from '../content/pages.js';

const updated = new Date(PAGES_UPDATED).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

// Turns the contact email inside a paragraph into a mailto link.
function WithEmail({ text }) {
  const parts = text.split(CONTACT.email);
  return parts.map((part, i) => (
    <React.Fragment key={i}>
      {part}
      {i < parts.length - 1 && (
        <a className="font-semibold text-accent hover:underline" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
      )}
    </React.Fragment>
  ));
}

// About, contact and policy pages (content/pages.js).
export default function InfoPage() {
  const { currentPage } = useApp();
  const page = INFO_PAGES[currentPage];
  if (!page) return <NotFoundPage />;

  return (
    <PublicFrame footer>
      <article lang="en" className="mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-8 lg:pt-14">
        <h1 className="text-4xl sm:text-5xl">{page.title}</h1>
        {currentPage !== 'about' && currentPage !== 'contact' && <p className="mt-3 text-sm text-muted">Updated {updated}</p>}
        <p className="mt-6 text-lg leading-relaxed text-ink/90">{page.intro}</p>

        {currentPage === 'contact' && (
          <a href={`mailto:${CONTACT.email}`} className="btn-primary mt-8">
            <Mail className="h-4 w-4" aria-hidden="true" />
            Email us
          </a>
        )}

        <div className="mt-10 space-y-9">
          {page.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-2xl">{s.heading}</h2>
              {s.paragraphs.map((p, i) => (
                <p key={i} className="mt-3 text-[16.5px] leading-[1.75] text-ink/90"><WithEmail text={p} /></p>
              ))}
              {s.list && (
                <ul className="mt-3 list-disc space-y-2 pl-6 text-[16.5px] leading-[1.7] text-ink/90">
                  {s.list.map((item) => <li key={item}><WithEmail text={item} /></li>)}
                </ul>
              )}
            </section>
          ))}
        </div>
      </article>
    </PublicFrame>
  );
}

export function NotFoundPage() {
  const { ui } = useContent();
  return (
    <PublicFrame footer>
      <div className="mx-auto w-full max-w-xl px-4 py-24 text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-2 text-4xl">{NOT_FOUND.title}</h1>
        <p className="mt-4 text-muted">{NOT_FOUND.body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <AppLink page="splash" className="btn-primary">{ui.nav.home} <ArrowRight className="h-4 w-4" aria-hidden="true" /></AppLink>
          <AppLink page="learn" className="btn-ghost">{ui.nav.allGuides}</AppLink>
          <AppLink page="onboarding" className="btn-ghost">{ui.nav.getKundli}</AppLink>
        </div>
      </div>
    </PublicFrame>
  );
}
