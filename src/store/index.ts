import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import paymentMethodsSlice from './slices/paymentMethodsSlice';
import merchantsSlice from './slices/merchantsSlice';
import pointsSlice from './slices/pointsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    paymentMethods: paymentMethodsSlice,
    merchants: merchantsSlice,
    points: pointsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;