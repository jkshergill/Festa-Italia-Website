import React, { useState } from "react";
import "./index.css";
import { useEffect } from "react";

function Coronationball({setPage}) {

  useEffect(() => { {/* Set body ID for styling */}
    document.body.id = 'coronationball-body-id';
    document.body.className = 'coronationball-body';
  }, []);
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
            <header className= "flex justify-between items-center bg-green-700 text-white px-8 py-4">
               
                <h1 className = "text-2xl font-bold text-grey-800">
                    Queen's Coronation Ball </h1>
                 <div className=" flex flex-col justify-between w-6 h-5 cursor-pointer">
                   <span className="block h-[3px] bg-white rounded"></span>
                   <span className="block h-[3px] bg-white rounded"></span>
                   <span className="block h-[3px] bg-white rounded"></span>
                  </div>
                  
                  </header>


        <main className= "flex-1 p-6 flex flex-col space-y-8">
            {/*First row display*/}

         <div className="flex flex-col md:flex-row md:space-x-6">

            {/* Left Column: Queen's Court and Gallery */}
            <div className="flex flex-col flex-1 space-y-6">
              {/* first box*/}
              <div className= "flex-1  bg-white rounded-1g shadow p-4">
              <h2 className="text-1g font-semibold text-gray-700 mb-3">Queen's Court</h2> 

           <div className= "w-full h-60 bg-gray-200 rounded flex items-center justify-center mb-4">
          
                   <p className= "text-gray-500 ">pictures of current court</p>
                
            </div>
            </div>  

              {/* gallery */}
              <div className= "flex-1  bg-pink rounded-1g shadow p-4">
                  <h2 className="text-1g font-semibold text-gray-700 mb-3">Gallery</h2> 
                    {/* put p[ictures 7 -12 here*/}
                     <div className= "w-full h-60 bg-gray-200 rounded flex items-center justify-center mb-4">
          
                     <p className= "text-gray-500 "> previous pictures of court</p>
                
                    </div>
              </div>
            </div>
          
            {/* Right Column: Buy Tickets */}
            <div className= "w-full md:w-1/3 bg-white rounded-1g shadow p-4 h-fit">
            <h2 className = "text-1g font-semibold text-gray-700 mb-2"> Buy Tickets </h2>
             <button onClick={()=> setPage("coronation-tix")}> Buy </button>
              
             {/* <p className= "text-gray-700 mb-3">

              <span className ="font-medium"> Coronation Ball Tickets</span> <br /> 
                 Price per ticket :  <span className = "font-semibold">$25.00</span>
             </p> */}
             {/* <input type ="number" placeholder = "Enter no of Tickets" min ="0" step ="1" 
                    className = "w-full border rounded-md p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
               <a href="https://example.com/Checkout"
                  target = "_blank"
                  rel = "noopener noreferrer"
                  className = "block w-full bg-yellow-500 hover:bg-yellow-600 text-white text-center py-2 rounded-md">
                  Checkout </a> */}
               </div>      
             </div>

             {/* displaying link and Information*/}

        <div className="flex flex-col md:flex-row md:space-x-6 items-start"> 

            {/*link*/}
           <div className = "w-full md:w-1/3 flex justify-center items-center">
           <a href="https://example.com/Information"
                target = "_blank"
                rel = "noopener noreferrer"
                className = "bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-8  py-3 rounded-md ">
                Information Link </a>
           </div>

           
        </div>

        </main>
      </div>      
    );
    
}
export default Coronationball;
    
