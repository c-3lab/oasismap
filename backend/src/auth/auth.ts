import { Injectable, UnauthorizedException } from '@nestjs/common';
import jwt, { JwtHeader, JwtPayload, SigningKeyCallback } from 'jsonwebtoken';
import jwksClient, { SigningKey } from 'jwks-rsa';
import { UserAttribute } from './interface/user-attribute';

@Injectable()
export class AuthService {
  async getUserAttributeFromAuthorization(
    authorization: string,
  ): Promise<UserAttribute> {
    const decodedToken = await this.verifyAuthorization(authorization);

    const userAttribute: UserAttribute = {
      nickname: decodedToken.nickname,
      age: decodedToken.age,
      prefecture: decodedToken.prefecture,
      city: decodedToken.city,
    };

    return userAttribute;
  }

  async verifyAdminAuthorization(authorization: string): Promise<void> {
    const decodedToken = await this.verifyAuthorization(authorization);

    if (decodedToken.azp !== process.env.ADMIN_KEYCLOAK_CLIENT_ID) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async verifyAuthorization(authorization: string): Promise<JwtPayload> {
    const [type, token] = authorization.split(' ');
    if (type !== 'Bearer') {
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
      jwt.verify(token, getKey, (err, decoded) => {
        if (err) {
          reject(new UnauthorizedException('Invalid token'));
          return;
        }
        resolve(decoded as JwtPayload);
      });
    });

    return decodedToken;
  }
}
