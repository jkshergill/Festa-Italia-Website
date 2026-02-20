import './Shopping.css';
import { supabase } from "./supabaseClient";
import { useEffect } from 'react';
import { useState } from 'react';

const getFoodImageUrl = (imagePath) => { // This function is used to get the public URL of the food image from the Supabase storage bucket
    if (!imagePath) {
        return "placeholder.png"; // Return a placeholder image if no image path is provided
    }

    const {data} = supabase.storage.from('foods').getPublicUrl(imagePath);
    return data.publicUrl;
};

const getTokenImageUrl = (imagePath) => { // This function is used to get the public URL of the token image from the Supabase storage bucket
    if (!imagePath) {
        return "placeholder.png"; // Return a placeholder image if no image path is provided
    }

    const {data} = supabase.storage.from('tokens').getPublicUrl(imagePath);
    return data.publicUrl;
};

function Shopping() {

    const [food, setFood] = useState([]);
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [foodQuantities, setFoodQuantities] = useState({}); 
    const [tokenQuantities, setTokenQuantities] = useState({});

    useEffect(() => {
        document.body.id = 'shopping-body-id';
        document.body.className = 'shopping-body';

        const fetchFood = async () => { // This function is used to fetch the food items from the database
            const { data, error } = await supabase .from("foods") .select("*"); // This is used to select all the columns from the foods table
            if (error) { 
                setErrorMsg(error.message); 
            } else if(data && data.length > 0) { 
                const activeFood = data.filter(f => f.is_active === true);
                setFood(activeFood); 
            } 

            setLoading(false); 
        }; 

        const fetchTokens = async () => { // This function is used to fetch the food items from the database
            const { data, error } = await supabase .from("tokens") .select("*"); // This is used to select all the columns from the foods table
            if (error) { 
                setErrorMsg(error.message); 
            } else if(data && data.length > 0) { 
                const activeTokens = data.filter(t => t.is_active === true);
                setTokens(activeTokens); 
            } 

            setLoading(false); 
        }; 
        
        fetchTokens(); // This makes it possible to display the information from the tokens table on the shopping page
        fetchFood(); // This makes it possible to display the information from the foods table on the shopping page
    }, []);



    const handleFoodQuantityChange = (foodId, quantity) => {
        if(quantity < 0) return; // Prevent negative quantities
        setFoodQuantities(prevQuantities => ({
            ...prevQuantities,
            [foodId]: quantity
        }));
    }

    const handleTokenQuantityChange = (tokenType, quantity) => {
        if(quantity < 0) return; // Prevent negative quantities
        setTokenQuantities(prevQuantities => ({
            ...prevQuantities,
            [tokenType]: quantity
        }));
    }

    const handleTotalFoodPrices = () => { // This is used to calculate the total price of the food items based on the quantity selected by the user
        let total = 0;
        Object.keys(foodQuantities).forEach(foodId => {
            const foodItem = food.find(f => f.id === foodId);
            if (foodItem) {
                total += foodItem.price * foodQuantities[foodId];
            }
        });
        return total;
    }

    const handleTotalTokenPrices = () => { // This is used to calculate the total price of the tokens based on the quantity selected by the user
        let total = 0;
        Object.keys(tokenQuantities).forEach(tokenType => {
            const tokenItem = tokens.find(t => t.id === tokenType);
            if (tokenItem) {
                total += tokenItem.price * tokenQuantities[tokenType];
            }
        });
        return total;
    }

    const handleReset = () => { // This is used to reset the total prices and quantities of the food items and tokens to 0.
        setFoodQuantities({});
        setTokenQuantities({});
    }

    return (
        <>
            <h1 className='menu-header'>
                Menu
            </h1>

            <p className='menu-description'>
                <strong>This menu is for informational purposes only. We will not be taking orders for food or tokens online. Please visit us at the festival to purchase food and tokens.</strong>
            </p>

            <p className='menu-topic'>
                Food
            </p>  

            <div className='food-section'>     
                {food.length === 0 ? (
                    <p>Menu coming soon!</p>
                ) : (
                    food.filter(f => f.food_type === "food").map(f => (
                        <>  
                            <div className='food-container'>
                                <p className='food-name'>{f.name}</p>
                                <p>{f.description}</p>
                                <p className='food-price'>Price: ${f.price}</p>
                                <p className='food-calories'>Calories: {f.calories}</p>
                                <img className='food-image' src={getFoodImageUrl(f.image_path)} alt={f.name} />
                                <p>Quantity:</p>
                                <input type="number" min="0" value={foodQuantities[f.id] || 0} onChange={(e) => handleFoodQuantityChange(f.id, parseInt(e.target.value) || 0)} />
                            </div>
                        </>                        
                    ))
                 )
                }
            </div>

            <p className='menu-topic'>
                Drinks 
            </p>

            <div className='food-section'>

                {food.length === 0 ? (
                    <p>Menu coming soon!</p>
                ) : (
                    food.filter(f => f.food_type === "drink").map(f => (
                        <>  
                            <div className='food-container'>
                                <p className='food-name'>{f.name}</p>
                                <p>{f.description}</p>
                                <p className='food-price'>Price: ${f.price}</p>
                                <p className='food-calories'>Calories: {f.calories}</p>
                                <img className='food-image' src={getFoodImageUrl(f.image_path)} alt={f.name} />
                                <p>Quantity:</p>
                                <input type="number" min="0" value={foodQuantities[f.id] || 0} onChange={(e) => handleFoodQuantityChange(f.id, parseInt(e.target.value) || 0)} />
                            </div>
                        </>                        
                    ))
                 )
                }
                
            </div>
            
            <section>
                <h2>Tokens</h2>
                <div className='token-section'>
                
                {tokens.length === 0 ? (
                    <p>Tokens coming soon!</p>
                    ) : (
                    tokens.map(t => (
                        <>  
                            <div className='token-container'>
                                <p className='token-name'>{t.color} tokens</p>
                                <img className='token-image' src={getTokenImageUrl(t.image_path)} alt={t.color} />
                                <p className='token-price'>Price: ${t.price}</p>
                                <p>Quantity:</p>
                                <input type="number" min="0" value={tokenQuantities[t.id] || 0} onChange={(e) => handleTokenQuantityChange(t.id, parseInt(e.target.value) || 0)} />
                            </div>
                        </>                        
                    ))
                 )
                }
                </div>
            </section>  

            <h3 className='total-price'>
                Total Food Price: ${handleTotalFoodPrices()}
                <br />
                Total Tokens Price: ${handleTotalTokenPrices()}
            </h3>   

            <button className='reset-button' onClick={handleReset}>
                Reset Totals
            </button>   
        </>
    );
}

export default Shopping;
