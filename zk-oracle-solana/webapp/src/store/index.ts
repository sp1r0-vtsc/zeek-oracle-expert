import { configureStore, createSlice } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Create placeholder slices until actual implementations are available
const expertSlice = createSlice({
  name: 'expert',
  initialState: { 
    isLoading: false,
    data: null,
    error: null
  },
  reducers: {}
});

const dataSlice = createSlice({
  name: 'data',
  initialState: {
    isLoading: false,
    records: [],
    error: null
  },
  reducers: {}
});

const validationSlice = createSlice({
  name: 'validation',
  initialState: {
    isLoading: false,
    validations: [],
    error: null
  },
  reducers: {}
});

const trustScoreSlice = createSlice({
  name: 'trustScore',
  initialState: {
    isLoading: false,
    scores: [],
    error: null
  },
  reducers: {}
});

export const store = configureStore({
  reducer: {
    expert: expertSlice.reducer,
    data: dataSlice.reducer,
    validation: validationSlice.reducer,
    trustScore: trustScoreSlice.reducer,
  },
});

// Typed hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
