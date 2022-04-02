import create from 'zustand';
import { records, store } from './records-store';

export const useRecords = create(store);
export const Setup = records.Setup;
export const Login = records.Login;
