import { Injectable, UnauthorizedException } from '@nestjs/common';
import jwt, { JwtHeader, JwtPayload, SigningKeyCallback } from 'jsonwebtoken';
import jwksClient, { SigningKey } from 'jwks-rsa';
import { UserAttribute } from './interface/user-attribute';

@Injectable()
export class AuthService {
  async getUserAttributesFromAuthorization(
    authorization: string,
  ): Promise<UserAttribute> {
    if (!authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid token');
    }

    const url =
      process.env.KEYCLOAK_CLIENT_ISSUER + '/.well-known/openid-configuration';
    const response = await fetch(url);
    const json = await response.json();
    const client = jwksClient({
      jwksUri: json.jwks_uri,
    });

    function getKey(header: JwtHeader, callback: SigningKeyCallback) {
      client.getSigningKey(header.kid, function (err, key?: SigningKey) {
        if (err) {
          callback(err);
        } else {
          callback(null, key?.getPublicKey());
        }
      });
    }

    const decodedToken = await new Promise<JwtPayload>((resolve, reject) => {
      jwt.verify(
        authorization.replace('Bearer ', ''),
        getKey,
        (err, decoded) => {
          if (err) {
            reject(new UnauthorizedException('Invalid token'));
            return;
          }
          resolve(decoded as JwtPayload);
        },
      );
    });

    const userAttribute: UserAttribute = {
      nickname: decodedToken.nickname,
      age: decodedToken.age,
      address: decodedToken.address,
    };

    return userAttribute;
  }
}
