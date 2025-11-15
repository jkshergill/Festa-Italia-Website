

import React, { useState } from "react";
import "./index.css";

function AdminDB() {

    return ( 
            <div className="min-h-screen bg-white font-sans">
           
            <header className= "relative flex items-center justify-between  bg-green-600 text-black px-6 py-3 shadow-md">
                <h1 className="text-xl font-semibold leading-tight">Admin  <br />Dashboard</h1>
                  
                 <div className=" absolute left-1/2 transform -translate-x-1/2 ">
                  {/*dropdown*/}
                   <select className= "bg-white text-black px-3 py-1 rounded">
                   <option>Search web pages</option>
                   <option>page1</option>
                   <option>page2</option>
                   </select>
                  </div>
                   {/*Hamburger menu*/}
                   <button className = "bg-white text-2xl w-10 h-10 flex items-center justify-center  shadow-md hover:bg-gray-100 ">&#9776;</button>
                  
                  </header>


 <main className= "p-6">

      <h2 className="text-center text-2xl font-semibold mb-8">Main Dashboard</h2>    
         <div className= "grid grid-cols-1 md:grid-cols-3 gap-6 min-h-screen">
            {/* Volunteer sign ups*/}
           <div className = "bg-gray-200 text-white  p-4  shadow  flex flex-col">
             <h1 className = "bg-green-700 text-center font-semibold py-3 mb-4 text-lg">Volunteer Sign Ups</h1>
              <div className = "flex flex-col space-y-2">
                  <div className = "flex space-x-3 ">
               
                    <button className=  "bg-green-500 text-white rounded py-1 px-10 hover:bg-green-600">RSVP Confirm
                    </button>

                     <button className=  "bg-green-500 text-white rounded py-1 px-10 hover:bg-green-600">Send Email
                     </button>
                  </div>
               <select className = " bg-green-700 border rounded py-1 px-2">
                <option>Pasta Booth</option>
                <option>Pasta Booth1</option>
                <option>Pasta Booth2</option>
               </select>
                <div className = "bg-green-700 text-white flex justify-between items-center px-3 py-2">
                <span className = "text-lg font-semibold">Devin Wynne</span>
               <input type="text" className = "w-10 h-6 bg-white text-black border border-gray-300 rounded px-1" />
         
                 </div>
           </div>
      </div>
              

       {/* Bocce Team Sign Ups*/}
        <div className = "bg-gray-200 text-white p-4 shadow">
            <h3 className = "bg-green-700 text-center font-semibold py-3 mb-4 text-lg">Bocce Team Sign Ups</h3>
            <div className = "flex flex-col space-y-2">
               <div className = "flex space-x-3 ">
               <button className=  "bg-green-500 text-white rounded py-1 px-10 hover:bg-green-600">RSVP Confirm
               </button>

               <button className=  "bg-green-500 text-white rounded py-1 px-10 hover:bg-green-600">Send Email
               </button>
               </div>
               <select className = "bg-green-700 border rounded py-1 px-2">
                <option>Team Bears</option>
                <option>team1</option>
                <option>team2</option>
               </select>

            </div>
        </div>
     
 {/* Admin Controls*/}
        <div className = "bg-gray-200 text-white p-4 shadow">
            <h3 className = "bg-green-700 text-center font-semibold py-3 mb-4 text-lg">Admin Controls</h3>
            <div className = "flex flex-col space-y-2">

               <button className=  "bg-green-500 text-white rounded py-1 hover:bg-green-600">Edit Pages
               </button>
            </div>
        </div>    
       
    </div>   
 </main>
 </div>      
    );
    
}
export default AdminDB;