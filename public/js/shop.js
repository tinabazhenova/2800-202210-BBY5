async function refreshShop() {
  try {
    let response = await fetch("/getShopItems", {
      method: "GET",
      headers: {
        "Accept": 'application/json',
        "Content-Type": 'application/json'
      }
    });
    let parsed = await response.json();
    document.getElementById("itemList").innerHTML = ""; // need to empty the list first
    parsed.itemList.forEach(item => {
      let itemTemplate = document.getElementById("itemTemplate").content.cloneNode(true);
      itemTemplate.querySelector(".itemName").innerHTML = item.item_name;
      itemTemplate.querySelector(".itemImage").src = ""; //i.item_image;
      itemTemplate.querySelector(".addToCart").addEventListener("click", () => shopItem(item, 1));
      document.getElementById("itemList").appendChild(itemTemplate);
    });
  } catch (error) {
    console.log(error);
  }
}

async function refreshCart() {
  try {
    let response = await fetch("/getCartItems", {
      method: "GET",
      headers: {
        "Accept": 'application/json',
        "Content-Type": 'application/json'
      }
    });
    let parsed = await response.json();
    document.getElementById("cartContainer").innerHTML = ""; // need to empty the list first
    parsed.cartList.forEach(item => {
      console.log(item);
      appendToCart(item);
    });
  } catch (error) {
    console.log(error);
  }
}

async function shopItem(item, quantity) {
  try {
    let response = await fetch("/shopItem", {
      method: "POST",
      headers: {
        "Accept": 'application/json',
        "Content-Type": 'application/json'
      },
      body: JSON.stringify({itemID: item.ID, quantity: quantity})
    });
    appendToCart(item);
  } catch (error) {
    console.log(error);
  }
}

function appendToCart(item) {
  let cartItemTemplate = document.getElementById("cartItemTemplate").content.cloneNode(true);
  cartItemTemplate.querySelector(".cartItemContainer").id = "cartItem" + item.ID
  cartItemTemplate.querySelector(".itemName").innerHTML = item.item_name;
  cartItemTemplate.querySelector(".itemImage").src = ""; //i.item_image;
  cartItemTemplate.querySelector(".removeFromCart").addEventListener("click", () => removeItemFromCart(item));
  document.getElementById("cartContainer").appendChild(cartItemTemplate);
}

async function removeItemFromCart(item) {
  try {
    let response = await fetch("/removeItemFromCart", {
      method: "POST",
      headers: {
        "Accept": 'application/json',
        "Content-Type": 'application/json'
      },
      body: JSON.stringify({itemID: item.item_ID})
    });
    document.getElementById("cartItem" + item.ID).remove();
  } catch (error) {
    console.log(error);
  }
}

async function emptyCart() {
  try {
    let response = await fetch("/emptyCart", {
      method: "POST",
      headers: {
        "Accept": 'application/json',
        "Content-Type": 'application/json'
      }
    });
  } catch (error) {
    console.log(error);
  }
}

let modal = document.getElementById("modalBackground");

document.getElementById("cencelOrder").addEventListener("click", e => {
  modal.style.display = "block";
});

window.onclick = (event) => {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

document.getElementById("saveCart").addEventListener("click", () => {
  window.location.href = "/main";
});

document.getElementById("discardCart").addEventListener("click", () => {
  emptyCart();
  window.location.href = "/main";
});

document.getElementById("cancelCancel").addEventListener("click", () => {
  modal.style.display = "none";
});

refreshShop();
refreshCart();