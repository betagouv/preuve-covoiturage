// @deno-types="npm:@types/node@^20"
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import Stream from "node:stream";
import axiosRetry from "npm:axios-retry@^4";
import axios from "npm:axios@^1.7";
import "npm:reflect-metadata@^0.2";
export { Console } from "node:console";
export { createHash, randomBytes } from "node:crypto";
export {
  createReadStream,
  createWriteStream,
  readdir,
  readFileSync,
  rmSync,
  stat,
} from "node:fs";
export {
  access,
  mkdir,
  readdir as readdirAsync,
  readFile,
  writeFile,
} from "node:fs/promises";
export { hostname, tmpdir } from "node:os";
export { basename, extname, join } from "node:path";
export { URL, URLSearchParams } from "node:url";
export { isMainThread } from "node:worker_threads";
export { faker } from "npm:@faker-js/faker@^8.4";
export { Command, InvalidArgumentError } from "npm:commander@^12.1";
export { parse } from "npm:csv-parse@^5.5";
export type { Options as CsvOptions } from "npm:csv-parse@^5.5";
export { Redis } from "npm:ioredis@^5.3";
export type { RedisKey, RedisOptions } from "npm:ioredis@^5.3";
// @deno-types="npm:@types/pg@^8.11"
import pg from "npm:pg@^8.12";
// @deno-types="npm:@types/pg@^8.11"
export type { PoolClient, PoolConfig } from "npm:pg@^8.12";
// @deno-types="npm:@types/pg-cursor@^2.7"
import Cursor from "npm:pg-cursor@^2.11";
import pino from "npm:pino@^9.1";
// @deno-types="npm:@types/pg-cursor@^2.7"
export type { CursorQueryConfig } from "npm:pg-cursor@^2.11";
// @deno-types="npm:@types/express@^4"
export type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
} from "npm:express@^4";
// @deno-types="npm:@types/express@^4"
import express from "npm:express@^4";
import extractZip from "npm:extract-zip@^2.0";
// @deno-types="npm:@types/lodash@^4"
import _ from "npm:lodash@^4";
import StreamJsonFilter from "npm:stream-json@^1.8/filters/Filter.js";
import StreamJsonStreamArray from "npm:stream-json@^1.8/streamers/StreamArray.js";
// @deno-types="npm:@types/steam-json@^1.7"
export { Readable } from "node:stream";
export { createGunzip } from "node:zlib";
export { AxiosError } from "npm:axios@^1.7";
export type { AxiosInstance } from "npm:axios@^1.7";
export type { FilterOptions as StreamJsonOptions } from "npm:stream-json@^1.8/filters/FilterBase.js";
// @deno-types="npm:@types/node-7z@^2"
export { extractFull } from "npm:node-7z@^3.0";
// @deno-types="npm:@types/node-7z@^2"
export type { SevenZipOptions } from "npm:node-7z@^3";
const { Pool } = pg;
// @deno-types="https://cdn.sheetjs.com/xlsx-0.20.2/package/types/index.d.ts"
import * as xlsx from "https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs";
import excel from "npm:exceljs@^4.4";

import ajvErrors from "npm:ajv-errors@^3";
import addFormats from "npm:ajv-formats@^3";
import ajvKeywords from "npm:ajv-keywords@^5";
import jsonSchemaSecureJson from "npm:ajv@^8.12/lib/refs/json-schema-secure.json" with {
  type: "json",
};
import FormData from "npm:form-data@^4.0";
import mapshaper from "npm:mapshaper@^0.6";

export { Job, Queue, QueueScheduler, Worker } from "npm:bullmq@^1.91";
export type {
  JobsOptions,
  Processor,
  QueueOptions,
  QueueSchedulerOptions,
  WorkerOptions,
} from "npm:bullmq@^1.91";
// @deno-types="npm:@types/uuid@^9"
export { v4 } from "npm:uuid@^9";

export { Ajv } from "npm:ajv@^8.12";
export type {
  ErrorObject,
  Format,
  KeywordDefinition,
  ValidateFunction,
} from "npm:ajv@^8.12";

import net from "node:net";
import type { interfaces } from "npm:inversify@^6";

export { Container, inject, injectable, METADATA_KEY } from "npm:inversify@^6";
export type ContainerInterface = interfaces.Container;
export type Factory<T> = interfaces.Factory<T>;
export type ContainerOptions = interfaces.ContainerOptions;

