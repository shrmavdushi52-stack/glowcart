import { createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalPrice: 0,
    totalItems: 0,
    loading: false
  },
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload?.items || []
      state.totalPrice = action.payload?.totalPrice || 0
      state.totalItems = action.payload?.totalItems || 0
    },
    clearCart: (state) => {
      state.items = []
      state.totalPrice = 0
      state.totalItems = 0
    },
    setCartLoading: (state, action) => {
      state.loading = action.payload
    }
  }
})

export const { setCart, clearCart, setCartLoading } = cartSlice.actions
export default cartSlice.reducer