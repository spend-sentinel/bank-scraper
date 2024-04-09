import {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyTypeProviderDefault,
} from "fastify";
import { Server, IncomingMessage, ServerResponse } from "http";

export type Application = FastifyInstance<
  Server<typeof IncomingMessage, typeof ServerResponse>,
  IncomingMessage,
  ServerResponse<IncomingMessage>,
  FastifyBaseLogger,
  FastifyTypeProviderDefault
>;

export type MoneyTransaction = {
  _id?: string;
  TransNum: string;
  Status: number;
  Amount: number;
  Currency: string;
  TransactionDate: string;
  Description: string;
  TransactionMonth: string;
  CardNumber: string;
};

export type MonthlyStatus = {
  year:number;
  month:number;
  status:number;
};

export enum ApprovalStatus {
  denied = 0,
  unspecified = 1,
  approved = 2,
};