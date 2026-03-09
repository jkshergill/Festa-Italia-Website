import { useEffect, useState } from 'react';
import QRCode from "react-qr-code";
import './HomePage.css';
import { supabase } from './supabaseClient';

export default function HomePage({setPage}) {
  const [dynamicContent, setDynamicContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { // Set body ID for styling
    document.body.id = 'homepage-body-id';
    document.body.className = 'homepage-body';
  }, []);

  useEffect(() => {
    // Load dynamic content from Supabase
    const loadDynamicContent = async () => {
      try {
        setLoading(true);

        // Get the home page UUID
        const { data: pageData, error: pageError } = await supabase
          .from('pages')
          .select('id')
          .eq('page_id', 'home')
          .single();

        if (pageError) throw pageError;

        // Get all sections for home page
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('sections')
          .select('*')
          .eq('page_id', pageData.id)
          .order('position', { ascending: true });

        if (sectionsError) throw sectionsError;

        // Get all content blocks for these sections
        const { data: blocksData, error: blocksError } = await supabase
          .from('content_blocks')
          .select('*')
          .in('section_id', sectionsData.map(s => s.id));

        if (blocksError) throw blocksError;

        // Reconstruct sections with their content blocks
        const sectionsWithBlocks = sectionsData.map(section => {
          const contentBlocks = blocksData
            .filter(block => block.section_id === section.id)
            .sort((a, b) => a.block_index - b.block_index)
            .map(block => ({
              text: block.text || '',
              image: block.image_url || null,
              imagePosition: block.image_position || 'right'
            }));

          return {
            id: section.id,
            title: section.title,
            contentBlocks
          };
        });

        setDynamicContent(sectionsWithBlocks);
      } catch (error) {
        console.error('Error loading dynamic content from Supabase:', error);
        setDynamicContent([]); // Set empty array on error so page still loads
      } finally {
        setLoading(false);
      }
    };

    loadDynamicContent();

    // Set up real-time listener for changes
    const subscription = supabase
      .channel('sections-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'content_blocks' },
        () => {
          // Reload content when changes occur
          loadDynamicContent();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Show loading screen while data is being fetched
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
        <section id="gallery" className="container section gallery">
          <h2>Gallery</h2>
          <div className="gallery-row" role="list">
            <figure role="listitem">
              <img src="/images/Past%20festival%201.png" alt="Festa Italia photo 1" />
            </figure>
            <figure role="listitem">
              <img src="/images/Past%20festival%202.png" alt="Festa Italia photo 2" />
            </figure>
            <figure role="listitem">
              <img src="/images/Past%20festival%203.png" alt="Festa Italia photo 3" />
            </figure>
            <figure role="listitem">
              <img src="/images/Past%20festival%204.png" alt="Festa Italia photo 4" />
            </figure>
            <figure role="listitem">
              <img src="/images/Past%20festival%205.png" alt="Festa Italia photo 5" />
            </figure>
          </div>
        </section>

        <section id="about" className="container section features">
          <h2>About Festa Italia</h2>
          <p>
            Festa Italia Foundation, Inc. promotes Italian heritage, honors Monterey's
            fishermen, and provides scholarships to local students. Join us for food,
            music, and celebration.
          </p>
        </section>

        {/* Dynamic Content from Supabase */}
        {dynamicContent && dynamicContent.length > 0 && (
          <section id="dynamic-content" className="container section dynamic-sections">
            {dynamicContent.map((section) => (
              <div key={section.id} className="dynamic-section">
                <h2>{section.title}</h2>
                {section.contentBlocks && section.contentBlocks.map((block, blockIndex) => (
                  <div key={blockIndex} className={`content-block image-position-${block.imagePosition || 'right'} ${block.image ? 'has-image' : 'no-image'}`}>
                    {block.image && block.imagePosition === 'above' && (
                      <img
                        src={block.image}
                        alt={`Content block ${blockIndex + 1}`}
                        className="content-image"
                      />
                    )}
                    {block.image && (block.imagePosition === 'left' || block.imagePosition === 'right') && (
                      <img
                        src={block.image}
                        alt={`Content block ${blockIndex + 1}`}
                        className="content-image"
                      />
                    )}
                    {block.text && <p>{block.text}</p>}
                    {block.image && block.imagePosition === 'below' && (
                      <img
                        src={block.image}
                        alt={`Content block ${blockIndex + 1}`}
                        className="content-image"
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </section>
        )}
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="social-links" aria-label="Social links">
            {/* <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Festa Italia on Facebook">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M22 12a10 10 0 10-11.5 9.9v-7h-2.2v-2.9h2.2V9.3c0-2.2 1.3-3.4 3.3-3.4.96 0 1.97.17 1.97.17v2.2h-1.12c-1.1 0-1.44.68-1.44 1.38v1.66h2.45l-.39 2.9h-2.06v7A10 10 0 0022 12z" />
              </svg>
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Festa Italia on Instagram">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 6.1A4.9 4.9 0 1016.9 13 4.9 4.9 0 0012 8.1zm6.4-3.6a1.2 1.2 0 11-1.2 1.2 1.2 1.2 0 011.2-1.2z" />
              </svg>
            </a> */}
      
      
       <div style={{ textAlign: "center" }}>
         <h3>Instagram</h3>
        <a href="https://www.instagram.com/festa_italia_monterey" target="_blank" rel="noopener noreferrer" aria-label="Festa Italia on Instagram">
           <QRCode value={"https://www.instagram.com/festa_italia_monterey"} size={150} />
        </a></div>

       <div style={{ textAlign: "center" }}>
       <h3>facebook</h3>
        <a href="https://www.facebook.com/100068618071869/" target="_blank" rel="noopener noreferrer" aria-label="Festa Italia on facebook">
             
           <QRCode value={"https://www.facebook.com/100068618071869/"} size={150} />
         </a></div> 
          </div> 
        </div>
      </footer>
    </div>
  );
}