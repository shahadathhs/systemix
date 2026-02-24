/**
 * Tests for @systemix/token/signed – HMAC encode/decode/verify.
 */
import { createRunner } from '@systemix/runner';
import {
  encodeSigned,
  decodeSigned,
  verifySigned,
} from '../dist/signed/index.js';

export const { run, getCounts } = createRunner(
  async ({ assert, assertThrows, assertThrowsAsync }) => {
    const secret = 'my-secret-key-for-hmac';
    const verifyOpts = (opts = {}) => ({ algorithms: ['HS256'], ...opts });

    const token = await encodeSigned({ userId: '123', role: 'admin' }, secret);
    assert(typeof token === 'string', 'encodeSigned returns string');
    assert(token.split('.').length === 3, 'token has 3 parts');

    const decoded = decodeSigned(token);
    assert(decoded.header.alg === 'HS256', 'decoded header has alg');
    assert(decoded.payload.userId === '123', 'decoded payload correct');
    assert(decoded.payload.role === 'admin', 'decoded payload has role');

    const verified = await verifySigned(token, secret, verifyOpts());
    assert(verified.userId === '123', 'verifySigned returns payload');

    await assertThrowsAsync(
      () => verifySigned(token, 'wrong-secret', verifyOpts()),
      'verifySigned throws on wrong secret',
    );

    const tokenWithExp = await encodeSigned({ foo: 'bar' }, secret, {
      expiresIn: -1,
    });
    await assertThrowsAsync(
      () => verifySigned(tokenWithExp, secret, verifyOpts()),
      'verifySigned throws on expired token',
    );

    const tokenWithNbf = await encodeSigned({ foo: 'bar' }, secret, {
      notBefore: 999999,
    });
    await assertThrowsAsync(
      () => verifySigned(tokenWithNbf, secret, verifyOpts()),
      'verifySigned throws on nbf in future',
    );

    const tokenWithTolerance = await encodeSigned({ foo: 'bar' }, secret, {
      expiresIn: 5,
    });
    const toleranceResult = await verifySigned(
      tokenWithTolerance,
      secret,
      verifyOpts({ clockTolerance: 10 }),
    );
    assert(
      typeof toleranceResult === 'object',
      'clockTolerance allows slight skew',
    );

    const tokenWithClaims = await encodeSigned({ custom: 'data' }, secret, {
      issuer: 'my-app',
      audience: 'my-api',
      subject: 'user-1',
      tokenId: true,
    });
    const verifiedClaims = await verifySigned(
      tokenWithClaims,
      secret,
      verifyOpts({
        issuer: 'my-app',
        audience: 'my-api',
        subject: 'user-1',
      }),
    );
    assert(verifiedClaims.iss === 'my-app', 'issuer claim set');
    assert(verifiedClaims.aud === 'my-api', 'audience claim set');
    assert(verifiedClaims.sub === 'user-1', 'subject claim set');
    assert(
      typeof verifiedClaims.jti === 'string' && verifiedClaims.jti.length > 0,
      'jti auto-generated',
    );

    await assertThrowsAsync(
      () =>
        verifySigned(
          tokenWithClaims,
          secret,
          verifyOpts({ issuer: 'wrong-issuer' }),
        ),
      'verifySigned throws on issuer mismatch',
    );

    await assertThrowsAsync(
      () => verifySigned(token, secret, { algorithms: [] }),
      'verifySigned throws when algorithms empty',
    );

    assertThrows(
      () => decodeSigned('invalid'),
      'decodeSigned throws on malformed token',
    );
    assertThrows(
      () => decodeSigned('a.b'),
      'decodeSigned throws on 2-part token',
    );
    assertThrows(() => decodeSigned(''), 'decodeSigned throws on empty string');
  },
);
