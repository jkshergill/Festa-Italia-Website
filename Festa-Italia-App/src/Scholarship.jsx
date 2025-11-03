import "./index.css";

function Scholarship() {

    return ( 
            <div className="min-h-screen flex flex-col font-sans">
            <header className= "flex justify-between items-center bg-green-700 text-white px-8 py-4">
               
                <img src="logo2 (1).jpeg" alt="Logo" className="h-10 w-auto" />
                 <div className=" flex flex-col justify-between w-6 h-5 cursor-pointer">
                   <span className="block h-[3px] bg-white rounded"></span>
                   <span className="block h-[3px] bg-white rounded"></span>
                   <span className="block h-[3px] bg-white rounded"></span>
                  </div>
                  
                  </header>


        <main className= "flex flex-col gap-8 p-8">
         <div className="bg-gray-200 p-6">
            <h1 className="text-4xl mb-4">Scholarships</h1>  
         <div className= "flex  items-start gap-10">
            <div>
                 <p className   = "mb-4">
                    Our fundraising efforts benefit various local organizations and provide scholarships as well. Each 
            year thousands of dollars in scholarship money is awarded to local high school students.
                 </p>
                 <p className  = "mb-2 font-semibold">
                  In order to be eligible for a scholarship the student must meet the following criteria:
                 </p>
           <ul className="list-disc list-inside space-y-2">
                 <li> The applicant must have a parent or grandparent who is a current member of the Festa
                Italia Foundation</li>
                
                <li>The applicant must reside on the Monterey Peninsula or the Salinas area.</li>
                <li>Must be atleast 17 years of age at the time of selection</li>
                <li>To be eligible for a scholarship , the candidate must have earned at least 3.5 grade point average.</li>
                <li>The applicant must be attending or planning to attend college.</li>
           </ul>
          </div>
           <img src="logo_01.jpeg" alt="Logo" className="w-64 h-64"/>
          
          
          </div>  
          

            </div>
           <p className= "text-center text-4xl"> For scholarship application link: {' '}
               <a 
               href="https://festaitaliamonterey.org/Publish/docs/2020_scholarship_application_form.pdf"
               target="_blank"
               rel="noopener noreferrer" 
               className="text-blue-600 underline hover:text-blue-800"
               > 
               CLICK HERE
               </a>
           </p>
        <div className="bg-gray-200 p-4">
           <p className="mb-2">The value of the scholarship and the number of scholarships awarded annually will be determined at the discretion of the
             Festa Italia Foundation's Board of Trustees. All applications must be postmarked by April 20th, 2020. 
             Any applications not meeting the deadline will not be considered. Applicants will be notified by May 16th, 2020.
           </p>

            <p>
                For more information send and email to:{' '}  
                <a href="mailto:scholarships@FestaItaliaMonterey.org"
                className="text-blue-700 underline">
                scholarships@FestaItaliaMonterey.org </a>
            </p>
        </div>

        </main>
      </div>      
    );
    
}
export default Scholarship;