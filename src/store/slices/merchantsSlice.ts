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

interface PointRule {
  id: string;
  merchant_id: string;
  payment_method_id: string;
  point_rate: number;
  min_amount: number;
  promotion_type?: string;
  valid_from: string;
  valid_to?: string;
  created_at: string;
  payment_method: PaymentMethod;
}

interface Recommendation {
  merchant_id: string;
  merchant_name: string;
  payment_method_id: string;
  payment_method_name: string;
  point_rate: number;
  estimated_points: number;
  distance?: number;
}

interface MerchantsState {
  nearbyMerchants: Merchant[];
  selectedMerchant: Merchant | null;
  pointRules: PointRule[];
  recommendations: Recommendation[];
  loading: boolean;
  error: string | null;
}

const initialState: MerchantsState = {
  nearbyMerchants: [],
  selectedMerchant: null,
  pointRules: [],
  recommendations: [],
  loading: false,
  error: null,
};

// 获取附近商家
export const fetchNearbyMerchants = createAsyncThunk(
  'merchants/fetchNearby',
  async ({ latitude, longitude, radius = 5 }: { latitude: number; longitude: number; radius?: number }) => {
    try {
      const data = await database.getNearbyMerchants(latitude, longitude, radius);
      return data;
    } catch (error) {
      throw new Error(error.message || '获取附近商家失败');
    }
  }
);

// 获取商家详情
export const fetchMerchantDetails = createAsyncThunk(
  'merchants/fetchDetails',
  async (merchantId: string) => {
    try {
      const data = await database.getMerchantById(merchantId);
      return data;
    } catch (error) {
      throw new Error(error.message || '获取商家详情失败');
    }
  }
);

// 获取商家积分规则
export const fetchMerchantPointRules = createAsyncThunk(
  'merchants/fetchPointRules',
  async (merchantId: string) => {
    try {
      const data = await database.getMerchantPointRules(merchantId);
      return data;
    } catch (error) {
      throw new Error(error.message || '获取积分规则失败');
    }
  }
);

// 获取推荐支付方式
export const fetchRecommendations = createAsyncThunk(
  'merchants/fetchRecommendations',
  async ({ latitude, longitude, userId }: { latitude: number; longitude: number; userId: string }) => {
    try {
      const data = await database.getRecommendations(userId, latitude, longitude);
      return data;
    } catch (error) {
      throw new Error(error.message || '获取推荐失败');
    }
  }
);

const merchantsSlice = createSlice({
  name: 'merchants',
  initialState,
  reducers: {
    setSelectedMerchant: (state, action: PayloadAction<Merchant | null>) => {
      state.selectedMerchant = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearRecommendations: (state) => {
      state.recommendations = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取附近商家
      .addCase(fetchNearbyMerchants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNearbyMerchants.fulfilled, (state, action) => {
        state.loading = false;
        state.nearbyMerchants = action.payload;
      })
      .addCase(fetchNearbyMerchants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取附近商家失败';
      })
      // 获取商家详情
      .addCase(fetchMerchantDetails.fulfilled, (state, action) => {
        state.selectedMerchant = action.payload;
      })
      // 获取积分规则
      .addCase(fetchMerchantPointRules.fulfilled, (state, action) => {
        state.pointRules = action.payload;
      })
      // 获取推荐
      .addCase(fetchRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendations = action.payload;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取推荐失败';
      });
  },
});

export const { setSelectedMerchant, clearError, clearRecommendations } = merchantsSlice.actions;
export default merchantsSlice.reducer;