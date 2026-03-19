import React, { useState } from "react";
import "./coronationball.css";
import { useEffect } from "react";
import { supabase } from "./supabaseClient";


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

              <p className="email">
                For more information on becoming a representative on the Queen's Court or a Coronation Ball committee member, send a request to: queenscourt@festaitaliamonterey.org
              </p>
            </div>

        </main>
      </div>      
    );
    
}
export default Coronationball;
    