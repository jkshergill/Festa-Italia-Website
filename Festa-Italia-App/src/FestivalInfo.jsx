import './FestivalInfoPage.css';
import { useEffect } from 'react';
import { supabase } from "./supabaseClient";  
import { useState } from 'react';

const getFestivalInfoImageUrl = (imagePath) => { // This function is used to get the public URL of the food image from the Supabase storage bucket
    if (!imagePath) {
        return "placeholder.png"; // Return a placeholder image if no image path is provided
    }

    const {data} = supabase.storage.from('Festa Italia Images').getPublicUrl(imagePath);
    return data.publicUrl;
};

export default function FestivalInfo() {
  useEffect(() => {
    document.body.id = 'festival-info-body-id';
    document.body.classList.add('festival-info-body');

    const fetchFestivalInfo = async () => { // This function is used to fetch the festival information from the database
      const { data, error } = await supabase .from("festival_info") .select("*"); // This is used to select all the columns from the foods table
    
      if (error) { 
        setErrorMsg(error.message); 
      } else if(data && data.length > 0) { 
        const activeFestivalInfo = data.filter(f => f.is_active === true); // Check if the is_active column is true to only display active festival information
        setFestivalInfo(activeFestivalInfo); // Adds the active festival information to the state variable festivalInfo
        // setFestivalInfo(data); Uncomment if is_active column is not used in the database
      }

      setLoading(false); 
    };

    return () => {
      document.body.classList.remove('festival-info-body');
        fetchFestivalInfo();
    };
  }, []);


  const [festivalInfo, setFestivalInfo] = useState([]); // This is used to store the festival information fetched from the database
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fridayEvents = festivalInfo.filter(f => f.day === "Friday");
  const saturdayEvents = festivalInfo.filter(f => f.day === "Saturday");
  const sundayEvents = festivalInfo.filter(f => f.day === "Sunday");

  return (
    <div className="festival-info-body">
      <main>
        <div className="festival-container">
          <section id="about" className="section features">
            <h2>Friday Event Schedule</h2>

            <div className="schedule-grid" role="list">
              <article className="schedule-item" role="listitem">
                {fridayEvents.length === 0 ? (
                  <>
                    <div className='meta'>
                      <p className='time'>
                        TBD
                      </p>
                    </div>
                  </>
                ) : (
                    festivalInfo.filter(f => f.day === "Friday").map(f => (
                        <>  
                          <div className='meta'>
                            <div className="time">
                              {f.start_time} - {f.end_time}
                            </div>

                            <img src={getFestivalInfoImageUrl(f.image_path)} />

                            <div className='desc'>
                              <div className="act">
                                {f.name}
                              </div>
                              
                              <div className="bio">
                                {f.description} 
                              </div>
                            </div>
                          </div>
                        </>                        
                    ))
                 )
                } 
              </article>

              <h2>Saturday Event Schedule</h2>

              <article className="schedule-item" role="listitem">
                {saturdayEvents.length === 0 ? (
                  <>
                    <div className='meta'>
                      <p className='time'>
                        TBD
                      </p>
                    </div>
                  </>
                ) : (
                    festivalInfo.filter(f => f.day === "Saturday").map(f => (
                        <>  
                          <div className='meta'>
                            <div className="time">
                              {f.start_time} - {f.end_time}
                            </div>

                            <img src={getFestivalInfoImageUrl(f.image_path)} />

                            <div className='desc'>
                              <div className="act">
                                {f.name}
                              </div>
                              
                              <div className="bio">
                                {f.description} 
                              </div>
                            </div>
                          </div>
                        </>                        
                    ))
                 )
                } 
              </article>

              <h2>Sunday Event Schedule</h2>

              <article className="schedule-item" role="listitem">
                {sundayEvents.length === 0 ? (
                  <>
                    <div className='meta'>
                      <p className='time'>
                        TBD
                      </p>
                    </div>
                  </>
                ) : (
                    festivalInfo.filter(f => f.day === "Sunday").map(f => (
                        <>  
                          <div className='meta'>
                            <div className="time">
                              {f.start_time} - {f.end_time}
                            </div>

                            <img src={getFestivalInfoImageUrl(f.image_path)} />

                            <div className='desc'>
                              <div className="act">
                                {f.name}
                              </div>
                              
                              <div className="bio">
                                {f.description} 
                              </div>
                            </div>
                          </div>
                        </>                        
                    ))
                 )
                } 
              </article>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

