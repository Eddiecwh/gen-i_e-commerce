// Verable Declarations
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
const bannerBtn = document.querySelector(".banner-btn");

// Cart items
let cart = [];
// buttons
let buttonsDOM = [];

class Products {
  async getProducts() {
    try {
      let result = await fetch("items.json");
      let data = await result.json();
      let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });

      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// Display products
class UI {
  displayProducts(products) {
    let result = "";

    products.forEach((product) => {
      console.log(product.image);
      result += `
                <!-- Single product -->
                <article class="product">
                  <div class="img-container">
                    <img src="${product.image}" class="product-img"/>
                    <button class="bag-btn" data-id=${product.id}>
                      <i class="fas fa-shopping-cart"> Add to Bag</i> 
                    </button>
                  </div>
                  <h3>${product.title}</h3>
                  <h4>${product.price}</h4>
                </article>
              <!-- end single product-->
              `;
    });
    productsDOM.innerHTML = result;
  }

  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "Already Selected";
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        console.log(event);
        event.target.innerText = "Already Selected";
        event.target.disabled = true;
        // Get product from product
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        console.log(cartItem);
        // add product to the cart
        cart = [...cart, cartItem];
        // Save the cart into local storage
        Storage.saveCart(cart);
        // Set cart values
        this.setCartValues(cart);
        // display cart item
        this.addCartItem(cartItem);
        // Show the cart
        this.showCart();
      });
    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }

  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <img src="${item.image}" alt="" />
            <div>
              <h4>${item.title}</h4>
              <h5>$${item.price} USD</h5>
              <span class="remove-item" data-id="${item.id}">Remove</span>
            </div>
            <div>
              <i class="fas fa-chevron-up" data-id="${item.id}"></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fas fa-chevron-down" data-id="${item.id}"></i>
            </div>
      `;
    cartContent.appendChild(div);
  }

  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
    bannerBtn.addEventListener("click", this.scrollToProducts);
    
  }

  scrollToProducts() {
      
  }

  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }

  populateCart(cart) {
    cart.forEach((item) => {
      this.addCartItem(item);
    });
  }

  cartLogic() {
    // Clear cart button
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    // Cart functionality
    cartContent.addEventListener("click", (event) => {
      // console.log(event.target);
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        console.log(removeItem);
        let id = removeItem.dataset.id;

        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        console.log(addAmount);
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount += 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        console.log(lowerAmount);
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount -= 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }

  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    console.log(cartContent.children);

    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }

    this.hideCart();
  }

  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"> Add to Bag</i>`;
  }

  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

// Local Storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.addEventListener(
    "load",
    function (e) {
      document.body.style.display = "block";
      var tl = new TimelineMax();

      tl.staggerFrom(
        ".hero",
        2,
        {
          opacity: 0,
          scale: 1.0,
          ease: Power2.easeOut,
        },
        2.0
      );

      tl.staggerFrom(
        ".banner .title1",
        2,
        {
          opacity: 0,
          scale: 1.0,
          ease: Power2.easeOut,
        },
        2.0
      );


      tl.staggerFrom(
        ".banner .title2",
        2,
        {
          opacity: 0,
          scale: 1.0,
          ease: Power2.easeOut,
        },
        2.0
      );

      tl.staggerFrom(
        ".banner-btn",
        1.0,
        {
          opacity: 0,
          scale: 1.0,
          ease: Power2.easeOut,
        },
        0
      );

      // show .from() initially
      tl.staggerFrom(
        ".navbar",
        1.0,
        {
          opacity: 0,
          y: -40,
          ease: Power2.easeInOut,
        },
        1.0,
        "-=2"
      );
    },
    false
  );

  const ui = new UI();
  const products = new Products();

  ui.setupAPP();

  // Get all products
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
