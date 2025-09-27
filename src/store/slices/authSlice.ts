import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import database from '../../database/browser-db';

interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  plan: 'free' | 'premium';
  created_at?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface AuthState {
  user: User | null;
  session: any;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  session: null,
  loading: false,
  error: null,
};

// 异步登录
export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // 确保数据库已初始化
      await database.initializeDatabase();
      const result = await database.signIn(email, password);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || '登录失败');
    }
  }
);

// 异步注册
export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, phone, name }: { email: string; password: string; phone: string; name: string }, { rejectWithValue }) => {
    try {
      // 确保数据库已初始化
      await database.initializeDatabase();
      const result = await database.signUp(email, password, phone, name);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || '注册失败');
    }
  }
);

// 异步登出
export const signOut = createAsyncThunk('auth/signOut', async () => {
  // SQLite本地认证，只需清除本地状态
  return Promise.resolve();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setSession: (state, action: PayloadAction<any>) => {
      state.session = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 登录
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.session = action.payload.session;
        state.user = action.payload.user as User;
        // 保存到localStorage
        localStorage.setItem('current_user', JSON.stringify(action.payload.user));
        localStorage.setItem('current_session', JSON.stringify(action.payload.session));
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '登录失败';
      })
      // 注册
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false;
        state.session = action.payload.session;
        state.user = action.payload.user as User;
        // 保存到localStorage
        localStorage.setItem('current_user', JSON.stringify(action.payload.user));
        localStorage.setItem('current_session', JSON.stringify(action.payload.session));
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '注册失败';
      })
      // 登出
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.session = null;
        // 清除localStorage
        localStorage.removeItem('current_user');
        localStorage.removeItem('current_session');
      });
  },
});

export const { setUser, setSession, clearError } = authSlice.actions;
export default authSlice.reducer;