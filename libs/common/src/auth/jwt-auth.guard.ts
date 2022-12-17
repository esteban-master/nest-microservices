// import { NatsJetStreamClient } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
// import { NatsJetStreamClient } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { NatsJetStreamClient } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import {
  CanActivate,
  ExecutionContext,
  // Inject,
  // Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
// import { ClientProxy } from '@nestjs/microservices';
// import { ClientProxy } from '@nestjs/microservices';
import { catchError, Observable, tap } from 'rxjs';
// import { AUTH } from './auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private client: NatsJetStreamClient) {}
  // constructor(@Inject(AUTH) private client: ClientProxy) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const authentication = this.getAuthentication(context);
    console.log('MMMMMMMMMM: ', authentication);
    this.client
      .send('validate_user', {
        Authentication: authentication,
      })
      .pipe(
        tap((res) => {
          console.log('RESSSSSSSSSSSSSSSSSSSSSS: ', res);
          this.addUser(res, context);
        }),
        catchError(() => {
          throw new UnauthorizedException();
        }),
      );
    return true;
  }

  private getAuthentication(context: ExecutionContext) {
    let authentication: string;
    if (context.getType() === 'rpc') {
      authentication = context.switchToRpc().getData().Authentication;
    } else if (context.getType() === 'http') {
      authentication = context.switchToHttp().getRequest()
        .cookies?.Authentication;
    }
    if (!authentication) {
      throw new UnauthorizedException(
        'No value was provided for Authentication',
      );
    }
    return authentication;
  }

  private addUser(user: any, context: ExecutionContext) {
    if (context.getType() === 'rpc') {
      context.switchToRpc().getData().user = user;
    } else if (context.getType() === 'http') {
      context.switchToHttp().getRequest().user = user;
    }
  }
}
