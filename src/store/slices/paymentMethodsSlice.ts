import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import database from '../../database/browser-db';

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  icon_url?: string;
  is_active: number;
  created_at: string;
}

interface UserPaymentMethod {
  id: string;
  user_id: string;
  payment_method_id: string;
  payment_method?: PaymentMethod;
  account_info: string;
  is_enabled: number;
  created_at: string;
}

interface PaymentMethodsState {
  availableMethods: PaymentMethod[];
  userMethods: UserPaymentMethod[];
  loading: boolean;
  error: string | null;
}

const initialState: PaymentMethodsState = {
  availableMethods: [],
  userMethods: [],
  loading: false,
  error: null,
};

// 获取所有可用支付方式
export const fetchAvailablePaymentMethods = createAsyncThunk(
  'paymentMethods/fetchAvailable',
  async () => {
    try {
      const data = await database.getPaymentMethods();
      return data;
    } catch (error) {
      throw new Error(error.message || '获取支付方式失败');
    }
  }
);

// 获取用户的支付方式
export const fetchUserPaymentMethods = createAsyncThunk(
  'paymentMethods/fetchUser',
  async (userId: string) => {
    try {
      const data = await database.getUserPaymentMethods(userId);
      return data;
    } catch (error) {
      throw new Error(error.message || '获取用户支付方式失败');
    }
  }
);

// 添加用户支付方式
export const addUserPaymentMethod = createAsyncThunk(
  'paymentMethods/addUser',
  async ({
    userId,
    paymentMethodId,
    accountInfo,
  }: {
    userId: string;
    paymentMethodId: string;
    accountInfo: any;
  }) => {
    try {
      const data = await database.addUserPaymentMethod(userId, paymentMethodId, accountInfo);
      return data;
    } catch (error) {
      throw new Error(error.message || '添加支付方式失败');
    }
  }
);

// 删除用户支付方式
export const removeUserPaymentMethod = createAsyncThunk(
  'paymentMethods/removeUser',
  async (userPaymentMethodId: string) => {
    try {
      await database.removeUserPaymentMethod(userPaymentMethodId);
      return userPaymentMethodId;
    } catch (error) {
      throw new Error(error.message || '删除支付方式失败');
    }
  }
);

const paymentMethodsSlice = createSlice({
  name: 'paymentMethods',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取可用支付方式
      .addCase(fetchAvailablePaymentMethods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailablePaymentMethods.fulfilled, (state, action) => {
        state.loading = false;
        state.availableMethods = action.payload;
      })
      .addCase(fetchAvailablePaymentMethods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取支付方式失败';
      })
      // 获取用户支付方式
      .addCase(fetchUserPaymentMethods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPaymentMethods.fulfilled, (state, action) => {
        state.loading = false;
        state.userMethods = action.payload;
      })
      .addCase(fetchUserPaymentMethods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取用户支付方式失败';
      })
      // 添加用户支付方式
      .addCase(addUserPaymentMethod.fulfilled, (state, action) => {
        state.userMethods.push(action.payload);
      })
      // 删除用户支付方式
      .addCase(removeUserPaymentMethod.fulfilled, (state, action) => {
        state.userMethods = state.userMethods.filter(
          (method) => method.id !== action.payload
        );
      });
  },
});

export const { clearError } = paymentMethodsSlice.actions;
export default paymentMethodsSlice.reducer;