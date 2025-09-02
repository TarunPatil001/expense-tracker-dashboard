import { configureStore } from '@reduxjs/toolkit'
import expenseManagerReducer from './expenseManagerSlice'

export const store = configureStore({
  reducer: {
    expenseManager: expenseManagerReducer,
  },
})
