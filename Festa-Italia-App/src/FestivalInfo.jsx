import { useEffect, useState } from 'react';
import './FestivalInfoPage.css';
import './HomePage.css';
import { supabase } from "./supabaseClient";
import { formatRichTextForRender } from './richTextUtils';

const normalizeKey = (value = '') => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const isFestivalPage = (page) => {
  const id = normalizeKey(page.page_id);
  const title = normalizeKey(page.title);
  return id.includes('festival') || id.includes('fisherman') || title.includes('festival') || title.includes('fisherman');
};

export default function FestivalInfo({ setPage }) {
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

        const candidatePages = (pageRows || []).filter(isFestivalPage);

        if (candidatePages.length === 0) {
          console.warn('No festival page found in pages table.', pageRows);
          setDynamicContent([]);
          return;
        }

        let matchedPage = null;
        let sectionsData = [];

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
        console.error('Error loading festival content:', error);
        setDynamicContent([]);
      } finally {
        setLoading(false);
      }
    };

    loadContent();

    const subscription = supabase
      .channel('festival-content-changes')
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
              <h1 className="hero-title">Welcome to the Fishermans Festival!</h1>
              <p className="hero-sub">Celebrate with great food, live entertainment, and the spirit of the fishing community.</p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ background: '#000', boxShadow: 'none' }}
                  onClick={() => setPage('volunteer')}
                >
                  Volunteer Request
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ background: '#000', boxShadow: 'none' }}
                  onClick={() => setPage('shopping')}
                >
                  Festival Menu
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