export { Stringifier, stringify } from "npm:csv-stringify@^6.5";
export { MeiliSearch } from "npm:meilisearch@^0.40";
export type { Config as MeiliSearchConfig } from "npm:meilisearch@^0.40";

import booleanPointInPolygon from "npm:@turf/boolean-point-in-polygon";
import distance from "npm:@turf/distance";
import * as datetz from "npm:date-fns-tz@^3.1";
import * as date from "npm:date-fns@^3.6";
import { fr as datefr } from "npm:date-fns@^3.6/locale";
import pdf from "npm:pdf-lib@^1.17";

export { multiPolygon, point, polygon } from "npm:@turf/helpers";
export type {
  // @ts-ignore
  Feature,
  // @ts-ignore
  MultiPolygon,
  // @ts-ignore
  Polygon,
  // @ts-ignore
  Properties,
} from "npm:@turf/helpers";

export type { S3Object } from "https://deno.land/x/s3_lite_client@0.7.0/client.ts";
export {
  S3Client,
  S3Errors,
} from "https://deno.land/x/s3_lite_client@0.7.0/mod.ts";

export * as Sentry from "npm:@sentry/node@^8.2";

import https from "node:https";
// @deno-types="npm:@types/adm-zip@^0.5"
import AdmZip from "npm:adm-zip@^0.5";
import bodyParser from "npm:body-parser@^1.20";
import RedisStore from "npm:connect-redis@^7.1";
import expressMung from "npm:express-mung@^0.5";
import rateLimit from "npm:express-rate-limit@^7.3";

export {
  Client as PgClient,
  Pool as PgPool,
} from "https://deno.land/x/postgres@v0.19.3/mod.ts";
export { createSign, randomUUID } from "node:crypto";
export { Agent as HttpsAgent } from "node:https";
export { gunzipSync, gzipSync } from "node:zlib";
export type {
  Options as RateLimiterOptions,
  RateLimitRequestHandler,
} from "npm:express-rate-limit@^7.3";
export { latLngToCell } from "npm:h3-js@^4.1";
export type {
  HelperDelegate as HbsHelperDelegate,
  TemplateDelegate as HbsTemplateDelegate,
} from "npm:handlebars@^4.7";
export { isValidBIC, isValidIBAN } from "npm:ibantools@^4.5";
export {
  isValidPhoneNumber,
  parsePhoneNumber,
} from "npm:libphonenumber-js@^1.11";
export type { IFilterXSSOptions } from "npm:xss@^1";
// @deno-types="npm:@types/express-session@^1.18"
import expressSession from "npm:express-session@^1.18";
import promClient from "npm:prom-client@^15.1";
import RateLimitRedisStore from "npm:rate-limit-redis@^4.2";
// @deno-types="npm:@types/cors@^2.8"
import cors from "npm:cors@^2.8";
import xss from "npm:xss@^1";
// @deno-types="npm:@types/jsonwebtoken@^9"
import jwt from "npm:jsonwebtoken@^9";
import mjml2html from "npm:mjml@^4.15";
// @deno-types="npm:@types/nodemailer@^6.4"
import mailer from "npm:nodemailer@^6.9";
// @deno-types="npm:@types/nodemailer@^6.4"
export type {
  Mail,
  Options as MailOptions,
} from "npm:nodemailer@^6.9/lib/mailer";
export {
  _,
  addFormats,
  AdmZip,
  ajvErrors,
  ajvKeywords,
  axios,
  axiosRetry,
  bcrypt,
  bodyParser,
  booleanPointInPolygon,
  cors,
  CryptoJS,
  Cursor,
  date,
  datefr,
  datetz,
  distance,
  excel,
  express,
  expressMung,
  expressSession,
  extractZip,
  FormData,
  fs,
  Handlebars,
  helmet,
  http,
  https,
  jsonSchemaSecureJson,
  jwt,
  mailer,
  mapshaper,
  mjml2html,
  net,
  os,
  path,
  pdf,
  pg,
  pino,
  Pool,
  process,
  promClient,
  rateLimit,
  RateLimitRedisStore,
  RedisStore,
  Stream,
  StreamJsonFilter,
  StreamJsonStreamArray,
  xlsx,
  xss,
};
// @deno-types="npm:@types/crypto-js@^4"
import http from "node:http";
import CryptoJS from "npm:crypto-js@^4.2";
// @deno-types="npm:@types/bcryptjs@^2"
import bcrypt from "npm:bcryptjs@^2.4";
import Handlebars from "npm:handlebars@^4.7";
import helmet from "npm:helmet@^7.1";
