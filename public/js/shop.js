let total = {B: 0, X: 0, Y: 0, Z: 0};

async function refreshUserPoints() {
  try {
    let response = await fetch("/getUserPoints", {
      method: "GET",
      headers: {
        "Accept": 'application/json',
        "Content-Type": 'application/json'
      }
    });
    let parsed = await response.json();
    document.getElementById("userPoints").innerHTML = `B: ${parsed.points.bbscore} / X: ${parsed.points.xscore} / Y: ${parsed.points.yscore} / Z: ${parsed.points.zscore}`;
  } catch (error) {
    console.log(error);
  }
}

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
      appendToShop(item);
    });
  } catch (error) {
    console.log(error);
  }
}

function appendToShop(item) {
  let itemTemplate = document.getElementById("itemTemplate").content.cloneNode(true);
  itemTemplate.querySelector(".itemImage").src = `/imgs/item/item_image${item.ID}.png`;
  itemTemplate.querySelector(".itemName").innerHTML = item.name;
  itemTemplate.querySelector(".itemDescription").innerHTML = item.description;
  itemTemplate.querySelector(".itemPrice").innerHTML = `${item.price} ${item.type}-points`;
  let selector = itemTemplate.querySelector(".itemQuantity");
  itemTemplate.querySelector(".itemMinus").addEventListener("click", () => setQuantity(selector, -1));
  itemTemplate.querySelector(".itemQuantity").addEventListener("change", () => setQuantity(selector, 0));
  itemTemplate.querySelector(".itemPlus").addEventListener("click", () => setQuantity(selector, 1));
  itemTemplate.querySelector(".addToCart").addEventListener("click", () => addToCart(item, selector));
  document.getElementById("itemList").appendChild(itemTemplate);
}

function setQuantity(selector, quantity) {
  let num = Math.min(Math.max((selector.value*1 + quantity), 0), 100); // *1 so that it adds numbers instead of concatenating
  selector.value = num;
}

function cramp(num) {
  return ;  // set num >= 0 && num <= 100
}

async function addToCart(item, quantity) {
  try {
    fetch("/addToCart", {
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
    total.B = total.X = total.Y = total.Z = 0;
    parsed.cartList.forEach(item => {
      appendToCart(item);
      let subtotal = item.price * item.quantity
      switch (item.type) {
        case 'B':
          total.B += subtotal;
          break;
        case 'X':
          total.X += subtotal;
          break;
        case 'Y':
          total.Y += subtotal;
          break;
        case 'Z':
          total.Z += subtotal;
          break;
      }
    });
    refreshTotal();
  } catch (error) {
    console.log(error);
  }
}

function refreshTotal() {
  document.getElementById("cartTotalPriceValueB").innerHTML = total.B + "B";
  document.getElementById("cartTotalPriceValueX").innerHTML = total.X + "X";
  document.getElementById("cartTotalPriceValueY").innerHTML = total.Y + "Y";
  document.getElementById("cartTotalPriceValueZ").innerHTML = total.Z + "Z";
}

function appendToCart(item) {
  let cartItemTemplate = document.getElementById("cartItemTemplate").content.cloneNode(true);
  cartItemTemplate.querySelector(".cartItemContainer").id = `cartItem${item.ID}`;
  cartItemTemplate.querySelector(".cartItemName").innerHTML = `${item.name}`;
  if (item.quantity > 1) {
    cartItemTemplate.querySelector(".cartItemName").innerHTML += ` x ${item.quantity}`;
  }
  cartItemTemplate.querySelector(".cartItemPrice").innerHTML = `${item.price * item.quantity} ${item.type}-points`;
  cartItemTemplate.querySelector(".cartItemImage").src = `/imgs/item/item_image${item.ID}.png`;
  cartItemTemplate.querySelector(".removeFromCart").addEventListener("click", () => removeFromCart(item));
  document.getElementById("cartItemList").appendChild(cartItemTemplate);
}

async function removeFromCart(item) {
  try {
    fetch("/removeFromCart", {
      method: "POST",
      headers: {
        "Accept": 'application/json',
        "Content-Type": 'application/json'
      },
      body: JSON.stringify({itemID: item.ID})
    });
    refreshCart();
  } catch (error) {
    console.log(error);
  }
}

async function emptyCart() {
  try {
    fetch("/emptyCart", {
      method: "POST",
      headers: {
        "Accept": 'application/json',
        "Content-Type": 'application/json'
      }
    });
    document.getElementById("cartItemList").innerHTML = "";
    total.B = total.X = total.Y = total.Z = 0;
    refreshTotal();
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
      body: JSON.stringify({total: total})
    });
    let parsed = await response.json();
    if (parsed.approved) {
      emptyCart();
      refreshUserPoints()
      document.getElementById("cartMessage").innerHTML = "Approved. Thank you!";
    } else {
      document.getElementById("cartMessage").innerHTML = parsed.errorMessage;
    }
  } catch (error) {
    console.log(error);
  }
}

// assign buttons and modals
let modal = document.getElementById("modalBackground");
let cart = document.getElementById("cartContainer");

document.getElementById("viewCart").onclick = () => cart.style.display = "block";
document.getElementById("closeCart").onclick = () => {
  cart.style.display = "none";
  document.getElementById("cartMessage").innerHTML = "";
}
document.getElementById("purchaseCart").onclick = () => purchaseCart();

document.getElementById("backButton").onclick = () => {
  if (document.getElementById("cartItemList").innerHTML == "") {
    window.location.href = "/main";
  } else {
    modal.style.display = "block"
  }
};

window.onclick = (event) => {if (event.target == modal) modal.style.display = "none"};

document.getElementById("saveCart").onclick = () => window.location.href = "/main";
document.getElementById("discardCart").onclick = () => {
  emptyCart();
  window.location.href = "/main";
};
document.getElementById("cancelCancel").onclick = () => modal.style.display = "none";

refreshUserPoints();
refreshShop();
refreshCart();