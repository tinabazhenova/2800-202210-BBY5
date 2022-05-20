async function refreshInventory() {
  try {
    let response = await fetch("/getInventoryItems", {
      method: "GET",
      headers: {
        "Accept": 'application/json',
        "Content-Type": 'application/json'
      }
    });
    let parsed = await response.json();
    document.getElementById("itemList").innerHTML = ""; // need to empty the list first
    if (parsed.itemList.length > 0) {
      parsed.itemList.forEach(item => {
        appendToInventory(item);
      });
    } else {
      document.getElementById("inventory").style.display = "none";
    }
  } catch (error) {
    console.log(error);
  }
}

function appendToInventory(item) {
  let itemTemplate = document.getElementById("itemTemplate").content.cloneNode(true);
  itemTemplate.querySelector(".itemImage").src = `/imgs/item/item_image${item.ID}.png`;
  itemTemplate.querySelector(".itemName").innerHTML = `${item.name} x ${item.quantity}`;
  itemTemplate.querySelector(".itemUse").onclick = () => useItem(item, itemTemplate);
  document.getElementById("itemList").appendChild(itemTemplate);
}

async function useItem(item, itemTemplate) {
  try {
    await fetch("/useItem", {
      method: "POST",
      headers: {
        "Accept": 'application/json',
        "Content-Type": 'application/json'
      },
      body: JSON.stringify({item: item})
    });
    refreshInventory();
    refreshProfile();
  } catch (error) {
    console.log(error);
  }
}

async function refreshProfile() {
  try {
    let response, parsed;
    response = await fetch("/getUserLevels", {
      method: "GET",
      headers: {
        "Accept": 'application/json',
        "Content-Type": 'application/json'
      }
    });
    parsed = await response.json();
    document.getElementById("BLevel").innerHTML = parsed.levels.bblevel;
    document.getElementById("XLevel").innerHTML = parsed.levels.xlevel;
    document.getElementById("YLevel").innerHTML = parsed.levels.ylevel;
    document.getElementById("ZLevel").innerHTML = parsed.levels.zlevel;
    response = await fetch("/getUserPoints", {
      method: "GET",
      headers: {
        "Accept": 'application/json',
        "Content-Type": 'application/json'
      }
    });
    parsed = await response.json();
    document.getElementById("BPoint").innerHTML = parsed.points.bbscore;
    document.getElementById("XPoint").innerHTML = parsed.points.xscore;
    document.getElementById("YPoint").innerHTML = parsed.points.yscore;
    document.getElementById("ZPoint").innerHTML = parsed.points.zscore;
  } catch (error) {
    console.log(error);
  }
}

refreshInventory();
refreshProfile();