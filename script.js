// Define the API endpoints
const usersUrl = 'https://fakestoreapi.com/users';
const cartsUrl = 'https://fakestoreapi.com/carts/?startdate=2000-01-01&enddate=2023-04-07';
const productsUrl = 'https://fakestoreapi.com/products';

// Function to fetch data from a given URL
async function fetchData(url) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching data from ${url}: ${error}`);
        return null;
    }
}

// Function to calculate the total value of products by category
function getCategoryTotals(products) {
    const categoryTotals = {};

    products.forEach((product) => {
        const category = product.category;
        const price = product.price;

        if (categoryTotals[category]) {
            categoryTotals[category] += price;
        } else {
            categoryTotals[category] = price;
        }
    });

    return categoryTotals;
}

// Function to find the cart with the highest value and its owner's full name
function findHighestValueCart(carts, users, products) {
    let highestValue = 0;
    let highestValueCart = null;
    let highestValueOwner = null;

    const productLookup = {};
    products.forEach((product) => {
        productLookup[product.id] = product;
    });

    carts.forEach((cart) => {
        let cartValue = 0;
        cart.products.forEach((cartItem) => {
            const productId = cartItem.productId;
            const quantity = cartItem.quantity;
            const product = productLookup[productId];
            cartValue += product.price * quantity;
        });

        if (cartValue > highestValue) {
            highestValue = cartValue;
            highestValueCart = cart;

            const user = users.find((user) => user.id === cart.userId);
            highestValueOwner = `${user.name.firstname} ${user.name.lastname}`;
        }
    });

    return {
        highestValueCart,
        highestValue,
        highestValueOwner
    };
}

// Haversine formula to calculate the great-circle distance between two points
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

// Function to find the two users living furthest away from each other
function findFurthestUsers(users) {
    let maxDistance = 0;
    let furthestUsers = null;

    for (let i = 0; i < users.length; i++) {
        for (let j = i + 1; j < users.length; j++) {
            const user1 = users[i];
            const user2 = users[j];
            const distance = haversineDistance(
              user1.address.geolocation.lat,
              user1.address.geolocation.long,
              user2.address.geolocation.lat,
              user2.address.geolocation.long
          );

          if (distance > maxDistance) {
              maxDistance = distance;
              furthestUsers = [user1, user2];
          }
      }
  }

  return {
      furthestUsers,
      maxDistance
  };
}

// Function to retrieve and process user, product, and cart data
async function retrieveData() {
  const users = await fetchData(usersUrl);
  const carts = await fetchData(cartsUrl);
  const products = await fetchData(productsUrl);

  if (users && carts && products) {
      const categoryTotals = getCategoryTotals(products);
      console.log('Category Totals:', categoryTotals);

      const { highestValueCart, highestValue, highestValueOwner } = findHighestValueCart(carts, users, products);
      console.log('Highest value cart:', highestValueCart);
      console.log('Highest value:', highestValue);
      console.log("Highest value cart owner's full name:", highestValueOwner);

      const { furthestUsers, maxDistance } = findFurthestUsers(users);
      console.log('Furthest users:', furthestUsers);
      console.log('Max distance between furthest users (km):', maxDistance);
  } else {
      console.error('Failed to retrieve data from one or more API endpoints');
  }
}

// Retrieve and process data
retrieveData();