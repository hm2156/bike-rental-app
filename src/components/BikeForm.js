const BikeForm = ({ addBikeCallback }) => {
    const [formData, setFormData] = useState({
      model: '',
      color: '',
      location: '',
      imageUrl: ''
    });
  
    const handleInputChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post('http://localhost:3001/bikes', formData);
        addBikeCallback(response.data.bike); // Update the bike list in parent component
      } catch (error) {
        console.error('Failed to add bike:', error);
      }
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <input name="model" value={formData.model} onChange={handleInputChange} placeholder="Model" required />
        <input name="color" value={formData.color} onChange={handleInputChange} placeholder="Color" required />
        <input name="location" value={formData.location} onChange={handleInputChange} placeholder="Location" required />
        <input name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="Image URL" required />
        <button type="submit">Add Bike</button>
      </form>
    );
  };
  