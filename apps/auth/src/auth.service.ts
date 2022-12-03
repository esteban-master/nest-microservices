import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  getHello() {
    return {
      id: 1,
      fullName: 'Esteban Enrique Beltran',
    };
  }
}
