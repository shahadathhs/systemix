/**
 * Tests for @systemix/token/signed (RS256) and @systemix/token/rsa.
 */
import { generateKeyPairSync } from 'node:crypto';
import { createRunner } from '@systemix/test';
import {
  encodeSigned,
  decodeSigned,
  verifySigned,
} from '../dist/signed/index.js';
import { signRsa, verifyRsa } from '../dist/rsa/index.js';

export const { run, getCounts } = createRunner(
  async ({ assert, assertThrowsAsync }) => {
    const { publicKey: rsaPublicKey, privateKey: rsaPrivateKey } =
      generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });

    const rsaToken = await encodeSigned({ userId: '456' }, rsaPrivateKey, {
      algorithm: 'RS256',
      expiresIn: 3600,
    });
    assert(typeof rsaToken === 'string', 'encodeSigned RS256 returns string');
    assert(rsaToken.split('.').length === 3, 'RSA token has 3 parts');

    const rsaDecoded = decodeSigned(rsaToken);
    assert(rsaDecoded.header.alg === 'RS256', 'RSA token header has RS256');

    const rsaVerified = await verifySigned(rsaToken, rsaPublicKey, {
      algorithms: ['RS256'],
    });
    assert(rsaVerified.userId === '456', 'verifySigned RS256 returns payload');

    await assertThrowsAsync(
      () =>
        verifySigned(rsaToken, rsaPublicKey, {
          algorithms: ['HS256'],
        }),
      'verifySigned RS256 throws when algorithm not in whitelist',
    );

    const signingInput = 'data.to.sign';
    const rsaSig = await signRsa(signingInput, rsaPrivateKey, 'RS256');
    assert(typeof rsaSig === 'string', 'signRsa returns string');

    const rsaValid = await verifyRsa(
      signingInput,
      rsaSig,
      rsaPublicKey,
      'RS256',
    );
    assert(rsaValid === true, 'verifyRsa returns true for valid signature');

    const rsaInvalid = await verifyRsa(
      'tampered.data',
      rsaSig,
      rsaPublicKey,
      'RS256',
    );
    assert(rsaInvalid === false, 'verifyRsa returns false for tampered data');
  },
);
