import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import jwt, {
  JwtHeader,
  JwtPayload,
  SigningKeyCallback,
  VerifyOptions,
} from 'jsonwebtoken';
import jwksClient, { SigningKey } from 'jwks-rsa';
import { UserAttribute } from './interface/user-attribute';

@Injectable()
export class AuthService {
  async getUserAttributeFromAuthorization(
    authorization: string | undefined,
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

  async verifyAdminAuthorization(
    authorization: string | undefined,
  ): Promise<void> {
    const decodedToken = await this.verifyAuthorization(authorization);

    if (decodedToken.azp !== process.env.ADMIN_KEYCLOAK_CLIENT_ID) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async verifyAuthorization(
    authorization: string | undefined,
  ): Promise<JwtPayload> {
    // ヘッダが無い場合に split で TypeError（500）にならないよう、先に 401 を返す
    if (!authorization) {
      throw new UnauthorizedException('Authorization header is required');
    }
    const [type, token, ...rest] = authorization.split(' ');
    if (type !== 'Bearer' || !token || rest.length > 0) {
      throw new UnauthorizedException('Invalid token');
    }

    const issuer = process.env.KEYCLOAK_CLIENT_ISSUER;
    if (!issuer) {
      throw new InternalServerErrorException(
        'KEYCLOAK_CLIENT_ISSUER is not set',
      );
    }

    const url = issuer + '/.well-known/openid-configuration';
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
      // Keycloak の署名アルゴリズム（RS256）と発行者を固定し、他の realm や alg を受け付けない
      const options: VerifyOptions = { algorithms: ['RS256'], issuer: issuer };
      jwt.verify(token, getKey, options, (err, decoded) => {
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
