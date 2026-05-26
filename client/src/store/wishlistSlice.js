import { createSlice } from '@reduxjs/toolkit'

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    total: 0
  },
  reducers: {
    setWishlist: (state, action) => {
      state.items = action.payload?.products || []
      state.total = action.payload?.products?.length || 0
    },
    clearWishlist: (state) => {
      state.items = []
      state.total = 0
    }
  }
})

export const { setWishlist, clearWishlist } = wishlistSlice.actions
export default wishlistSlice.reducer