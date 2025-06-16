"use client"

import { createContext, useContext, useState, useEffect } from "react"

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [cartTotal, setCartTotal] = useState(0)

  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem("cart")
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart)
        setCartItems(parsedCart)
      } catch (error) {
        console.error("Error parsing cart from localStorage:", error)
        setCartItems([])
      }
    }
  }, [])

  // Update localStorage and calculate total whenever cart changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cartItems))

      const total = cartItems.reduce((sum, item) => {
        return sum + item.price * item.quantity
      }, 0)

      setCartTotal(total)
    } else {
      localStorage.removeItem("cart")
      setCartTotal(0)
    }
  }, [cartItems])

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      // Use _id as primary identifier, fallback to id
      const productId = product._id || product.id

      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex((item) => {
        const itemId = item._id || item.id
        return itemId === productId
      })

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        }
        return updatedItems
      } else {
        // Add new item if it doesn't exist - ensure it has both _id and id for consistency
        return [
          ...prevItems,
          {
            ...product,
            quantity,
            id: productId, // Ensure id is set for consistency
            _id: productId, // Ensure _id is set for consistency
          },
        ]
      }
    })
  }

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        const itemId = item._id || item.id
        return itemId === productId ? { ...item, quantity } : item
      }),
    )
  }

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => {
        const itemId = item._id || item.id
        return itemId !== productId
      }),
    )
  }

  // Clear cart
  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem("cart")
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        itemCount: cartItems.reduce((count, item) => count + item.quantity, 0),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
