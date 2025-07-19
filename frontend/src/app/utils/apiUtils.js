
export async function fetchProblemDetails(data, endpoint) {
  try {
    const res = await fetch(`http://localhost:8000/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      return {}; // or throw an error if you want to handle it differently
    }

    const json = await res.json(); // <-- this is where the promise resolves
    return json;
  } catch (error) {
    console.error("Failed to fetch problem details:", error);
    return {};
  }
}


export async function get(data, endpoint) {
  try {
    const res = await fetch(`http://localhost:8000/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      return {}; 
    }

    const json = await res.json(); 
    return json;
  } catch (error) {
      console.error("Failed to fetch problem details:", error);
    return {};
  }
}