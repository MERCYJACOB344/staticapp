import React, { useState } from 'react';

function Login() {
  const [message, setMessage] = useState();

  const fetchMessage = async () => {
    try {
      const response = await fetch(`api/GetData`); 
     console.log('response',response)
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
  
      const data = await response.json(); 
  
  
   
      setMessage(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      setMessage('Error fetching data'); 
    }
  };
  
console.log('message',message);
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to My App</h1>
        <button onClick={fetchMessage}>Fetch Message</button>
        <p>{message}</p>
      </header>
    </div>
  );
}

export default Login;
 