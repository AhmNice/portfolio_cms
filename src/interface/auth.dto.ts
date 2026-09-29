import { jwtSignReturnType } from "./session.interface.js";
import { UserDTO } from "./user.dto.js";

export interface AuthenticationDTO extends jwtSignReturnType {
  user:UserDTO;
}
export interface recoverDTO {
  secretKey: string
}