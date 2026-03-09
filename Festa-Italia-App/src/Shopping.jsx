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
    // Committed order quantities
    const [foodQuantities, setFoodQuantities] = useState({}); 
    const [tokenQuantities, setTokenQuantities] = useState({});
    // Pending (dropdown) quantities
    const [pendingFoodQuantities, setPendingFoodQuantities] = useState({});
    const [pendingTokenQuantities, setPendingTokenQuantities] = useState({});

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



    // Dropdowns update pending state
    const handlePendingFoodQuantityChange = (foodId, quantity) => {
        if(quantity < 0) return;
        setPendingFoodQuantities(prev => ({
            ...prev,
            [foodId]: quantity
        }));
    };

    const handlePendingTokenQuantityChange = (tokenId, quantity) => {
        if(quantity < 0) return;
        setPendingTokenQuantities(prev => ({
            ...prev,
            [tokenId]: quantity
        }));
    };

    // Add to Order button copies pending food to committed, and sets tokens to minimum needed for food total
    const handleAddToOrder = () => {
        const committedFood = { ...pendingFoodQuantities };
        setFoodQuantities(committedFood);

        // Calculate total food price
        let foodTotal = 0;
        Object.keys(committedFood).forEach(foodId => {
            const foodItem = food.find(f => f.id === foodId);
            if (foodItem) {
                foodTotal += foodItem.price * committedFood[foodId];
            }
        });


        // Bounded knapsack: find minimum token value >= foodTotal, using up to 5 of each token type
        // Build all possible token combinations (small N, so feasible)
        let minTotal = Infinity;
        let bestCombo = {};
        const tokenTypes = tokens.map(t => ({ id: t.id, price: t.price }));
        const n = tokenTypes.length;
        // Brute force all combinations (0-5 of each token type)
        function search(idx, currentQty, currentSum) {
            if (idx === n) {
                if (currentSum >= foodTotal && currentSum < minTotal) {
                    minTotal = currentSum;
                    bestCombo = { ...currentQty };
                }
                return;
            }
            for (let q = 0; q <= 5; q++) {
                currentQty[tokenTypes[idx].id] = q;
                search(idx + 1, currentQty, currentSum + q * tokenTypes[idx].price);
            }
        }
        search(0, {}, 0);
        // Fill in zeros for any missing token types
        tokens.forEach(t => { if (!bestCombo[t.id]) bestCombo[t.id] = 0; });
        setTokenQuantities(bestCombo);

        // Optionally reset pending to zero
    setPendingFoodQuantities({});
    // Explicitly reset all pending token dropdowns to zero for all token ids
    const resetPendingTokens = {};
    tokens.forEach(token => { resetPendingTokens[token.id] = 0; });
    setPendingTokenQuantities(resetPendingTokens);
    };

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
        setPendingFoodQuantities({});
        setPendingTokenQuantities({});
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
                                                                <select
                                                                    value={pendingFoodQuantities[f.id] || 0}
                                                                    onChange={e => handlePendingFoodQuantityChange(f.id, parseInt(e.target.value, 10))}
                                                                    style={{ padding: '0.3rem', fontSize: '1rem' }}
                                                                >
                                                                    {[0,1,2,3,4,5].map(q => (
                                                                        <option key={q} value={q}>{q}</option>
                                                                    ))}
                                                                </select>
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
                                                                <select
                                                                    value={pendingFoodQuantities[f.id] || 0}
                                                                    onChange={e => handlePendingFoodQuantityChange(f.id, parseInt(e.target.value, 10))}
                                                                    style={{ padding: '0.3rem', fontSize: '1rem' }}
                                                                >
                                                                    {[0,1,2,3,4,5].map(q => (
                                                                        <option key={q} value={q}>{q}</option>
                                                                    ))}
                                                                </select>
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
                                                                <select
                                                                    value={pendingTokenQuantities[t.id] || 0}
                                                                    onChange={e => handlePendingTokenQuantityChange(t.id, parseInt(e.target.value, 10))}
                                                                    style={{ padding: '0.3rem', fontSize: '1rem' }}
                                                                >
                                                                    {[0,1,2,3,4,5].map(q => (
                                                                        <option key={q} value={q}>{q}</option>
                                                                    ))}
                                                                </select>
                            </div>
                        </>                        
                    ))
                 )
                }
                </div>

                {/* Add to Order button under tokens */}
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <button className='add-to-order-button' onClick={handleAddToOrder} style={{ padding: '0.7rem 1.5rem', fontSize: '1.1rem', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                        Add to Order
                    </button>
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
