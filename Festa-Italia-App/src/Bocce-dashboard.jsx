import { useEffect, useState } from 'react';
import './HomePage.css';
import { supabase } from './supabaseClient';
import { formatRichTextForRender } from './richTextUtils';

const BOCCE_PAGE_IDS = ['bocce-dashboard', 'bocce-dash', 'bocce'];

const normalizeKey = (value = '') => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const rankBoccePages = (pages = []) => {
  const priority = BOCCE_PAGE_IDS.map(normalizeKey);

  return pages
    .map((page) => {
      const id = normalizeKey(page.page_id);
      const title = normalizeKey(page.title);

      if (priority.includes(id)) {
        return { page, score: 2 };
      }

      if (id.includes('bocce') || title.includes('bocce')) {
        return { page, score: 1 };
      }

      return null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.page);
};

const isBocceLikePage = (page) => {
  const id = normalizeKey(page.page_id);
  const title = normalizeKey(page.title);
  return id.includes('bocce') || title.includes('bocce');
};

const resolveBoccePage = (pages = []) => {
  const ranked = rankBoccePages(pages);
  if (ranked.length > 0) return ranked[0];

  const fallback = pages.find((page) => {
    const id = normalizeKey(page.page_id);
    const title = normalizeKey(page.title);
    return id.includes('bocce') || title.includes('bocce');
  });

  return fallback || null;
};

export default function BocceDashboard({ setPage }) {
  const [dynamicContent, setDynamicContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.id = 'homepage-body-id';
    document.body.className = 'homepage-body';
  }, []);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.animate-on-scroll'));
    if (!els.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    }, { threshold: 0.12 });

    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [dynamicContent, loading]);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);

        const { data: pageRows, error: pageRowsError } = await supabase
          .from('pages')
          .select('id, page_id, title');

        if (pageRowsError) throw pageRowsError;

        const rankedCandidates = rankBoccePages(pageRows || []);
        const fallbackCandidate = resolveBoccePage(pageRows || []);
        const candidatePages = rankedCandidates.length > 0
          ? rankedCandidates
          : fallbackCandidate
            ? [fallbackCandidate]
            : [];

        if (candidatePages.length === 0) {
          console.warn('No bocce page found in pages table.', pageRows);
          setDynamicContent([]);
          return;
        }

        let matchedPage = null;
        let sectionsData = [];

        // Pick the first bocce-like page that actually has sections.
        for (const candidate of candidatePages) {
          const { data: candidateSections, error: sectionsError } = await supabase
            .from('sections')
            .select('*')
            .eq('page_id', candidate.id)
            .order('position', { ascending: true });

          if (sectionsError) throw sectionsError;

          if (candidateSections?.length) {
            matchedPage = candidate;
            sectionsData = candidateSections;
            break;
          }
        }

        // If nothing has sections yet, use the best candidate anyway.
        if (!matchedPage) {
          matchedPage = candidatePages[0];
          const { data: selectedSections, error: selectedSectionsError } = await supabase
            .from('sections')
            .select('*')
            .eq('page_id', matchedPage.id)
            .order('position', { ascending: true });

          if (selectedSectionsError) throw selectedSectionsError;
          sectionsData = selectedSections || [];
        }

        if (!sectionsData?.length) {
          if (isBocceLikePage(matchedPage)) {
            console.info('Bocce page found but it has no sections yet.', matchedPage);
          }
          setDynamicContent([]);
          return;
        }

        const { data: blocksData, error: blocksError } = await supabase
          .from('content_blocks')
          .select('*')
          .in('section_id', sectionsData.map((section) => section.id));

        if (blocksError) throw blocksError;

        const sectionsWithBlocks = sectionsData.map((section) => ({
          id: section.id,
          title: section.title,
          contentBlocks: (blocksData || [])
            .filter((block) => block.section_id === section.id)
            .sort((a, b) => a.block_index - b.block_index)
            .map((block) => ({
              text: block.text || '',
              image: block.image_url || null,
              imagePosition: block.image_position || 'left'
            }))
        }));

        setDynamicContent(sectionsWithBlocks);
      } catch (error) {
        console.error('Error loading bocce content:', error);
        setDynamicContent([]);
      } finally {
        setLoading(false);
      }
    };

    loadContent();

    const subscription = supabase
      .channel('bocce-content-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content_blocks' }, loadContent)
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="page-root">
        <main>
          <div className="loading-screen">
            <div className="loading-screen-content">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading Content</p>
              <p className="loading-subtext">Please wait while we prepare the page...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-root">
      <main>
        {/* Hero */}
        <section className="container section hero animate-on-scroll">
          <div className="hero-inner">
            <div className="hero-copy">
              <h1 className="hero-title">Welcome to the Bocce Tournament!</h1>
              <p className="hero-sub">Sign up your team, follow the competition, and celebrate the tradition of bocce at Festa Italia.</p>
              <div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ background: '#000', boxShadow: 'none' }}
                  onClick={() => setPage('bocce-sign')}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </section>

        {dynamicContent && dynamicContent.length > 0 && (
          <section id="dynamic-content" className="container section dynamic-sections">
            {dynamicContent.map((section) => (
              <div key={section.id} className="dynamic-section animate-on-scroll">
                <h2>{section.title}</h2>
                {section.contentBlocks && section.contentBlocks.map((block, blockIndex) => (
                  <div key={blockIndex} className={`content-block image-position-${block.imagePosition || 'left'} ${block.image ? 'has-image' : 'no-image'} animate-on-scroll`}>
                    {block.image && block.imagePosition === 'above' && (
                      <img src={block.image} alt={`Content block ${blockIndex + 1}`} className="content-image" />
                    )}
                    {block.image && (block.imagePosition === 'left' || block.imagePosition === 'right') && (
                      <img src={block.image} alt={`Content block ${blockIndex + 1}`} className="content-image" />
                    )}
                    {block.text && <p dangerouslySetInnerHTML={{ __html: formatRichTextForRender(block.text) }}></p>}
                    {block.image && block.imagePosition === 'below' && (
                      <img src={block.image} alt={`Content block ${blockIndex + 1}`} className="content-image" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}







