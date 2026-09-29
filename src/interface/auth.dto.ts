
import type { UserDTO } from "./user.dto";

export interface AuthenticationDTO  {
  user:UserDTO;
}
export interface recoverDTO {
  secretKey: string
}