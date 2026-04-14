import React, { useState } from "react";
import "./coronationball.css";
import { useEffect } from "react";
import { supabase } from "./supabaseClient";
import { formatRichTextForRender } from './richTextUtils';

const normalizeKey = (value = '') => value.toLowerCase().replace(/[^a-z0-9]/g, '');
/* ----for url edit: filters the other pages and returns queen's page details---*/
const isQueenPage = (page) => {
  const id = normalizeKey(page.page_id);
  const title = normalizeKey(page.title);
  return id.includes('queen') || title.includes('queen') || title.includes('court');
};


const getQueenImageURL = (imagePath) => { // This function is used to get the public URL of the Coronation image from the Supabase storage bucket
    if (!imagePath) {
        return "placeholder.png"; // Return a placeholder image if no image path is provided
    }

    const {data} = supabase.storage.from('coronation').getPublicUrl(imagePath);
    return data.publicUrl;
};

function Coronationball({setPage}) {

  useEffect(() => { {/* Set body ID for styling */}
    document.body.id = 'coronationball-body-id';
    document.body.className = 'coronationball-body';

    const coronationInfo = async () => { // This function is used to fetch the festival information from the database
      const { data, error } = await supabase .from("coronation") .select("*"); // This is used to select all the columns from the foods table
        
      if (error) { 
        setErrorMsg(error.message); 
      } else if(data && data.length > 0) { 
          const activeCoronationInfo = data.filter(c => c.is_previous === true || c.is_current === true); // Check if the is_previous or is_current column is true to only display current and previous coronation information
          setCoronation(activeCoronationInfo); // Adds both current and previous coronation info to the state variable 
          }
    
          setLoading(false); 
    };

    coronationInfo();
  }, []);

    const [coronation, setCoronation] = useState([]); // This is used to store the coronation information fetched from the database
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const currentCoronation = coronation.filter(c => c.is_current === true); // Filter the coronation information to only display the current coronation information
    const previousCoronation = coronation.filter(c => c.is_previous === true); // Filter the coronation information to only display the previous coronation information
/********************** */
/*load and display sections of queen page*/
 const [dynamicContent, setDynamicContent] = useState(null);
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
  
          const candidatePages = (pageRows || []).filter(isQueenPage);
  
          if (candidatePages.length === 0) {
            console.warn("No queen's court page found in pages table.", pageRows);
            setDynamicContent([]);
            return;
          }
  
          let matchedPage = null;
          let sectionsData = [];
         /*loads the dynamic sections for the queen's page from supabase*/
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
          console.error('Error loading queen content:', error);
          setDynamicContent([]);
        } finally {
          setLoading(false);
        }
      };
  
      loadContent();
      const subscription = supabase
      .channel('queen-content-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content_blocks' }, loadContent)
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

/***********************  wait for contents to load from supabase*/
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
  }   /**------ */
    return (
        
        <div >
          
          <header>
            <h1 className = "queens-coronation-ball">
              Queen's Coronation Ball 
            </h1>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
          </header>

          <main className="coronationball-main">
            <div>
              <h2 className="queens-court">
                Queen's Court 
              </h2>

              <p className="pictures-text">
                Pictures of Current Court 
              </p>

              <div className="display">
                {currentCoronation.length === 0 ? (
                  <>
                    Coming Soon
                  </>
                ) : (
                  currentCoronation.map(c => ( 
                    <div key={c.id} className="coronation-info">
                      <img className="coronation-images" src={getQueenImageURL(c.image_url)}/>

                        <p className="description">
                          {c.description}
                        </p>

                        <p className="year">
                          {c.year}
                        </p>
                    </div>                      
                  ))
                 )
                }
                </div>
            </div>

            <div>
              <h2 className="gallery-text">
                Gallery
              </h2>

              <p className="pictures-text"> 
                Pictures of Previous Coronations
              </p>

              <div className="display">
                {previousCoronation.length === 0 ? (
                  <>
                    Coming Soon
                  </>
                  ) : (
                    previousCoronation.map(c => (

                      <div key={c.id} className="coronation-info">
                        <img className="coronation-images" src={getQueenImageURL(c.image_url)}/>
                        <p className="description">
                          {c.description}
                        </p>

                        <p className="year">
                          {c.year}
                        </p>
                      </div>
                                            
                    ))
                 )
                }
              </div>
            </div>

            <div>
              <h2 className = "buy-tickets-header"> 
                Buy Tickets 
                </h2>

              <button className="buy-tickets-button" onClick={()=> setPage("coronation-tix")}> 
                Buy 
              </button>
            </div>      
            
            <div className="info-section">
              <p className="participation-requirements"> 
                If you are interested in particpating in the Queen's Coronation, <a href="https://festaitaliamonterey.org/Publish/docs/2020_queens_requirements.pdf" target="_blank" >
                  CLICK HERE
                </a> to view the participation requirements.
              </p>

              <p className="participation-application">
                Then, <a href="https://festaitaliamonterey.org/Publish/docs/2020_queens_application_form.pdf" target="_blank" >
                  CLICK HERE
                </a> to download and fill the application.
              </p>

              {/* <p className="email">
                For more information on becoming a representative on the Queen's Court or a Coronation Ball committee member, send a request to: queenscourt@festaitaliamonterey.org
              </p> */}
            </div>
            {/***** */}
              {/**html for dynamic content for dis[play*/}
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

            {/*-----*/}
        </main>
      </div>      
    );
    
}
export default Coronationball;
    
