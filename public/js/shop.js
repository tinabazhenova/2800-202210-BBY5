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
      itemTemplate.querySelector(".itemImage").src = `/imgs/item/item_image${item.ID}.png`;
      itemTemplate.querySelector(".itemName").innerHTML = item.name;
      itemTemplate.querySelector(".itemDescription").innerHTML = item.description;
      itemTemplate.querySelector(".itemPrice").innerHTML = `${item.price} points`;
      let selector = itemTemplate.querySelector(".itemQuantity");
      itemTemplate.querySelector(".itemMinus").addEventListener("click", () => setQuantity(selector, -1));
      itemTemplate.querySelector(".itemPlus").addEventListener("click", () => setQuantity(selector, 1));
      itemTemplate.querySelector(".addToCart").addEventListener("click", () => shopItem(item, selector));
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
    document.getElementById("cartItemList").innerHTML = ""; // need to empty the list first
    let total = 0;
    parsed.cartList.forEach(item => {
      let subtotal = item.price * item.quantity;
      total += subtotal;
      appendToCart(item, subtotal);
    });
    document.getElementById("cartTotalPriceValue").innerHTML = total;
  } catch (error) {
    console.log(error);
  }
}

function setQuantity(selector, quantity) {
  let num = selector.value*1 + quantity; // *1 so that it adds numbers instead of concatenating
  num = Math.min(Math.max(num, 0), 100); // set num >= 0 && num <= 100
  selector.value = num;
}

async function shopItem(item, quantity) {
  try {
    let response = await fetch("/shopItem", {
      method: "POST",
      headers: {
        "Accept": 'application/json',
        "Content-Type": 'application/json'
      },
      body: JSON.stringify({itemID: item.ID, quantity: quantity.value})
    });
    refreshCart();
  } catch (error) {
    console.log(error);
  }
}

function appendToCart(item, subtotal) {
  let cartItemTemplate = document.getElementById("cartItemTemplate").content.cloneNode(true);
  cartItemTemplate.querySelector(".cartItemContainer").id = `cartItem${item.ID}`;
  cartItemTemplate.querySelector(".cartItemName").innerHTML = `${item.name}`;
  if (item.quantity > 1) {
    cartItemTemplate.querySelector(".cartItemName").innerHTML += ` x ${item.quantity}`;
  }
  cartItemTemplate.querySelector(".cartItemPrice").innerHTML = `${subtotal} points`;
  cartItemTemplate.querySelector(".cartItemImage").src = `/imgs/item/item_image${item.ID}.png`;
  cartItemTemplate.querySelector(".removeFromCart").addEventListener("click", () => removeItemFromCart(item));
  document.getElementById("cartItemList").appendChild(cartItemTemplate);
}

async function removeItemFromCart(item) {
  try {
    let response = await fetch("/removeItemFromCart", {
      method: "POST",
      headers: {
        "Accept": 'application/json',
        "Content-Type": 'application/json'
      },
      body: JSON.stringify({itemID: item.ID})
    });
    document.getElementById("cartTotalPriceValue").innerHTML -= item.price * item.quantity;
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

async function purchaseCart() {
  try {
    let response = await fetch("/purchaseCart", {
      method: "POST",
      headers: {
        "Accept": 'application/json',
        "Content-Type": 'application/json'
      },
      body: JSON.stringify({total: document.getElementById("cartTotalPriceValue").innerHTML})
    });
    let parsed = await response.json();
    if (parsed.approved) {
      emptyCart();
      document.getElementById("cartMessage").innerHTML = "Approved. Thank you for your purchase!";
    } else {
      document.getElementById("cartMessage").innerHTML = parsed.errorMessage;
    }
  } catch (error) {
    console.log(error);
  }
}

let modal = document.getElementById("modalBackground");
let cart = document.getElementById("cartContainer");

document.getElementById("viewCart").onclick = () => cart.style.display = "block";
document.getElementById("closeCart").onclick = () => cart.style.display = "none";
document.getElementById("purchaseCart").onclick = () => purchaseCart();

document.getElementById("cencelOrder").onclick = () => modal.style.display = "block";
window.onclick = (event) => {if (event.target == modal) modal.style.display = "none"};

document.getElementById("saveCart").onclick = () => window.location.href = "/main";
document.getElementById("discardCart").onclick = () => {
  emptyCart();
  window.location.href = "/main";
};
document.getElementById("cancelCancel").onclick = () => modal.style.display = "none";

refreshShop();
refreshCart();