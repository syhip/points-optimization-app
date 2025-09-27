import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import database from '../../database/browser-db';

interface Merchant {
  id: string;
  name: string;
  category?: string;
  latitude: number;
  longitude: number;
  address?: string;
  chain_name?: string;
  created_at: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  icon_url?: string;
  is_active: number;
  created_at: string;
}

interface PointHistory {
  id: string;
  user_id: string;
  merchant_id?: string;
  payment_method_id?: string;
  amount: number;
  points_earned: number;
  transaction_date: string;
  transaction_type: 'earn' | 'redeem' | 'bonus' | 'expire';
  description?: string;
  merchant?: Merchant;
  payment_method?: PaymentMethod;
}

interface PointsStats {
  totalPoints: number;
  monthlyPoints: number;
  transactionCount: number;
  averageMultiplier?: number;
}

interface PointsState {
  history: PointHistory[];
  stats: PointsStats | null;
  monthlyTrends: any[];
  loading: boolean;
  error: string | null;
}

const initialState: PointsState = {
  history: [],
  stats: null,
  monthlyTrends: [],
  loading: false,
  error: null,
};

// 获取积分历史
export const fetchPointsHistory = createAsyncThunk(
  'points/fetchHistory',
  async ({ userId, limit = 50 }: { userId: string; limit?: number }) => {
    try {
      const data = await database.getPointsHistory(userId, limit);
      return data;
    } catch (error) {
      throw new Error(error.message || '获取积分历史失败');
    }
  }
);

// 添加积分记录
export const addPointsRecord = createAsyncThunk(
  'points/addRecord',
  async ({
    userId,
    merchantId,
    paymentMethodId,
    amount,
    pointsEarned,
  }: {
    userId: string;
    merchantId: string;
    paymentMethodId: string;
    amount: number;
    pointsEarned: number;
  }) => {
    try {
      const data = await database.addPointsRecord(userId, merchantId, paymentMethodId, amount, pointsEarned);
      return data;
    } catch (error) {
      throw new Error(error.message || '添加积分记录失败');
    }
  }
);

// 获取积分统计
export const fetchPointsStats = createAsyncThunk(
  'points/fetchStats',
  async (userId: string) => {
    try {
      const data = await database.getPointsStats(userId);
      // 计算平均倍率
      const averageMultiplier = data.transactionCount > 0 ? data.totalPoints / (data.transactionCount * 100) : 0;
      return { ...data, averageMultiplier };
    } catch (error) {
      throw new Error(error.message || '获取积分统计失败');
    }
  }
);

// 获取月度积分趋势
export const fetchMonthlyTrend = createAsyncThunk(
  'points/fetchMonthlyTrend',
  async (userId: string) => {
    try {
      const data = await database.getMonthlyTrend(userId);
      return data;
    } catch (error) {
      throw new Error(error.message || '获取月度积分趋势失败');
    }
  }
);

const pointsSlice = createSlice({
  name: 'points',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearHistory: (state) => {
      state.history = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取积分历史
      .addCase(fetchPointsHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPointsHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(fetchPointsHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取积分历史失败';
      })
      // 添加积分记录
      .addCase(addPointsRecord.fulfilled, (state, action) => {
        state.history.unshift(action.payload);
      })
      // 获取积分统计
      .addCase(fetchPointsStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPointsStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchPointsStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取积分统计失败';
      })
      // 获取月度积分趋势
      .addCase(fetchMonthlyTrend.fulfilled, (state, action) => {
        state.monthlyTrends = action.payload;
      });
  },
});

export const { clearError, clearHistory } = pointsSlice.actions;
export default pointsSlice.reducer;