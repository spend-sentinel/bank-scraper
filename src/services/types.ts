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
  ReportedToBot: boolean
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