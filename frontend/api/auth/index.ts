// Auth domain barrel – re-exports everything consumers need.
export { authService } from './auth.service';
export type {
  AuthUser,
  UserType,
  LoginRequest,
  LoginResponseData,
  RefreshTokenResponseData,
  LogoutResponseData,
  LoginResponse,
  RefreshTokenResponse,
  LogoutResponse,
} from './auth.types';
