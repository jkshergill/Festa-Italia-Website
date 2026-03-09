import  { useState,useEffect } from 'react';
import {supabase} from "./supabaseClient"
import './HomePage.css';
import "./TokenEditor.css";

export default function TokenEditor() {
    const [showForm,setShowForm] = useState(false);
    const[token,setToken] = useState("");
    const[price,setPrice] = useState("");
    const[image,setImage] = useState(null);
    const[preview,setPreview] = useState(null);
    const [tokens,setTokens] = useState([]);
    const [editToken,setEditToken] =useState(null);
    const [currentImage,setCurrentImage] =useState("");

     {/* fetchTokens() -function to retrieve tokens */}
         const fetchTokens=async()=>{
            const {data,error}=await supabase.from("tokens").select("*");
            console.log(`error: ${error}`)
            console.log(`data: ${data}`)
            setTokens(data || [])
         }
         //retrieves tokens on page mount
         useEffect(()=>{
            let mounted = true
           // fetchTokens();
           const fetchSafe=async()=>{
            const {error}= await fetchTokens();
             if(error)console.log("mount error",error);
            if(!mounted) return;
           
           // else setTokens(data)
            
        }

            fetchSafe();
            return ()=>{mounted=false}
        },[])


     const handleSubmit = async (e) => {

         e.preventDefault();
         console.log({token,price,image});
         alert("Form Submitted!"); 
         let imgPath=editToken?.image_path || "";
         if(image){

            const path=`${Date.now()}_${image.name}` //creating unique image name
            //uploads image to tokens bucket
            const{data,error}=await supabase.storage.from("tokens").upload(path,image)
            console.log(path)
            if(error) console.log(error)
            if(data) imgPath=data.path

            if(editToken?.image_path){
                await supabase.storage.from("tokens").remove([editToken.image_path]);
            }
         }
         
         if(editToken){
            const {data,error} = await supabase.from("tokens").update(
                {color:token, price:price, image_path:imgPath}
            ).eq("id",editToken.id);
            if(data) console.log("edit data",data)
            if(error) console.log("edit error",error) 
            alert("Token Updated!")       

         }
         else{
         //insert to tokens table 
        const {data,error}= await supabase.from("tokens").insert([{
            color:token, price:price, image_path:imgPath, is_active:true }]);
             if(error) console.log(`insert error: ${error}`);    
             if(data) console.log(data) 
              }   
         setShowForm(false)   
         setEditToken(null)
         setToken("")
         setPrice("")
         setImage(null)
        fetchTokens()
        
    };

   const handleEdit=(token)=>{
    setEditToken(token)
    setToken(token.color)
    setPrice(token.price)
    setCurrentImage(token.image_Path)
    setShowForm(true)
   };


   const handleDelete=async(token)=>{
    // const confirm=window.confirm("Delete this token?")
    // if(!confirm) return;
   // console.log("Button Clicked",id)
   const {data:sessiondata}= await supabase.auth.getSession();
   console.log("sessiondata",sessiondata)
   const {data:userdata,error:usererror}=await supabase.auth.getUser();
   console.log("current user",userdata,"- token image",token.image_path,"-user error",usererror)
   const {data:names}=await supabase.storage.from("tokens").list();
   console.log("names",names)
   //deleting image from storage 
   if(token.image_path){
        const {error:storageerror}=await supabase.storage.from("tokens").remove([token.image_path])
        console.log("storage error-",storageerror)
    }
    //deleting row from tokens table
    const {data,error}=await supabase.from("tokens").delete().eq("id",token.id);
    if(error) console.log(`delete error: ${error}`);
    if(data) console.log(`delete data: ${data}`);
    //retrieving remaining rows of the table
    fetchTokens() 
   }
 return(
 <div className ="page">
          {/* Displaying header*/}    
          <div className = "page">
              <h1 className  =" text-2xl font bold text-gray-800">Editing Page</h1>
            
              {/*Add Button*/}
               <button onClick={() =>setShowForm(true)}
                 className ="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-1g-shadow">
                Add Token   
               </button>
           </div>    

     {/*Displaying form to be filled */}
      {showForm && (
        <div style={{margin:0}}>
          <form onSubmit = {handleSubmit} className= "form">

            {/*display dropdown for token colors */}
            <div>
               <label className= "block text-gray-700 font-medium mb-1">Token
               </label>
                <select value={token} onChange= {(e)=> setToken(e.target.value)}
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-400"
                  required>

                  <option value="">Select Token color</option>    
                  <option value="Blue">Blue</option>
                  <option value="Yellow">Yellow</option>
                  <option value="Black">Black</option>
                  <option value="Red">Red</option>
                </select>
            </div>
             
             {/*entering token value */}
              <div>
                 <label className= "block text-gray-700 font-medium mb-1">Price 
                 </label>
                 <input type="number" value={price} onChange= {(e)=> setPrice(e.target.value)}
                        placeholder="Enter value"
                        className="input"
                        required />
              </div>

              {/*uploading image*/}
              <div>
                 <label className= "block text-gray-700 font-medium mb-1">Upload Image
                 </label>
                 {/* {currentImage && (
                    <div style={{marginBottom:"5px"}}>
                        Image:{currentImage}
                        </div>

                 )} */}
                 <input type="file" accept="image/*" onChange= {(e)=>{setImage(e.target.files[0])
                    setCurrentImage(e.target.files[0]?.name);}
                 }
                  className="input" 
                  required />
              </div>

          

           {/*Submit Button */}
           <button type="submit" onClick={handleSubmit}
            className ="submit-btn">{editToken? "Update" : "Submit"}</button>
          </form>
         </div> 
      )}

{/* retrieving tokens table  */}
 <h3 className="table-title">Tokens Table</h3>
 <table className="table">
    <thead> 
        <tr>
            <th>Color</th>
            <th>Price</th>
            <th>Image Path</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        {tokens.map(token=>(
            <tr key={token.id}>
                <td>{token.color}</td>
                <td>{token.price}</td>
                <td>{token.image_path}</td>
                <td>
                    <div style ={{display:'flex',gap:'5px'}}> 
                    <button className="delete-btn" onClick={()=>handleEdit(token)}>Edit</button>
                    <button className="delete-btn"
                onClick={()=>handleDelete(token)}>Delete</button>
                    </div>

                </td> 
            </tr>
        ))}
    </tbody>
 </table>

    </div>
    );
    
} 