import  { useState } from "react";
import api from "../api/axios";


const CreateProduct =  ()=>{
const [name,setName] = useState("");
const [description,setDescription] = useState("");
const [price,setPrice] = useState(0);
const [category,setCategory] = useState("electronics");
const [stock,setStock] = useState(0);
const [imageUrl,setImageUrl] = useState("");

const handleSubmit = async (e)=>{
    e.preventDefault();
    try {
        
        await api.post('/products/create',{name,description,price,category,imageUrl,stock});
        alert("Product created successfully");
        setName("");
        setDescription("");
        setPrice(0);
        setCategory("electronics");
        setStock(0);
        setImageUrl("");


    } catch (error) {
        console.error("Error creating product:",error.response?.data || error.message);
        alert("Error creating product: " + (error.response?.data?.message || error.message));
    }   
    }

    return(
        <>
        <form onSubmit={handleSubmit}>
            <div>
                <label>Product Name:</label>
                <input type="text" value={name} onChange={(e)=>setName(e.target.value)} required />
            </div>
            <div>
                <label>Description:</label>
                <textarea value={description} onChange={(e)=>setDescription(e.target.value)} required />
            </div>
            <div>
                <label>Price:</label>
                <input type="number" value={price} onChange={(e)=>setPrice(parseFloat(e.target.value))} required />
            </div>
            <div>   
                <label>Category:</label>    
                <select value={category} onChange={(e)=>setCategory(e.target.value)} required>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>      
                    <option value="books">Books</option>
                    <option value="home">Home</option>
                    <option value="other">Other</option>
                </select>
        </div>

            <div>
                <label>Stock:</label>       
                <input type="number" value={stock} onChange={(e)=>setStock(parseInt(e.target.value))} required />

            </div>
            <div>
                <label>Image URL:</label>
                <input type="url" value={imageUrl} onChange={(e)=>setImageUrl(e.target.value)} />
            </div>
            <div>
                <button type="submit">Create Product</button>
            </div>

        </form>
        </>
    )
}

export default CreateProduct;