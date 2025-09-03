/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export type Header = {
  tnk: string;
};

export type Payload = {
  exp: number;
  sfap_op: string;
};

export class JSONWebToken {
  serializedJWT: string;
  header: Header;
  payload: Payload;
  exp: number;

  constructor(response: { jwt: string }, exp?: number) {
    if (!response.jwt) {
      throw new Error('Invalid JWT response');
    }
    this.serializedJWT = response.jwt;
    [this.header, this.payload] = this.decode();
    this.exp = exp || this.getExpirationTimestamp();
  }

  value(): string {
    return this.serializedJWT;
  }

  isExpired(): boolean {
    const currentTime = Date.now();
    const isExpired = !!(this.exp && currentTime > this.exp);
    return isExpired;
  }

  tnk(): string {
    return this.header.tnk;
  }

  sfapOp(): string {
    return this.payload.sfap_op;
  }

  private getExpirationTimestamp(): number {
    const dateTimestamp = this.convertToDateTimestamp(this.payload.exp);
    const exp = this.addBuffer(dateTimestamp);
    return exp;
  }

  private decode() {
    const splitToken = this.value().split('.');
    if (!splitToken[1]) {
      throw new Error('Unable to split JWT token');
    }
    const base64Header = splitToken[0];
    const base64Payload = splitToken[1];
    const decodedHeader = JSON.parse(
      Buffer.from(base64Header, 'base64').toString(),
    );
    const decodedValue = JSON.parse(
      Buffer.from(base64Payload, 'base64').toString(),
    );

    return [decodedHeader, decodedValue];
  }

  private convertToDateTimestamp(unixTimestamp: number) {
    return unixTimestamp * 1000;
  }

  /**
   * @description Add in a buffer of 30s to prevent the token from expiring while requests are in progress.
   */
  private addBuffer(dateTimestamp: number) {
    return dateTimestamp - 30000;
  }
}
